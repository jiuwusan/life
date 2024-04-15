import { getBackgroundImage } from '@/utils/util';
import { RoutePage } from '@/components';

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
  return (<RoutePage bg={bgImage} padding="8px">首页</RoutePage>);
}