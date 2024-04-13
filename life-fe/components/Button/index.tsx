import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

type ButtonProps = {
  // 是否开启节流
  throttle?: boolean;
  block?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  const { type = 'button', block, ...rest } = props;
  return <button type={type} className={classNames([styles.button, block && styles.block])} {...rest} />;
}
