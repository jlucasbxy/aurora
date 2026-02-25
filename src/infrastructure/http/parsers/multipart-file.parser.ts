import { HttpError } from "@/infrastructure/http/errors";
import type { MultipartFile } from "@fastify/multipart";
import { Parser } from ".";

export class MultipartFileParser
  implements Parser<Promise<Buffer[]>, MultipartFile>
{
  async parse(file: MultipartFile): Promise<Buffer[]> {
    const chunks: Buffer[] = [];
    const fileStream = file.file;

    if (!fileStream) {
      throw new HttpError(400, "NO_FILE_PROVIDED", "No file provided");
    }

    if (fileStream.truncated) {
      throw new HttpError(
        413,
        "FILE_TOO_LARGE",
        "File exceeds the 50 KB limit"
      );
    }

    if (file.mimetype !== "application/pdf") {
      throw new HttpError(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Only PDF files are accepted"
      );
    }

    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }

    return chunks;
  }
}
