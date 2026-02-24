import { uuidv7 } from "uuidv7";
import { Quantity, Money, ClientNumber, ReferenceMonth } from "@/domain/value-objects";

interface InvoiceProps {
  numeroCliente: ClientNumber;
  mesReferencia: ReferenceMonth;
  energiaEletricaQtd: Quantity;
  energiaEletricaValor: Money;
  energiaSCEEsICMSQtd: Quantity;
  energiaSCEEsICMSValor: Money;
  energiaCompensadaGDIQtd: Quantity;
  energiaCompensadaGDIValor: Money;
  contribIlumPublicaMunicipal: Money;
  consumoEnergiaEletrica: Quantity;
  energiaCompensada: Quantity;
  valorTotalSemGD: Money;
  economiaGD: Money;
}

export class Invoice {
  readonly id: string;
  readonly numeroCliente: ClientNumber;
  readonly mesReferencia: ReferenceMonth;
  readonly energiaEletricaQtd: Quantity;
  readonly energiaEletricaValor: Money;
  readonly energiaSCEEsICMSQtd: Quantity;
  readonly energiaSCEEsICMSValor: Money;
  readonly energiaCompensadaGDIQtd: Quantity;
  readonly energiaCompensadaGDIValor: Money;
  readonly contribIlumPublicaMunicipal: Money;
  readonly consumoEnergiaEletrica: Quantity;
  readonly energiaCompensada: Quantity;
  readonly valorTotalSemGD: Money;
  readonly economiaGD: Money;
  readonly createdAt: Date;

  private constructor(props: InvoiceProps) {
    this.id = uuidv7();
    this.createdAt = new Date();
    this.numeroCliente = props.numeroCliente;
    this.mesReferencia = props.mesReferencia;
    this.energiaEletricaQtd = props.energiaEletricaQtd;
    this.energiaEletricaValor = props.energiaEletricaValor;
    this.energiaSCEEsICMSQtd = props.energiaSCEEsICMSQtd;
    this.energiaSCEEsICMSValor = props.energiaSCEEsICMSValor;
    this.energiaCompensadaGDIQtd = props.energiaCompensadaGDIQtd;
    this.energiaCompensadaGDIValor = props.energiaCompensadaGDIValor;
    this.contribIlumPublicaMunicipal = props.contribIlumPublicaMunicipal;
    this.consumoEnergiaEletrica = props.consumoEnergiaEletrica;
    this.energiaCompensada = props.energiaCompensada;
    this.valorTotalSemGD = props.valorTotalSemGD;
    this.economiaGD = props.economiaGD;
  }

  static create(props: InvoiceProps): Invoice {
    return new Invoice(props);
  }
}
