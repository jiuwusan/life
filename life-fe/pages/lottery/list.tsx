import classNames from 'classnames';
import { RoutePage } from '@/components';
import { getBackgroundImage } from '@/utils/util';
import { lotteryApi } from '@/api';
import styles from './styles.module.scss';
import { CSSProperties, useMemo } from 'react';

type PageProps = {
  bgImage: string;
  list?: Array<any>;
};

type ItemProps = {
  data: Record<string, any>;
};

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {
      // 背景图
      bgImage: getBackgroundImage(),
      list: await lotteryApi.querylist()
    }
  };
}

// 每一项
export function BallsRow(props: { data: Array<string> }) {
  const { data } = props;

  const formatData = useMemo(() => {
    return data.map(item => ({ '--ball-text': item }));
  }, [data]);

  return (
    <div>
      {formatData.map((ball, idx) => (
        <span key={idx} className={classNames([styles.ball, idx > 4 && styles.red])} style={ball as CSSProperties} />
      ))}
    </div>
  );
}

// 每一项
export function LotteryItem(props: ItemProps) {
  const { data } = props;

  return (
    <div className={styles.itemWrap}>
      <div className={styles.itemRow}>
        <span className={styles.title}>投注时间：</span>
        {data.betTime}
      </div>
      <div className={classNames([styles.itemRow, styles.row])}>
        <div className={styles.title}>投注号码：</div>
        <div>
          {data.betBall.map((item: Array<string>, idx: number) => (
            <BallsRow key={idx} data={item} />
          ))}
        </div>
      </div>
      <div className={styles.itemRow}>
        <span className={styles.title}>开奖结果：</span>一等奖
      </div>
    </div>
  );
}

// 页面
export default function Page(props: PageProps) {
  const { bgImage, list = [] } = props;
  return (
    <RoutePage bg={bgImage} padding="8px">
      {list.map(item => (
        <LotteryItem key={item.uid} data={item} />
      ))}
    </RoutePage>
  );
}
