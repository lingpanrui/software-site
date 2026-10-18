import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

const HTTP_STATUS_TO_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (response.headersSent) {
      return;
    }

    let httpStatus: number;
    let code: string;
    let message: string;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      code = HTTP_STATUS_TO_CODE[httpStatus] || 'INTERNAL_ERROR';
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as { message?: string | string[] };
        message = Array.isArray(resp.message) ? resp.message.join(', ') : resp.message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as { code: unknown }).code === 'string'
    ) {
      const codeVal = (exception as { code: string }).code;
      if (codeVal === 'P2002') {
        httpStatus = HttpStatus.CONFLICT;
        code = 'CONFLICT';
        message = '数据冲突，记录已存在';
      } else if (codeVal === 'P2025') {
        httpStatus = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = '资源不存在';
      } else {
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        code = 'INTERNAL_ERROR';
        message = '数据库错误';
      }
    } else if (exception instanceof Error) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = exception.message || '服务器内部错误';
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = '服务器内部错误';
    }

    response.status(httpStatus).json({
      error: {
        code,
        message,
        timestamp: Date.now(),
      },
    });
  }
}
