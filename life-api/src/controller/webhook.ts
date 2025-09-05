import { Controller, Post, Body } from '@nestjs/common';
import { WebHookService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller('webhook')
export class WebHookController {
  constructor(private readonly webHookService: WebHookService) {}

  @Post('send')
  async list(@Body() data: { msgtype?: string; title: string; content: Record<string, string | number | boolean> | string }) {
    await validationParameter(data, {
      title: params => {
        if (!params.title) {
          return 'can not be blank';
        }
      },
      content: params => {
        if (!params.content) {
          return 'can not be blank';
        }
      }
    });
    return await this.webHookService.sendMarkdown(data.title, data.content);
  }
}
