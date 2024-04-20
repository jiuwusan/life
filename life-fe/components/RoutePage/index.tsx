import Head from 'next/head';
import { HTMLAttributes, useMemo } from 'react';
import { isColor } from '@/utils/util';
import styles from './styles.module.scss';
import classNames from 'classnames';

/**
 * 获取页面背景样式
 * @param bg 背景色
 * @returns
 */
const getPageStyle = (bg?: string, padding?: string | number) => {
  const pageStyle: Record<string, string> = {};
  if (!bg) {
    pageStyle['--page-bg-display'] = 'none';
  } else {
    if (isColor(bg)) {
      pageStyle['--page-bg-color'] = bg;
    } else {
      pageStyle['--page-bg-image'] = `url(/oss/images${bg})`;
    }
  }
  // 边距
  padding && (pageStyle['padding'] = `${padding}${typeof padding === 'number' ? 'px' : ''}`);

  return pageStyle;
};

type Props = {
  children: React.ReactNode;
  bg?: string;
  padding?: string | number;
  title?: string;
} & HTMLAttributes<HTMLDivElement>;

export function RoutePage(props: Props) {
  const { children, title = 'jiuwusan-life', bg, padding, className, ...rest } = props;
  const pageStyle = useMemo(() => getPageStyle(bg, padding), [bg, padding]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={classNames(styles.routePageWrap, className)} style={pageStyle} {...rest}>
        {children}
      </div>
    </>
  );
}
