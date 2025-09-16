import { RoutePage } from '@/components';
import { useFetchState, useMounted } from '@/hooks/extend';
import { queryList, type Sensor } from './hooks';
import styles from './styles.module.scss';
import { useMemo } from 'react';

type Groups = {
  温度: Sensor[];
  风扇: Sensor[];
  磁盘: Sensor[];
  电压: Sensor[];
  状态: Sensor[];
};

// 分类函数
export const classifySensors = (data: Sensor[]): Groups => {
  const groups: Groups = {
    磁盘: [],
    风扇: [],
    温度: [],
    电压: [],
    状态: []
  };

  data.forEach(item => {
    const { name, value } = item;
    if (name.toLowerCase().includes('disk')) {
      groups['磁盘'].push(item);
    } else if (name.toLowerCase().includes('temp')) {
      groups['温度'].push(item);
    } else if (name.toLowerCase().includes('fan')) {
      groups['风扇'].push(item);
    } else if (/[0-9.]+/.test(value) && name.match(/V/i)) {
      groups['电压'].push(item);
    } else {
      groups['状态'].push(item);
    }
  });

  return groups;
};

// 格式化数值
const formatValue = (group: keyof Groups, val: string): string => {
  if (val === 'na') return 'N/A';
  if (group === '磁盘') return `${val} °C`;
  if (group === '温度') return `${val} °C`;
  if (group === '风扇') return `${val} RPM`;
  if (group === '电压') return `${val} V`;
  return val;
};

export const SensorDashboard = (props: { data: Sensor[] }) => {
  const { data } = props;
  const groups = useMemo(() => {
    return classifySensors(data);
  }, [data]);

  return (
    <div>
      <h2 className={styles.title}>监控看板</h2>
      {(Object.keys(groups) as (keyof Groups)[]).map(group => (
        <div key={group} className={styles.card}>
          <h3 className={styles.cardTitle}>{group}</h3>
          {groups[group].map(sensor => (
            <div key={sensor.uid} className={styles.item}>
              <span className={styles.label}>{sensor.name}</span>
              <span className={styles.value}>{formatValue(group, sensor.value)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

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
