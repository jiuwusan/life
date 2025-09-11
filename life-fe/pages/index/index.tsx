import classNames from 'classnames';
import { RoutePage, Image } from '@/components';
import Link from 'next/link';
import styles from './styles.module.scss';
import lotteryImage from './images/lottery.png';
import clashImage from './images/clash.jpg';
import tempImage from './images/temp.webp';
import cookbookImage from './images/cookbook.png';
// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {}
  };
}

type PageProps = {};

const menus = [
  { name: '家常菜', route: '/cookbook/list', image: cookbookImage },
  { name: '碰碰运气', route: '/lottery/list', image: lotteryImage, half: true },
  { name: '硬件监控', route: '/hardware/list', image: tempImage, half: true },
  { name: 'Clash 订阅', route: '/sub/list', image: clashImage, half: true }
];

export default function Page(props: PageProps) {
  return (
    <RoutePage padding="20px" title="九五三の生活助手">
      <div className={styles.home}>
        <h1 className={styles.title}>九五三の生活助手</h1>
        <div className={styles.grid}>
          {menus.map(item => (
            <Link key={item.route} className={classNames(styles.gridItem, item.half && styles.half)} href={item.route}>
              <Image src={item.image.src} alt={item.name} style={{ objectFit: 'cover', objectPosition: 'center' }} />
            </Link>
          ))}
        </div>
      </div>
    </RoutePage>
  );
}
