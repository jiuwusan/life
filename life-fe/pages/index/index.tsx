import { getBackgroundImage } from '@/utils/util';
import { RoutePage, Button } from '@/components';
import { useRouter } from 'next/router';

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {
      // 背景图
      bgImage: getBackgroundImage()
    }
  };
}

type PageProps = {
  bgImage: string;
};

// 页面
export default function Page(props: PageProps) {
  const { bgImage } = props;
  const router = useRouter();
  return (
    <RoutePage bg={bgImage} padding="8px">
      首页
      <Button type="success" onClick={() => router.push('/test')}>
        测试页
      </Button>
      <Button type="success" onClick={() => router.push('/lottery/list')}>
        列表页
      </Button>
    </RoutePage>
  );
}
