import { useState, useEffect, type EffectCallback } from 'react';

type CallbackFunction = (...args: any[]) => any;

/**
 * @description 封装 useState，支持异步请求
 * @param callback
 * @returns
 */
export function useClientFetch<T extends CallbackFunction>(callback?: CallbackFunction): [boolean, Function] {
  const [pending, setPending] = useState<boolean>(false);

  async function fetchData(...args: Parameters<T>) {
    setPending(true);
    try {
      callback && (await callback(...args));
    } catch (error) {
      throw error;
    } finally {
      setPending(false);
    }
  }

  return [pending, fetchData];
}

/**
 * @description 封装 useClientFetch，支持返回数据
 * @param initialValue
 * @param callback
 * @returns
 */
export function useFetchState<T>(callback?: (...args: any[]) => Promise<T>): { data?: T; pending: boolean; fetchData: Function } {
  const [data, setData] = useState<T>();
  const [pending, fetchData] = useClientFetch(async (...args) => {
    callback && setData(await callback(...args));
  });

  return { data, pending, fetchData };
}

// export function useFetchState<T>(callback?: (...args: any[]) => Promise<T>): {
//   data?: T;
//   pending: boolean;
//   fetchData: (...args: any[]) => Promise<void>;
// } {
//   const [data, setData] = useState<T>();
//   // useClientFetch 应该返回 [pending:boolean, fetchData: function]
//   const [pending, fetchDataBase] = useClientFetch(async (...args: any[]) => {
//     if (!callback) return;
//     const result = await callback(...args);
//     setData(result);
//   });

//   // 包装一层，保证返回类型一致
//   const fetchData = async (...args: any[]) => {
//     await fetchDataBase(...args);
//   };

//   return { data, pending, fetchData };
// }

export type ScrollPagerProps<T> = {
  pageSize?: number;
  fetchData: (params: { pageNo: number; pageSize: number }) => Promise<{ list: T[]; total: number }>;
};

/**
 * 分页加载
 * @description 分页加载
 * @returns
 */
export function useScrollPager<T>({ fetchData, pageSize = 20 }: ScrollPagerProps<T>) {
  const [datalist, setDatalist] = useState<T[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pending, setPending] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async (refresh?: boolean) => {
    if (pending) return;

    setPending(true);
    try {
      const currentPage = refresh ? 1 : pageNo;
      const { list, total } = await fetchData({ pageNo: currentPage, pageSize });
      if (refresh) {
        setDatalist(list);
        setPageNo(2); // 下一页从 2 开始
      } else {
        setDatalist(prev => [...prev, ...list]);
        setPageNo(prev => prev + 1);
      }
      setHasMore(list.length >= pageSize && total > currentPage * pageSize);
    } finally {
      setPending(false);
    }
  };

  return {
    datalist,
    pending,
    hasMore,
    loadMore
  };
}

export const useMounted = (effectCallback: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effectCallback, []); // 空数组依赖，确保只执行一次
};
