interface InvoicesQueryProps {
  clientNumber?: string;
  referenceMonth?: string;
}

export class InvoicesQuery {
  readonly clientNumber?: string;
  readonly referenceMonth?: string;

  private constructor(props: InvoicesQueryProps) {
    this.clientNumber = props.clientNumber;
    this.referenceMonth = props.referenceMonth;
  }

  static create(props: InvoicesQueryProps): InvoicesQuery {
    return new InvoicesQuery(props);
  }
}
