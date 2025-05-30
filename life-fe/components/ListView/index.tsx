import { useMemo, useEffect, useRef, HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';

// 简易节流函数
function throttle<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let lastTime = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime > wait) {
      lastTime = now;
      fn(...args);
    }
  };
}

export type LoadingProps = {
  pending?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
} & HTMLAttributes<HTMLDivElement>;

export function Loading(props: LoadingProps) {
  const { loadMore, hasMore, pending, className, ...rest } = props;
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 包装 loadMore 为节流版本
  const throttledLoadMore = useMemo(() => {
    if (typeof loadMore !== 'function') return undefined;
    return throttle(loadMore, 500);
  }, [loadMore]);

  useEffect(() => {
    if (!throttledLoadMore) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && !pending && hasMore) {
          console.log('Loading more items...');
          throttledLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }
    );

    const currentRef = observerRef.current;
    currentRef && observer.observe(currentRef);

    return () => {
      currentRef && observer.unobserve(currentRef);
    };
  }, [throttledLoadMore, pending, hasMore]);

  const loadingText = useMemo(() => {
    if (pending) return '加载中...';
    if (!hasMore) return '没有更多了';
    return '上拉加载更多';
  }, [pending, hasMore]);

  return (
    <div ref={observerRef} className={classNames(styles.listLoadingWrap, className)} {...rest}>
      {loadingText}
    </div>
  );
}

export type ListViewProps = {
  children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function ListView(props: ListViewProps) {
  const { children, ...rest } = props;

  return <div {...rest}>{children}</div>;
}
