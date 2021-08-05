import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request?.route?.path || '';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const resp: any =
      exception instanceof HttpException ? exception.getResponse() : {};
    return response.status(status).json({
      statusCode: status,
      message: exception.message,
      path,
      ...resp,
    });
  }
}
