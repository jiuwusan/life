import { trackerApi } from '@/api';
import { formatDateToStr } from '@/utils/util';

export type Sensor = {
  uid: string;
  owner: string;
  type: string;
  name: string;
  value: string;
  timestamp: string;
  remark: string;
};

// 列表
export const queryList = async () => {
  return (await trackerApi.querylist({ pageSize: 1000, type: 'SENSOR' }))?.list;
};
