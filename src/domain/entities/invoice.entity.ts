import { uuidv7 } from "uuidv7";
import type {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";

interface InvoiceProps {
  clientNumber: ClientNumber;
  referenceMonth: ReferenceMonth;
  electricEnergyQty: Quantity;
  electricEnergyValue: Money;
  sceeEnergyQty: Quantity;
  sceeEnergyValue: Money;
  compensatedEnergyQty: Quantity;
  compensatedEnergyValue: Money;
  publicLightingContrib: Money;
  electricEnergyConsumption: Quantity;
  compensatedEnergy: Quantity;
  totalValueWithoutGD: Money;
  gdSavings: Money;
}

export class Invoice {
  readonly id: string;
  readonly clientNumber: ClientNumber;
  readonly referenceMonth: ReferenceMonth;
  readonly electricEnergyQty: Quantity;
  readonly electricEnergyValue: Money;
  readonly sceeEnergyQty: Quantity;
  readonly sceeEnergyValue: Money;
  readonly compensatedEnergyQty: Quantity;
  readonly compensatedEnergyValue: Money;
  readonly publicLightingContrib: Money;
  readonly electricEnergyConsumption: Quantity;
  readonly compensatedEnergy: Quantity;
  readonly totalValueWithoutGD: Money;
  readonly gdSavings: Money;
  readonly createdAt: Date;

  private constructor(props: InvoiceProps) {
    this.id = uuidv7();
    this.createdAt = new Date();
    this.clientNumber = props.clientNumber;
    this.referenceMonth = props.referenceMonth;
    this.electricEnergyQty = props.electricEnergyQty;
    this.electricEnergyValue = props.electricEnergyValue;
    this.sceeEnergyQty = props.sceeEnergyQty;
    this.sceeEnergyValue = props.sceeEnergyValue;
    this.compensatedEnergyQty = props.compensatedEnergyQty;
    this.compensatedEnergyValue = props.compensatedEnergyValue;
    this.publicLightingContrib = props.publicLightingContrib;
    this.electricEnergyConsumption = props.electricEnergyConsumption;
    this.compensatedEnergy = props.compensatedEnergy;
    this.totalValueWithoutGD = props.totalValueWithoutGD;
    this.gdSavings = props.gdSavings;
  }

  static create(props: InvoiceProps): Invoice {
    return new Invoice(props);
  }
}
