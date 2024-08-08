type PageProps = {
  name: string;
};
// 页面
export default function Page(props: PageProps) {
  return <div>测试页 {props.name || '张三'}</div>;
}
