import { Injectable } from '@nestjs/common';
import { webHookApi } from '@/external/api';

@Injectable()
export class DingDingService {
  constructor() {}

  /**
   * 发送消息
   */
  async send(message: { msgtype: string; markdown: { title: string; text: string } }) {
    const result = await webHookApi.sendMessage(message);
    console.log('钉钉消息发送结果：', await result.json());
    return result;
  }

  /**
   * 发送消息
   */
  async sendMarkdown(title: string, content: Record<string, string>) {
    const texts = [`#### ${title}`];
    for (const [k, v] of Object.entries(content)) {
      texts.push(` - ${k}：${v}`);
    }
    return await this.send({
      msgtype: 'markdown',
      markdown: {
        title,
        text: texts.join('\n')
      }
    });
  }
}
