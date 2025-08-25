import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sublink } from '@/entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClashService {
  constructor(
    @InjectRepository(Sublink)
    private sublinkRepository: Repository<Sublink>
  ) {}

  /**
   * 查询剩余流量，并推送钉钉
   *
   * @returns
   */
  async validation() {
    const list = await this.sublinkRepository.find({ where: { deleted: '0' } });
    list.forEach((item: Sublink) => {
      console.log('推送消息：', item);
    });
  }
}
