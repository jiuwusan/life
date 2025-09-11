import { useMemo } from 'react';
import NextImage, { type ImageProps } from 'next/image';
import { appendQueryParams } from '@/utils/util';
import config from '@/config';

export function Image(props: ImageProps & { next?: boolean }) {
  const { src = '', alt = '', next = false, ...rest } = props;
  // 添加版本号
  const URL = useMemo(() => {
    return typeof src === 'string' ? appendQueryParams(src, { v: config.version }) : src;
  }, [src]);
  return (
    <>
      {next && <NextImage alt={alt} src={URL} {...rest} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!next && typeof URL === 'string' && <img src={URL} alt={alt} {...rest} />}
    </>
  );
}
