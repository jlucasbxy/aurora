import type { MultipartFile } from "@fastify/multipart";
import type { FastifyReply, FastifyRequest } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InvoiceDto, QueryInvoiceDto } from "@/application/dtos";
import type { InvoiceService } from "@/application/interfaces/services";
import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";
import { InvoiceController } from "@/infrastructure/http/controllers/invoice.controller";
import type { Parser } from "@/infrastructure/http/parsers";

const mockInvoiceDto: InvoiceDto = {
  id: "01944b1a-0000-7000-8000-000000000001",
  clientNumber: "7202788900",
  referenceMonth: "JAN/2024",
  electricEnergyQty: 100,
  electricEnergyValue: 50.0,
  sceeEnergyQty: 200,
  sceeEnergyValue: 25.0,
  compensatedEnergyQty: 150,
  compensatedEnergyValue: -20.0,
  publicLightingContrib: 10.0,
  electricEnergyConsumption: 300,
  compensatedEnergy: 150,
  totalValueWithoutGD: 85.0,
  gdSavings: -20.0,
  createdAt: new Date().toISOString()
};

describe("InvoiceController", () => {
  const mockInvoiceService: InvoiceService = {
    getAll: vi.fn(),
    processAndSave: vi.fn()
  };

  const mockInvoiceQueryParser: Parser<QueryInvoiceDto> = {
    parse: vi.fn()
  };

  const mockMultipartFileParser: Parser<Promise<Buffer[]>, MultipartFile> = {
    parse: vi.fn()
  };

  const mockSend = vi.fn();
  const mockStatus = vi.fn().mockReturnValue({ send: mockSend });
  const mockReply = {
    status: mockStatus,
    send: mockSend
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.resetAllMocks();
    mockStatus.mockReturnValue({ send: mockSend });
  });

  it("upload: parses file, calls processAndSave, and replies 201 with DTO", async () => {
    const chunk = Buffer.from("pdf-data");
    const mockFile = {} as MultipartFile;
    const mockRequest = {
      file: vi.fn().mockResolvedValue(mockFile),
      query: {}
    } as unknown as FastifyRequest;

    vi.mocked(mockMultipartFileParser.parse).mockResolvedValue([chunk]);
    vi.mocked(mockInvoiceService.processAndSave).mockResolvedValue(
      mockInvoiceDto
    );

    const controller = new InvoiceController(
      mockInvoiceService,
      mockInvoiceQueryParser,
      mockMultipartFileParser
    );
    await controller.upload(mockRequest, mockReply);

    expect(mockMultipartFileParser.parse).toHaveBeenCalledOnce();
    expect(mockInvoiceService.processAndSave).toHaveBeenCalledOnce();
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockSend).toHaveBeenCalledWith(mockInvoiceDto);
  });

  it("list: parses query, calls getAll, and replies 200 with result", async () => {
    const parsedQuery: QueryInvoiceDto = { clientNumber: "7202788900" };
    const paginatedResult = {
      data: [mockInvoiceDto],
      nextCursor: null,
      hasNextPage: false
    };
    const mockRequest = { query: {} } as unknown as FastifyRequest;

    vi.mocked(mockInvoiceQueryParser.parse).mockReturnValue(parsedQuery);
    vi.mocked(mockInvoiceService.getAll).mockResolvedValue(paginatedResult);

    const controller = new InvoiceController(
      mockInvoiceService,
      mockInvoiceQueryParser,
      mockMultipartFileParser
    );
    await controller.list(mockRequest, mockReply);

    expect(mockInvoiceQueryParser.parse).toHaveBeenCalledOnce();
    expect(mockInvoiceService.getAll).toHaveBeenCalledWith(parsedQuery);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockSend).toHaveBeenCalledWith(paginatedResult);
  });

  it("upload: propagates DomainError from processAndSave without swallowing it", async () => {
    const chunk = Buffer.from("pdf-data");
    const mockFile = {} as MultipartFile;
    const mockRequest = {
      file: vi.fn().mockResolvedValue(mockFile),
      query: {}
    } as unknown as FastifyRequest;
    const domainError = new DomainError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      "LLM rate limited"
    );

    vi.mocked(mockMultipartFileParser.parse).mockResolvedValue([chunk]);
    vi.mocked(mockInvoiceService.processAndSave).mockRejectedValue(domainError);

    const controller = new InvoiceController(
      mockInvoiceService,
      mockInvoiceQueryParser,
      mockMultipartFileParser
    );

    await expect(controller.upload(mockRequest, mockReply)).rejects.toBe(
      domainError
    );
  });
});
