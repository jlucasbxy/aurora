import type { InvoiceExtractionResult } from "@/application/interfaces/providers";

export type ProcessedInvoiceData = {
  numeroCliente: string;
  mesReferencia: string;
  energiaEletricaQtd: number;
  energiaEletricaValor: number;
  energiaSCEEsICMSQtd: number;
  energiaSCEEsICMSValor: number;
  energiaCompensadaGDIQtd: number;
  energiaCompensadaGDIValor: number;
  contribIlumPublicaMunicipal: number;
  consumoEnergiaEletrica: number;
  energiaCompensada: number;
  valorTotalSemGD: number;
  economiaGD: number;
};

export class ProcessInvoiceDataUseCase {
  execute(result: InvoiceExtractionResult): ProcessedInvoiceData {
    return {
      numeroCliente: result.numeroCliente,
      mesReferencia: result.mesReferencia,
      energiaEletricaQtd: Math.round(result.energiaEletrica.quantidade),
      energiaEletricaValor: result.energiaEletrica.valor,
      energiaSCEEsICMSQtd: Math.round(result.energiaSCEEsICMS.quantidade),
      energiaSCEEsICMSValor: result.energiaSCEEsICMS.valor,
      energiaCompensadaGDIQtd: Math.round(
        result.energiaCompensadaGDI.quantidade
      ),
      energiaCompensadaGDIValor: result.energiaCompensadaGDI.valor,
      contribIlumPublicaMunicipal: result.contribIlumPublicaMunicipal.valor,
      consumoEnergiaEletrica: Math.round(
        result.energiaEletrica.quantidade + result.energiaSCEEsICMS.quantidade
      ),
      energiaCompensada: Math.round(result.energiaCompensadaGDI.quantidade),
      valorTotalSemGD:
        result.energiaEletrica.valor +
        result.energiaSCEEsICMS.valor +
        result.contribIlumPublicaMunicipal.valor,
      economiaGD: result.energiaCompensadaGDI.valor
    };
  }
}
