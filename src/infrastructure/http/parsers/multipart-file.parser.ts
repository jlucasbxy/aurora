import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";
import type { MultipartFile } from "@fastify/multipart";

export class MultipartFileParser {
  async validate(file: MultipartFile): Promise<Buffer[]> {
    const chunks: Buffer[] = [];
    const fileStream = file.file;

    if (!fileStream) {
      throw new DomainError(ErrorCode.INVALID_FILE_TYPE, "No file provided");
    }

    if (fileStream.truncated) {
      throw new DomainError(
        ErrorCode.FILE_TOO_LARGE,
        "File exceeds the 50 KB limit"
      );
    }

    if (file.mimetype !== "application/pdf") {
      throw new DomainError(
        ErrorCode.INVALID_FILE_TYPE,
        "Only PDF files are accepted"
      );
    }

    for await (const chunk of fileStream!) {
      chunks.push(chunk);
    }

    return chunks;
  }
}
