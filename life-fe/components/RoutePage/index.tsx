import { useMemo } from 'react';
import styles from './styles.module.scss';
import { Image } from '../Image';

type Props = {
  children: React.ReactNode;
  bg?: string;
  image?: boolean;
};

/**
 * 获取页面背景样式
 * @param bg 背景色
 * @returns
 */
const getPageStyle = (bg?: string) => {
  const bgStyle: Record<string, string> = {};
  bg && (bgStyle['background-color'] = bg);
  return bgStyle;
};

export function RoutePage(props: Props) {
  const { bg, image } = props;
  const pageStyle = useMemo(() => getPageStyle(bg), [bg]);
  // const BGURL = useMemo(() => `/ui/bg/${Math.floor(Math.random() * 4)}.jpg`, []);

  return (
    <div className={styles.routePageWrap} style={pageStyle}>
      {image && (
        <div className={styles.routePageImageBg}>
          <Image fill src="/ui/bg/0.jpg" alt="页面背景图" />
        </div>
      )}
      {props.children}
    </div>
  );
}
