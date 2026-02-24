export type InvoiceExtractionResult = {
  numeroCliente: string;
  mesReferencia: string;
  energiaEletrica: { quantidade: number; valor: number };
  energiaSCEEsICMS: { quantidade: number; valor: number };
  energiaCompensadaGDI: { quantidade: number; valor: number };
  contribIlumPublicaMunicipal: { valor: number };
};

export interface LLMProvider {
  extractInvoiceData(pdfBuffer: Buffer): Promise<InvoiceExtractionResult>;
}
