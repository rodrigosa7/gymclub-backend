import { HttpException, HttpStatus } from "@nestjs/common";

export class AppException extends HttpException {
  constructor(message: string, status: HttpStatus, details?: unknown) {
    super(
      {
        message,
        details: details ?? null,
      },
      status,
    );
  }
}
