import styles from './styles.module.scss';
import classNames from 'classnames';
import { HTMLAttributes, useRef, useEffect, useState, CSSProperties } from 'react';

export type StickyProps = {
  children: React.ReactNode;
  type?: 'top' | 'bottom';
  fixed?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export function Sticky(props: StickyProps) {
  const { type = 'top', fixed, children, className, ...rest } = props;
  const [fillStyle, setFillStyle] = useState<CSSProperties>({});
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (container.current) {
      const { clientHeight } = container.current;
      setFillStyle({ height: `${clientHeight}px`, width: '100%' });
    }
  },[]);

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
