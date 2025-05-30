import React from 'react';
import styles from './styles.module.scss';

type Color = 'red' | 'yellow' | 'blue';

interface BetBallProps {
  number: string | number;
  color?: Color;
  size?: number; // 直径（px）
  active?: boolean;
  onClick?: () => void;
}

export const BetBall: React.FC<BetBallProps> = ({
  number,
  color = 'red',
  size = 30,
  active = false,
  onClick,
}) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.max(12, size / 2),
    lineHeight: `${size}px`,
  };

  const classNames = [
    styles.ball,
    styles[color],
    active ? styles.active : '',
  ].join(' ');

  return (
    <div
      className={classNames}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {number}
    </div>
  );
};

