import { HTMLAttributes } from 'react';
import classNames from 'classnames';
// 作为全局样式 引入
import './iconfont.css';

type IconfontProps = {
  name: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'name'>;

export function Iconfont(props: IconfontProps) {
  const { name, className, ...rest } = props;
  return <span className={classNames(['iconfont', 'jws-icon_' + name, className])} {...rest} />;
}
