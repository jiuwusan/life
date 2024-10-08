import { useRouter } from 'next/router';
import { RoutePage, ClientOnly } from '@/components';
import { useMemo } from 'react';

export default function Page() {
  const router = useRouter();
  const pdfurl = useMemo(() => decodeURIComponent((router.query.pdfurl || '') as string), [router.query.pdfurl]);
  return (
    <RoutePage>
      <ClientOnly>{pdfurl && <iframe src={pdfurl} width="100%" height="100vh"></iframe>}</ClientOnly>
    </RoutePage>
  );
}
