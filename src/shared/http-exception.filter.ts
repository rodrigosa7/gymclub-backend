import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

type JsonResponse = {
  status(code: number): JsonResponse;
  json(body: unknown): void;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<JsonResponse>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const errorPayload =
        typeof exceptionResponse === "string"
          ? { message: exceptionResponse, details: null }
          : (exceptionResponse as Record<string, unknown>);

      response.status(status).json({
        error: {
          message: (errorPayload.message as string) ?? "Request failed.",
          details: errorPayload.details ?? null,
        },
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        message: "Unexpected server error.",
        details: null,
      },
    });
  }
}
