import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sublink } from '@/entity';
import { Repository } from 'typeorm';
import { WebHookService } from '@/service/webhook';
import { subApi } from '@/external/api';
import { formatDateToStr, getDatabaseDateStr } from '@/utils/util';

@Injectable()
export class SubService {
  constructor(
    @InjectRepository(Sublink)
    private sublinkRepository: Repository<Sublink>,
    private readonly webHookService: WebHookService
  ) {}

  formatSubscription(str?: string) {
    try {
      // 转换为对象
      const info = Object.fromEntries(
        str.split(';').map(item => {
          const [k, v] = item.split('=').map(s => s.trim());
          return [k, Number(v)];
        })
      );

      // 转换为 GB
      const toGB = bytes => (bytes / 1024 ** 3).toFixed(2) + ' GB';

      // 计算剩余流量
      const overage = toGB(info.total - info.upload - info.download);
      return {
        overage,
        total: toGB(info.total),
        upload: toGB(info.upload),
        download: toGB(info.download),
        expire: formatDateToStr(info.expire * 1000, 'yyyy-MM-dd')
      };
    } catch (error) {
      console.log('格式化订阅信息失败：', error);
    }
    return void 0;
  }

  async update() {
    const updateTime = getDatabaseDateStr();
    const { data = [] } = await subApi.update();
    const list = data
      .map(({ name, link, subscription }) => {
        // 转换订阅信息
        const subInfo = this.formatSubscription(subscription);
        if (!subInfo) return;
        this.webHookService.sendMarkdown('订阅信息', {
          机场名称: name,
          订阅到期: subInfo.expire,
          月度总量: subInfo.total,
          月度剩余: subInfo.overage
        });
        return {
          name,
          link,
          updateTime,
          ...subInfo
        };
      })
      .filter((item?: Sublink) => !!item);
    // 更新到数据库
    return await this.sublinkRepository.upsert(list, ['name']);
  }

  /**
   * 查询订阅列表
   *
   * @returns
   */
  async list(queryParams?: { refresh?: boolean }) {
    queryParams?.refresh && (await this.update());
    return await this.sublinkRepository.find({ where: { deleted: '0' } });
  }
}
