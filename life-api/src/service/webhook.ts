import { Injectable } from '@nestjs/common';
import { webHookApi } from '@/external/api';

@Injectable()
export class WebHookService {
  constructor() {}

  /**
   * 发送钉钉消息
   */
  async sendDingMessage(message: { msgtype: string; markdown: { title: string; text: string } }) {
    const result = await webHookApi.sendDingMessage(message);
    console.log('钉钉消息发送结果：', await result.json());
    return result;
  }

  /**
   * 发送微信消息
   */
  async sendWxMessage(message: { msgtype: string; markdown: { content: string } }) {
    const result = await webHookApi.sendWxMessage(message);
    console.log('微信消息发送结果：', await result.json());
    return result;
  }

  /**
   * 发送消息
   */
  async sendMarkdown(title: string, content: Record<string, string | number | boolean> | string) {
    const texts = [`#### ${title}`];
    if (typeof content === 'object') {
      for (const [k, v] of Object.entries(content)) {
        texts.push(` - ${k}：${v}`);
      }
    } else {
      texts.push(content);
    }

    // 发送 钉钉消息
    this.sendDingMessage({
      msgtype: 'markdown',
      markdown: {
        title,
        text: texts.join('\n')
      }
    });

    // 发送 企业微信消息
    this.sendWxMessage({
      msgtype: 'markdown',
      markdown: {
        content: texts.join('\n')
      }
    });
  }
}
