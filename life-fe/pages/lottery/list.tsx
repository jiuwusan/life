import classNames from 'classnames';
import { RoutePage, Button } from '@/components';
import { getBackgroundImage } from '@/utils/util';
import { useMemo } from 'react';
import { useFetchState, useFetchClient } from '@/hooks/extend';
import { queryLotteryList, betLottery, matchLottery } from './hooks';
import styles from './styles.module.scss';

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {
      // 背景图
      bgImage: getBackgroundImage(),
      list: await queryLotteryList()
    }
  };
}

// 每一项
export function BallsRow(props: { data: Array<string>; win?: Array<string> }) {
  const { data, win } = props;

  const formatData = useMemo(() => {
    return matchLottery(data, win);
  }, [data, win]);

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      {formatData.map((ball, idx) => (
        <span key={idx} className={classNames([styles.ball, idx > 4 && styles.red, ball.isMatch && styles.active])}>
          {ball.value}
        </span>
      ))}
    </div>
  );
}

type ItemProps = {
  data: Record<string, any>;
};
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
            <BallsRow key={idx} data={item} win={data.winBall} />
          ))}
        </div>
      </div>
      {data.winTime && (
        <div className={styles.itemRow}>
          <span className={styles.title}>开奖时间：</span>
          {data.winTime}
        </div>
      )}
      {data.winBall && (
        <div className={classNames([styles.itemRow, styles.row])}>
          <div className={styles.title}>开奖号码：</div>
          <div>
            <BallsRow data={data.winBall} />
          </div>
        </div>
      )}
      <div className={classNames([styles.itemRow])}>
        <span className={styles.title}>开奖结果：</span>
        {!data.winTime && <span className={styles.notDrawn}>待开奖</span>}
        {data.winTime && !data.winResults && <span className={styles.notWin}>未中奖</span>}
        {data.winResults && (
          <span className={styles.win}>
            {data.winResults.map((item: any, idx: number) => (
              <span key={idx}>
                {idx !== 0 ? ' | ' : ''}
                {item.gradeCn}，¥ {item.amount.toFixed(2)}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

type PageProps = {
  bgImage: string;
  list?: Array<any>;
};
// 页面
export default function Page(props: PageProps) {
  const { bgImage, list = [] } = props;
  const [historyList, { fetchData }] = useFetchState(list, queryLotteryList);
  const [pending, createBet] = useFetchClient(async () => {
    await betLottery();
    fetchData();
  });

  return (
    <RoutePage bg={bgImage} padding="8px">
      <div className={styles.toolWrap}>
        <Button block onClick={() => createBet('1')}>
          投注
        </Button>
      </div>
      <div>
        {historyList.map(item => (
          <LotteryItem key={item.uid} data={item} />
        ))}
      </div>
    </RoutePage>
  );
}
