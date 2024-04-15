import type { ResponseResult } from '../types';

export class BaseController {
  constructor() {}

  sendResult(data: any): ResponseResult {
    return {
      code: 200,
      msg: '成功',
      data
    };
  }

  sendError(code: number, msg: string): ResponseResult {
    return {
      code,
      msg,
      data: null
    };
  }
}
