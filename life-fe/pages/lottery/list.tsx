import classNames from 'classnames';
import { RoutePage, Loading, ClientOnly, Popup, Iconfont, BetBall } from '@/components';
import { strToArray } from '@/utils/util';
import { useMemo, useState } from 'react';
import { useScrollPager, useClientFetch } from '@/hooks/extend';
import { useRouter } from 'next/router';
import { queryLotteryList, betLottery, matchLottery, removeLottery, LotteryMaps } from './hooks';
import styles from './styles.module.scss';

/**
 * 添加组件
 *
 * @returns
 */
const BetButton = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <div className={styles.betButtonFixed} onClick={() => setVisible(true)}>
        <Iconfont name="add" />
      </div>
      <Popup scroll {...{ title: '提示', visible }} onClose={() => setVisible(false)}>
        <div style={{ minHeight: '80vh', padding: '12px' }}>这是弹窗</div>
      </Popup>
    </>
  );
};

// 每一项
export function BallsRow(props: { data: string; type: string; win?: string }) {
  const { type, data, win } = props;

  const result = useMemo(() => matchLottery(type, data, win), [type, data, win]);

  return (
    <div className={styles.ballsRow}>
      {result.map((ball, idx) => (
        <BetBall key={idx} number={ball.value} color={ball.color as any} active={ball.matched} />
      ))}
    </div>
  );
}

type ItemProps = {
  data: Record<string, any>;
  remove?: Function;
  reprint?: Function;
  adding?: Function;
};

// 每一项
export function LotteryItem(props: ItemProps) {
  const router = useRouter();
  const { data, remove, reprint, adding } = props;
  const betBallList = useMemo(() => strToArray(data.betBall, ';'), [data]);
  const remarkDetailUrl = useMemo(
    () => (data.winRemark && data.type === 'sp' ? `/tools/pdf?pdfurl=${encodeURIComponent(data.winRemark)}` : data.winRemark),
    [data.type, data.winRemark]
  );
  return (
    <div className={styles.itemWrap}>
      <div className={classNames([styles.itemRow, styles.type])}>
        <div className={styles.title}>{LotteryMaps[data.type]?.name}</div>
        <div className={styles.toolBtn}>
          {data.winTime && (
            <span className={styles.tagBtn} onClick={() => reprint && reprint({ uid: data.uid, reprint: true })}>
              追投
            </span>
          )}
          {remarkDetailUrl && (
            <a className={classNames([styles.tagBtn, styles.success])} href={remarkDetailUrl}>
              公告
            </a>
          )}
        </div>
      </div>
      {data.reprintCount > 0 && (
        <div className={styles.itemRow}>
          <span className={styles.title}>追投期数：</span>第{data.reprintCount * 1 + 1}期
        </div>
      )}
      <div className={classNames([styles.itemRow, styles.row])}>
        <div className={styles.title}>投注号码：</div>
        <div>
          {betBallList.map((item: string, idx: number) => (
            <BallsRow key={idx} type={data.type} data={item} win={data.winBall} />
          ))}
        </div>
      </div>
      <div className={styles.itemRow}>
        <span className={styles.title}>投注时间：</span>
        {data.betTime}
      </div>
      {data.winBall && (
        <div className={classNames([styles.itemRow, styles.row])}>
          <div className={styles.title}>开奖号码：</div>
          <div>
            <BallsRow type={data.type} data={data.winBall} />
          </div>
        </div>
      )}
      {data.winTime && (
        <div className={styles.itemRow}>
          <span className={styles.title}>开奖时间：</span>
          {data.winTime}
        </div>
      )}
      {data.winNum && (
        <div className={styles.itemRow}>
          <span className={styles.title}>开奖期数：</span>
          {data.winNum}
        </div>
      )}
      <div className={classNames([styles.itemRow])}>
        <span className={styles.title}>开奖结果：</span>
        {!data.winTime && <span className={styles.notDrawn}>待开奖</span>}
        {data.winTime && <span className={data.winResult ? styles.win : styles.notWin}>{data.winResult || '未中奖'}</span>}
      </div>
    </div>
  );
}

// 页面
export default function Page() {
  const router = useRouter();
  const { datalist, pending, hasMore, loadMore } = useScrollPager<any>({ fetchData: queryLotteryList });
  //选号
  const [, createBet] = useClientFetch(async formData => {
    await betLottery(formData);
    loadMore(true);
  });
  // 删除
  const [, handleRemove] = useClientFetch(async uid => {
    await removeLottery(uid);
  });

  return (
    <>
      <RoutePage padding="8px" title="投注列表">
        <div>
          {datalist.map(item => (
            <LotteryItem key={item.uid} data={item} remove={handleRemove} reprint={(param: any) => createBet(param)} adding={(param: any) => createBet(param)} />
          ))}
          <ClientOnly>
            <Loading pending={pending} hasMore={hasMore} loadMore={loadMore} />
            <BetButton />
          </ClientOnly>
        </div>
      </RoutePage>
    </>
  );
}
