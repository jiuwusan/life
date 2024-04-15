import { HTMLAttributes, useMemo } from 'react';
import { isColor } from '@/utils/util';
import styles from './styles.module.scss';

type Props = {
  children: React.ReactNode;
  bg?: string;
  padding?: string | number;
} & HTMLAttributes<HTMLDivElement>;

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
      pageStyle['--page-bg-image'] = `url(/life${bg})`;
    }
  }
  // 边距
  padding && (pageStyle['padding'] = `${padding}${typeof padding === 'number' ? 'px' : ''}`);

  return pageStyle;
};

export function RoutePage(props: Props) {
  const { children, bg, padding, ...rest } = props;
  const pageStyle = useMemo(() => getPageStyle(bg, padding), [bg, padding]);

  return (
    <div className={styles.routePageWrap} style={pageStyle} {...rest}>
      {children}
    </div>
  );
}
