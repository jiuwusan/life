import { RoutePage, Button } from '@/components';
import { useRouter } from 'next/router';

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {}
  };
}

type PageProps = {};

// 页面
export default function Page(props: PageProps) {
  const router = useRouter();
  return (
    <RoutePage padding="8px">
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
