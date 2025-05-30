import { Popup, ClientOnly, Iconfont } from '@/components';
import { useState } from 'react';

const BetButton = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <div onClick={() => setVisible(true)}>
        <Iconfont name="add-circle" />
      </div>
      <ClientOnly>
        <Popup scroll title="提示" visible={visible} onClose={() => setVisible(false)}>
          <div style={{ minHeight: '80vh', padding: '12px' }}>这是弹窗</div>
        </Popup>
      </ClientOnly>
    </>
  );
};

// 页面
export default function Page() {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div onClick={() => setVisible(true)}>测试</div>
      <BetButton />
    </div>
  );
}
