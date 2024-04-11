import { useMemo } from 'react';
import NextImage, { type ImageProps } from 'next/image';
import { appendQueryParams } from '@/utils/util';
import config from '@/config';

export function Image(props: ImageProps) {
  const { src = '', ...rest } = props;
  // 添加版本号
  const URL = useMemo(() => {
    return typeof src === 'string' ? appendQueryParams(src, { v: config.version }) : src;
  }, [src]);
  return <NextImage src={URL} {...rest} />;
}
