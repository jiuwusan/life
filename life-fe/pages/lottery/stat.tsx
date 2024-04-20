import classNames from 'classnames';
import { RoutePage } from '@/components';
import { getBackgroundImage } from '@/utils/util';
import { getStatistics } from './hooks';
import styles from './styles.module.scss';

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {
      // 背景图
      bgImage: getBackgroundImage(),
      data: await getStatistics()
    }
  };
}

type Stats = {
  ball: string;
  diff: number;
  gran: number;
  sum: number;
  total: number;
  vanish: number;
};

type PageProps = {
  bgImage: string;
  data?: { frontStat: Array<Stats>; backStat: Array<Stats> };
};
// 页面
export default function Page(props: PageProps) {
  const { bgImage, data } = props;
  console.log(data);
  return (
    <RoutePage bg={bgImage} padding="8px" title="超级大乐透-统计分析">
      <div className={styles.statWrap}>
        <div className={styles.statTitle}>统计数据</div>
        <table border={1} className={styles.statTable}>
          <thead>
            <tr>
              <th>号码</th>
              <th>次数</th>
              <th>遗漏</th>
              <th>差值</th>
            </tr>
          </thead>
          <tbody>
            {data?.frontStat &&
              data?.frontStat.map(item => (
                <tr key={item.ball}>
                  <td>
                    <span className={styles.ballItem}>{item.ball}</span>
                  </td>
                  <td>{item.total}</td>
                  <td>{item.vanish}</td>
                  <td>{item.gran}</td>
                </tr>
              ))}

            {data?.backStat &&
              data?.backStat.map(item => (
                <tr key={item.ball}>
                  <td>
                    <span className={classNames(styles.ballItem, styles.red)}>{item.ball}</span>
                  </td>
                  <td>{item.total}</td>
                  <td>{item.vanish}</td>
                  <td>{item.gran}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </RoutePage>
  );
}
