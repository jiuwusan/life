import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class Gateway implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const elapsed = Date.now() - start;
      console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} - ${elapsed}ms`);
    });
    next();
  }
}
