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

  // 计算差值
  diffGB(a = '0', b = '0') {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const diff = Math.abs(numA - numB).toFixed(2);
    return `${diff} GB`;
  }

  formatSubscription(str: string, lastOverage?: string) {
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
    // 计算剩余流量
    const overage = toGB(info.total - info.upload - info.download);
    return {
      overage,
      total: toGB(info.total),
      upload: toGB(info.upload),
      download: toGB(info.download),
      expire: formatDate(info.expire),
      yesterday: this.diffGB(overage, lastOverage)
    };
  }

  /**
   * 查询订阅列表
   *
   * @returns
   */
  async list(queryParams?: { refresh?: boolean }) {
    const list = await this.sublinkRepository.find({ where: { deleted: '0' } });
    if (!queryParams?.refresh) {
      return list;
    }

    // 查询订阅信息
    for (let index = 0; index < list.length; index++) {
      try {
        const current = list[index];
        const headers = { 'User-Agent': 'clash.meta' };
        const response = await fetch(current.link, { headers });
        console.log(`${current.name}：成功获取订阅信息`);
        const subStr = response.headers.get('Subscription-Userinfo');
        const subInfo = this.formatSubscription(subStr, current.overage);
        // 更新数据库
        this.sublinkRepository.update(current.uid, subInfo);
        // 推送钉钉
        this.dingService.sendMarkdown('订阅信息', {
          机场名称: current.name,
          昨日总量: subInfo.yesterday,
          月度上传: subInfo.upload,
          月度下载: subInfo.download,
          月度剩余: subInfo.overage,
          月度总量: subInfo.total,
          订阅到期: subInfo.expire
        });
        // 合并订阅信息
        list[index] = { ...current, ...subInfo };
      } catch (error) {
        console.error('查询订阅信息失败：', error);
      }
    }
    return list;
  }
}
