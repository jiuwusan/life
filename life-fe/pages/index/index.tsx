import { RoutePage } from '@/components';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.scss';
import lotteryImage from './images/lottery.png';
import clashImage from './images/clash.png';
// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {}
  };
}

type PageProps = {};

const menus = [
  { name: '碰碰运气', route: '/lottery/list', image: lotteryImage },
  { name: 'Clash 订阅', route: '/sub/list', image: clashImage }
];

export default function Page(props: PageProps) {
  return (
    <RoutePage padding="8px">
      <div className={styles.home}>
        <h1 className={styles.title}>九五三の生活</h1>
        <div className={styles.grid}>
          {menus.map(item => (
            <Link key={item.route} className={styles.gridItem} href={item.route}>
              <Image src={item.image} alt="" objectFit='cover' style={{ width: '100%', height: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>
    </RoutePage>
  );
}
