import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

type ButtonProps = {
  // 是否开启节流
  throttle?: boolean;
  block?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  type?: 'primary' | 'success' | 'danger' | 'default' | 'warning' | 'info' | 'text' | 'link';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export function Button(props: ButtonProps) {
  const { htmlType = 'button', type = 'primary', block, className, ...rest } = props;
  return (
    <button
      type={htmlType}
      className={classNames([styles.button, styles[type], block && styles.block, className])}
      {...rest}
    />
  );
}
