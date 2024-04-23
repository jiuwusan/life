import classNames from 'classnames';
import { RoutePage, Button, Sticky } from '@/components';
import { getBackgroundImage } from '@/utils/util';
import { useMemo } from 'react';
import { useFetchState, useFetchClient } from '@/hooks/extend';
import { queryLotteryList, betLottery, matchLottery, removeLottery } from './hooks';
import styles from './styles.module.scss';
import { useRouter } from 'next/router';

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
        <span
          key={idx}
          className={classNames([styles.ballItem, idx > 4 && styles.red, ball.isMatch && styles.active])}>
          {ball.value}
        </span>
      ))}
    </div>
  );
}

type ItemProps = {
  data: Record<string, any>;
  remove?: Function;
};
// 每一项
export function LotteryItem(props: ItemProps) {
  const { data, remove } = props;

  return (
    <div className={styles.itemWrap}>
      <div className={classNames([styles.itemRow, styles.type])}>
        <div className={styles.title}>超级大乐透</div>
        <div className={styles.toolBtn}>
          {/* <span className={styles.tagBtn}>追投</span> */}
          <span className={classNames([styles.tagBtn, styles.remove])} onClick={() => remove && remove(data.uid)}>
            删除
          </span>
        </div>
      </div>
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
        {data.winTime && data.winResults && (
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
  const router = useRouter();
  const { bgImage, list = [] } = props;
  const [historyList, { fetchData }] = useFetchState(list, queryLotteryList);
  //选号
  const [, createBet] = useFetchClient(async formData => {
    await betLottery(formData);
    fetchData();
  });
  // 删除
  const [, handleRemove] = useFetchClient(async uid => {
    await removeLottery(uid);
    fetchData();
  });

  return (
    <>
      <RoutePage bg={bgImage} padding="8px" title="超级大乐透-投注列表">
        <div>
          {historyList.map(item => (
            <LotteryItem key={item.uid} data={item} remove={handleRemove} />
          ))}
        </div>
      </RoutePage>
      <Sticky fixed type="bottom" className={styles.toolWrap}>
        <Button className={styles.toolBtnItem} type="success" onClick={() => router.push('/lottery/stat')}>
          查看统计
        </Button>
        <Button className={styles.toolBtnItem} type="danger" onClick={() => createBet({ recommend: true })}>
          推荐选号
        </Button>
        <Button className={styles.toolBtnItem} onClick={() => createBet()}>
          选号
        </Button>
      </Sticky>
    </>
  );
}
