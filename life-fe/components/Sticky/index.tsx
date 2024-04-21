import styles from './styles.module.scss';
import classNames from 'classnames';
import { HTMLAttributes, useRef, useMemo } from 'react';

type StickyProps = {
  children: React.ReactNode;
  type?: 'top' | 'bottom';
  fixed?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export function Sticky(props: StickyProps) {
  const { type = 'top', fixed, children, className, ...rest } = props;
  const container = useRef<HTMLDivElement>(null);
  const fillStyle = useMemo(() => {
    if (!container.current) {
      return {};
    }
    const { clientHeight } = container.current;
    return {
      height: `${clientHeight}px`,
      width: '100%'
    };
  }, [container]);
  return (
    <>
      <div
        ref={container}
        className={classNames(styles.stickyWrap, fixed && styles.fixed, styles[type], className)}
        {...rest}>
        {children}
      </div>
      {fixed && <div style={fillStyle} />}
    </>
  );
}
