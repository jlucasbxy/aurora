import { Invoice } from "@/domain/entities/invoice.entity";
import { Quantity, Money, ClientNumber } from "@/domain/value-objects";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { ProcessedInvoiceData } from "@/application/use-cases/process-invoice-data.use-case";

export class SaveInvoiceUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  execute(data: ProcessedInvoiceData): Promise<Invoice> {
    const invoice = Invoice.create({
      numeroCliente: ClientNumber.create(data.numeroCliente),
      mesReferencia: data.mesReferencia,
      energiaEletricaQtd: Quantity.create(data.energiaEletricaQtd),
      energiaEletricaValor: Money.create(data.energiaEletricaValor),
      energiaSCEEsICMSQtd: Quantity.create(data.energiaSCEEsICMSQtd),
      energiaSCEEsICMSValor: Money.create(data.energiaSCEEsICMSValor),
      energiaCompensadaGDIQtd: Quantity.create(data.energiaCompensadaGDIQtd),
      energiaCompensadaGDIValor: Money.create(data.energiaCompensadaGDIValor),
      contribIlumPublicaMunicipal: Money.create(data.contribIlumPublicaMunicipal),
      consumoEnergiaEletrica: Quantity.create(data.consumoEnergiaEletrica),
      energiaCompensada: Quantity.create(data.energiaCompensada),
      valorTotalSemGD: Money.create(data.valorTotalSemGD),
      economiaGD: Money.create(data.economiaGD)
    });

    return this.invoiceRepository.save(invoice);
  }
}
