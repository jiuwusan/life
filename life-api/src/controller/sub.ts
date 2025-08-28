import { Controller, Get, Query } from '@nestjs/common';
import { SubService } from '@/service';

@Controller('sub')
export class SubController {
  constructor(private readonly subService: SubService) {}

  @Get('list')
  async list(@Query() { refresh = '0' }) {
    const queryParams = { refresh: /^\d+$/.test(refresh) ? Boolean(Number(refresh)) : false };
    return await this.subService.list(queryParams);
  }
}
