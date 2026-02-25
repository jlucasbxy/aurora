import type { Readable } from "node:stream";

export interface UploadFileDto {
  fileStream: Readable | undefined;
  mimetype: string | undefined;
}
