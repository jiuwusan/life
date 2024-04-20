import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // 是否开启节流
  throttle?: boolean;
  block?: boolean;
  nativeType?: 'button' | 'submit' | 'reset';
  type?: 'primary' | 'success' | 'danger' | '';
};

export function Button(props: ButtonProps) {
  const { nativeType = 'button', type = 'primary', block, className, ...rest } = props;
  return (
    <button
      type={nativeType}
      className={classNames([styles.button, styles[type], block && styles.block, className])}
      {...rest}
    />
  );
}
