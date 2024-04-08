import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const contentType = response?.getHeader('Content-Type');
    if (contentType && !contentType.includes('application/json')) {
      return next.handle();
    }
    return next.handle().pipe(
      map(data => {
        return {
          code: 200,
          msg: '成功',
          data
        };
      })
    );
  }
}
