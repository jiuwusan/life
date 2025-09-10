import { RoutePage } from '@/components';

// 在服务端获取数据
export async function getServerSideProps() {
  return {
    props: {}
  };
}

type PageProps = {};

// 页面
export default function Page(props: PageProps) {
  return (
    <RoutePage padding="8px">
        订阅列表
    </RoutePage>
  );
}
