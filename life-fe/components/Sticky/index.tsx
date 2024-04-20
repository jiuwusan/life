import styles from './styles.module.scss';
import classNames from 'classnames';
import { HTMLAttributes } from 'react';

type StickyProps = {
  children: React.ReactNode;
  type?: 'top' | 'bottom';
  fixed?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export function Sticky(props: StickyProps) {
  const { type = 'top', fixed, children, className, ...rest } = props;
  return (
    <div className={classNames(styles.stickyWrap, fixed && styles.fixed, styles[type], className)} {...rest}>
      {children}
    </div>
  );
}
