import { getDatabaseDateStr } from '@/utils/util';

export class BaseService {
  protected getDatabaseDateStr(value?: number | string | Date) {
    return getDatabaseDateStr(value);
  }
}
