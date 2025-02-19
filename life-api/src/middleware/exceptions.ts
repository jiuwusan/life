import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // console.error('系统错误：', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let code = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let msg = '系统错误';

    switch (typeof exception) {
      case 'string':
        exception && (msg = exception);
        break;
      default:
        exception?.message && (msg = exception.message);
        exception?.code && (code = exception.code);
        break;
    }

    response.status(200).json({
      code,
      msg: msg,
      success: false,
      data: null
    });
  }
}
