import { RoutePage, Button } from '@/components';
import { useRouter } from 'next/router';
import styles from './styles.module.scss';

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {}
  };
}

type PageProps = {};
const menus = [
  { name: '碰碰运气', route: '/orders' },
  { name: 'Clash 订阅', route: '/activities' }
];
// 页面
export default function Page(props: PageProps) {
  const router = useRouter();
  return (
    <RoutePage padding="8px">
      <div className={styles.home}>
        <h1 className={styles.title}>我的网站</h1>
        <div className={styles.grid}>
          {menus.map(item => (
            <div key={item.route} className={styles.gridItem}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </RoutePage>
  );
}
