import { Controller, Get } from '@nestjs/common';
import { SubService } from '@/service';

@Controller('sub')
export class SubController {
  constructor(private readonly subService: SubService) {}

  @Get('list')
  async list() {
    return await this.subService.list();
  }

  @Get('stats')
  async stats() {
    return await this.subService.stats();
  }
}
