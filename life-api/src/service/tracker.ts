import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Tracker } from '@/entity';
import { BaseService } from '@/service/base';

@Injectable()
export class TrackerService extends BaseService {
  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepo: Repository<Tracker>
  ) {
    super();
  }

  async createOrUpdate(dtos: Partial<Tracker> | Array<Partial<Tracker>>) {
    // upsert 方法，依据 name + type 联合唯一约束判断
    !Array.isArray(dtos) && (dtos = [dtos]);
    const timestamp = this.getDatabaseDateStr();
    dtos = dtos.map(dto => ({ ...dto, timestamp }));
    return await this.trackerRepo.upsert(dtos, ['owner', 'name', 'type']);
  }
  /**
   * 查询硬件列表
   *
   * @returns
   */
  async list({ owner, type, pageNo, pageSize }: { owner?: string; type?: string; pageNo: number; pageSize: number }) {
    const whereQuery: Record<string, any> = { deleted: Not('1') };
    owner && (whereQuery.owner = owner);
    type && (whereQuery.type = type);

    const [list, total] = await this.trackerRepo
      .createQueryBuilder()
      .where(whereQuery)
      .skip((pageNo - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      pageNo,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      list
    };
  }
}
