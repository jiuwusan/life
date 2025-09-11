import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hardware } from '@/entity';
import { BaseService } from '@/service/base';

@Injectable()
export class HardwareService extends BaseService {
  constructor(
    @InjectRepository(Hardware)
    private readonly hardwareRepo: Repository<Hardware>
  ) {
    super();
  }

  async createOrUpdate(dtos: Partial<Hardware> | Array<Partial<Hardware>>) {
    // upsert 方法，依据 machine + name + type 联合唯一约束判断
    !Array.isArray(dtos) && (dtos = [dtos]);
    const timestamp = this.getDatabaseDateStr();
    dtos = dtos.map(dto => ({ ...dto, timestamp }));
    return await this.hardwareRepo.upsert(dtos, ['machine', 'name', 'type']);
  }
  /**
   * 查询硬件列表
   *
   * @returns
   */
  async list() {
    return await this.hardwareRepo.find({ where: { deleted: '0' } });
  }
}
