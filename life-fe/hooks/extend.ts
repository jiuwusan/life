import { useState } from 'react';

type CallbackFunction = (...args: any[]) => any;

/**
 * @description 封装 useState，支持异步请求
 * @param callback
 * @returns
 */
export function useFetchClient<T extends CallbackFunction>(callback?: CallbackFunction): [boolean, Function] {
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
 * @description 封装 useFetchClient，支持返回数据
 * @param initialValue
 * @param callback
 * @returns
 */
export function useFetchState<T extends CallbackFunction, R>(
  initialValue?: R,
  callback?: T
): [R, { pending: boolean; fetchData: Function }] {
  const [data, setData] = useState(initialValue);
  const [pending, fetchData] = useFetchClient(async (...args: Parameters<T>) => {
    callback && setData(await callback(...args));
  });

  return [data as R, { pending, fetchData }];
}
