import classNames from 'classnames';
import { RoutePage, Button } from '@/components';
import { getBackgroundImage, formatDateToStr } from '@/utils/util';
import { lotteryApi } from '@/api';
import styles from './styles.module.scss';
import { CSSProperties, useMemo } from 'react';
import { useFetchState } from '@/hooks/extend';

const queryLotteryList = async (query?: { pageNo: number }) => {
  const list = (await lotteryApi.querylist(query)) || [];
  return list.map((item: any) => ({
    ...item,
    betTime: formatDateToStr(item.betTime),
    winTime: item.winTime && formatDateToStr(item.winTime)
  }));
};

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
export function BallsRow(props: { data: Array<string> }) {
  const { data } = props;

  const formatData = useMemo(() => {
    return data.map(item => ({ '--ball-text': `'${item}'` }));
  }, [data]);

  return (
    <div>
      {formatData.map((ball, idx) => (
        <span key={idx} className={classNames([styles.ball, idx > 4 && styles.red])} style={ball as CSSProperties} />
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
            <BallsRow key={idx} data={item} />
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
      <div className={classNames([styles.itemRow, styles.row])}>
        <div className={styles.title}>开奖结果：</div>
        {!data.winTime && <div>待开奖</div>}
        {data.winTime && !data.winResults && <div>未中奖</div>}
        {data.winResults && (
          <div>
            {data.winResults.map((item: any, idx: number) => (
              <div key={idx}>
                {item.win}，{item.gradeCn}，¥{item.amount}
              </div>
            ))}
          </div>
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
  return (
    <RoutePage bg={bgImage} padding="8px">
      <div>
        <Button block onClick={() => fetchData(1)}>
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
