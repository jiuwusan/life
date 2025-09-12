import { RoutePage } from '@/components';
import { useFetchState, useMounted } from '@/hooks/extend';
import { queryList } from './hooks';
import { SensorDashboard } from './_sensor';

// 页面
export default function Page() {
  const { data = [], fetchData } = useFetchState(queryList);
  useMounted(() => {
    fetchData();
  });
  return (
    <RoutePage padding="16px">
      <SensorDashboard data={data} />
    </RoutePage>
  );
}
