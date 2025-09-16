import { subApi } from '@/api';
import { formatDateToStr } from '@/utils/util';

export type SubInfo = {
  uid: string;
  name: string;
  link: string;
  expire: string;
  total: string;
  overage: string;
  download: string;
  upload: string;
  updateTime: string;
};

// 列表
export const queryList = async () => {
  const result = (await subApi.querylist()) || [];
  return result.map((item: any) => ({
    ...item,
    updateTime: formatDateToStr(item.updateTime)
  }));
};
