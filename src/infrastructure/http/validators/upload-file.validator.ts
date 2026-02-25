import { ErrorCode } from "@/application/dtos";
import type { UploadFileDto } from "@/application/dtos";
import { DomainError } from "@/domain/errors";

export class UploadFileValidator {
  validate(dto: UploadFileDto): void {
    if (!dto.fileStream) {
      throw new DomainError(ErrorCode.INVALID_FILE_TYPE, "No file provided");
    }

    if (dto.mimetype !== "application/pdf") {
      throw new DomainError(ErrorCode.INVALID_FILE_TYPE, "Only PDF files are accepted");
    }
  }
}
