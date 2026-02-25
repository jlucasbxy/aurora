import { describe, it, expect } from "vitest";
import { MultipartFileParser } from "@/infrastructure/http/parsers";
import { HttpError } from "@/infrastructure/http/errors";
import type { MultipartFile } from "@fastify/multipart";

async function* makeAsyncIterator(chunks: Buffer[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

function makeFileStream(options: { truncated?: boolean; chunks?: Buffer[] } = {}) {
  const chunks = options.chunks ?? [Buffer.from("pdf-data")];
  const stream = makeAsyncIterator(chunks);

  return Object.assign(stream, {
    truncated: options.truncated ?? false
  });
}

function makeMultipartFile(overrides: Partial<MultipartFile> = {}): MultipartFile {
  return {
    fieldname: "file",
    filename: "invoice.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    file: makeFileStream() as unknown as MultipartFile["file"],
    fields: {},
    type: "file",
    toBuffer: async () => Buffer.alloc(0),
    ...overrides
  } as unknown as MultipartFile;
}

describe("MultipartFileParser", () => {
  const parser = new MultipartFileParser();

  it("throws HttpError 400 when file stream is undefined", async () => {
    const file = makeMultipartFile({ file: undefined as unknown as MultipartFile["file"] });

    await expect(parser.parse(file)).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof HttpError &&
        err.statusCode === 400 &&
        err.code === "NO_FILE_PROVIDED"
    );
  });

  it("throws HttpError 413 when file stream is truncated", async () => {
    const file = makeMultipartFile({
      file: makeFileStream({ truncated: true }) as unknown as MultipartFile["file"]
    });

    await expect(parser.parse(file)).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof HttpError &&
        err.statusCode === 413 &&
        err.code === "FILE_TOO_LARGE"
    );
  });

  it("throws HttpError 415 when MIME type is not application/pdf", async () => {
    const file = makeMultipartFile({ mimetype: "image/png" });

    await expect(parser.parse(file)).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof HttpError &&
        err.statusCode === 415 &&
        err.code === "UNSUPPORTED_MEDIA_TYPE"
    );
  });

  it("returns buffer chunks for a valid PDF", async () => {
    const chunk1 = Buffer.from("chunk1");
    const chunk2 = Buffer.from("chunk2");
    const file = makeMultipartFile({
      file: makeFileStream({ chunks: [chunk1, chunk2] }) as unknown as MultipartFile["file"]
    });

    const result = await parser.parse(file);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(chunk1);
    expect(result[1]).toEqual(chunk2);
  });
});
