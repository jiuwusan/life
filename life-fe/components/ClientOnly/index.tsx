import React, { useState, useEffect } from 'react';

type Props = {
  children: React.ReactNode;
};

export const ClientOnly = (props: Props) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return <>{isClient && props.children}</>;
};
