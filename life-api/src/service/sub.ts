import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sublink } from '@/entity';
import { Repository } from 'typeorm';
import { DingDingService } from '@/service/dingding';

@Injectable()
export class SubService {
  constructor(
    @InjectRepository(Sublink)
    private sublinkRepository: Repository<Sublink>,
    private readonly dingService: DingDingService
  ) {}

  formatSubscription(str: string) {
    // 转换为对象
    const info = Object.fromEntries(
      str.split(';').map(item => {
        const [k, v] = item.split('=').map(s => s.trim());
        return [k, Number(v)];
      })
    );

    // 转换为 GB
    const toGB = bytes => (bytes / 1024 ** 3).toFixed(2) + ' GB';

    // 转换时间戳为 yyyy-mm-dd
    const formatDate = ts => {
      const d = new Date(ts * 1000); // 秒级时间戳
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      upload: toGB(info.upload),
      download: toGB(info.download),
      total: toGB(info.total),
      overage: toGB(info.total - info.upload - info.download),
      expire: formatDate(info.expire)
    };
  }

  /**
   * 查询订阅列表
   *
   * @returns
   */
  async list() {
    return await this.sublinkRepository.find({ where: { deleted: '0' } });
  }

  /**
   * 查询剩余流量，并推送钉钉
   *
   * @returns
   */
  async statistics() {
    const list = await this.list();
    for (let index = 0; index < list.length; index++) {
      try {
        const current = list[index];
        const headers = { 'User-Agent': 'clash.meta' };
        const response = await fetch(current.link, { headers });
        const subStr = response.headers.get('Subscription-Userinfo');
        const subInfo = this.formatSubscription(subStr);
        this.dingService.sendMarkdown('订阅信息', {
          机场名称: current.name,
          上传流量: subInfo.upload,
          下载流量: subInfo.download,
          月总流量: subInfo.total,
          剩余流量: subInfo.overage,
          到期时间: subInfo.expire
        });
        list[index] = { ...current, ...subInfo };
      } catch (error) {
        console.error('查询订阅信息失败：', error);
      }
    }
    return list;
  }
}
