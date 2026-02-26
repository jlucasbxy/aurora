import type { DashboardFinancialDto } from "@/application/dtos";
import type { InvoiceFinancialReadModel } from "@/application/read-models";

export const InvoiceFinancialMapper = {
  toDto(readModel: InvoiceFinancialReadModel): DashboardFinancialDto {
    return {
      totalValueWithoutGD: readModel.totalValueWithoutGD.getValue(),
      gdSavings: readModel.gdSavings.getValue()
    };
  }
};
