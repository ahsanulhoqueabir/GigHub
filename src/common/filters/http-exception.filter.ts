import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { createErrorResponse } from '../utils/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorTitle = 'Internal Server Error';
    let details: any = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent: any = exception.getResponse();

      if (typeof resContent === 'object' && resContent !== null) {
        errorTitle = resContent.error || exception.name || 'HttpException';
        details = resContent.message || resContent;
      } else {
        errorTitle = exception.name;
        details = resContent;
      }
    } else if (exception instanceof Error) {
      errorTitle = exception.name || 'Error';
      details = exception.message;
    }

    // Log the error for debugging
    this.logger.error(
      `[${status}] ${errorTitle}: ${typeof details === 'object' ? JSON.stringify(details) : details}`,
      exception.stack,
    );

    const errorResponse = createErrorResponse(errorTitle, details, status);
    response.status(status).json(errorResponse);
  }
}
