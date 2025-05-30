import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import styles from './styles.module.scss';

export interface PopupProps {
  title?: string;
  visible: boolean;
  scroll?: boolean;
  zIndex?: number;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Popup: React.FC<PopupProps> & {
  show: (options: PopupOptions) => void;
  closeAll: () => void;
} = ({ title, visible, scroll, onClose, children, zIndex = 999 }) => {
  const [show, setShow] = useState(visible);
  const [value, setValue] = useState(false);

  const animationEnd = () => {
    !show && setValue(show);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow(false);
    typeof onClose === 'function' && onClose();
  };

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    show && setValue(show);
  }, [show]);

  if (!value) return null;

  return ReactDOM.createPortal(
    <div className={`${styles.popupOverlay} ${show ? styles.popupEnter : styles.popupLeave}`} style={{ zIndex }} onClick={handleClose}>
      <div className={styles.popupContentWrap} onAnimationEnd={animationEnd} onClick={e => e.stopPropagation()}>
        <div className={styles.popupCloseBtn} onClick={handleClose}>
          &times;
        </div>
        {title && <div className={styles.popupTitle}>{title}</div>}
        <div className={`${styles.popupContent} ${scroll && styles.popupContentScroller}`}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export interface PopupOptions {
  content: React.ReactNode;
  onClose?: () => void;
}

export type PopupInstance = {
  id: number;
  close: () => void;
  unmount: () => void;
};

let idCounter = 0;
const instances: PopupInstance[] = [];

function removeInstance(id: number) {
  const index = instances.findIndex(i => i.id === id);
  if (index !== -1) {
    instances.splice(index, 1);
  }
}

Popup.show = function (options: PopupOptions) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);

  const popupId = ++idCounter;
  const zIndex = 1000 + popupId;

  let closeRef: () => void = () => {};

  const PopupWrapper = () => {
    const [visible, setVisible] = useState(true);

    const handleClose = () => {
      setVisible(false);
      options.onClose?.();

      setTimeout(() => {
        root.unmount();
        container.remove();
        removeInstance(popupId);
      }, 300);
    };

    closeRef = handleClose;

    return (
      <Popup visible={visible} onClose={handleClose} zIndex={zIndex}>
        {options.content}
      </Popup>
    );
  };

  instances.push({
    id: popupId,
    close: () => closeRef(),
    unmount: () => {
      root.unmount();
      container.remove();
    }
  });

  root.render(<PopupWrapper />);
};

Popup.closeAll = function () {
  // 复制一份，避免迭代过程中变更
  const all = [...instances];
  instances.length = 0;

  all.forEach(instance => instance.close());
};
