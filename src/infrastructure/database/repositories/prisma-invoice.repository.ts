import type { PrismaClient } from "@/infrastructure/database/prisma/generated/prisma/client";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { Invoice } from "@/domain/entities/invoice.entity";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(invoice: Invoice): Promise<Invoice> {
    await this.prisma.invoice.create({
      data: {
        id: invoice.id,
        numeroCliente: invoice.numeroCliente.getValue(),
        mesReferencia: invoice.mesReferencia,
        energiaEletricaQtd: invoice.energiaEletricaQtd.getValue(),
        energiaEletricaValor: invoice.energiaEletricaValor.getValue(),
        energiaSCEEsICMSQtd: invoice.energiaSCEEsICMSQtd.getValue(),
        energiaSCEEsICMSValor: invoice.energiaSCEEsICMSValor.getValue(),
        energiaCompensadaGDIQtd: invoice.energiaCompensadaGDIQtd.getValue(),
        energiaCompensadaGDIValor: invoice.energiaCompensadaGDIValor.getValue(),
        contribIlumPublicaMunicipal: invoice.contribIlumPublicaMunicipal.getValue(),
        consumoEnergiaEletrica: invoice.consumoEnergiaEletrica.getValue(),
        energiaCompensada: invoice.energiaCompensada.getValue(),
        valorTotalSemGD: invoice.valorTotalSemGD.getValue(),
        economiaGD: invoice.economiaGD.getValue(),
        createdAt: invoice.createdAt
      }
    });

    return invoice;
  }
}
