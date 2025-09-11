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

  async createOrUpdate(dto: Partial<Hardware>) {
    // upsert 方法，依据 machine + name + type 联合唯一约束判断
    dto.timestamp = this.getDatabaseDateStr();
    return await this.hardwareRepo.upsert(dto, {
      conflictPaths: ['machine', 'name', 'type'] // 用联合唯一性约束
    });
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
