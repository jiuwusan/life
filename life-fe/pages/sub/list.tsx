import { RoutePage } from '@/components';
import { useFetchState, useMounted } from '@/hooks/extend';
import { queryList, type SubInfo } from './hooks';
import styles from './styles.module.scss';

export const SubCard = (props: { data: SubInfo }) => {
  const { data } = props;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{data.name}</h3>
      <div className={styles.item}>
        <span className={styles.label}>更新时间</span>
        <span className={styles.value}>{data.updateTime}</span>
      </div>
      <div className={styles.item}>
        <span className={styles.label}>到期时间</span>
        <span className={styles.value}>{data.expire}</span>
      </div>
      <div className={styles.item}>
        <span className={styles.label}>月度总量</span>
        <span className={styles.value}>{data.total}</span>
      </div>
      <div className={styles.item}>
        <span className={styles.label}>月度剩余</span>
        <span className={styles.value}>{data.overage}</span>
      </div>
            <div className={styles.item}>
        <span className={styles.label}>月度上传</span>
        <span className={styles.value}>{data.upload}</span>
      </div>
            <div className={styles.item}>
        <span className={styles.label}>月度下载</span>
        <span className={styles.value}>{data.download}</span>
      </div>
    </div>
  );
};

// 页面
export default function Page() {
  const { data = [], fetchData } = useFetchState<SubInfo[]>(queryList);
  useMounted(() => {
    fetchData();
  });
  return (
    <RoutePage padding="16px">
      <div>
        <h2 className={styles.title}>Clash 订阅列表</h2>
        {data.map(item => (
          <SubCard key={item.uid} data={item} />
        ))}
      </div>
    </RoutePage>
  );
}
