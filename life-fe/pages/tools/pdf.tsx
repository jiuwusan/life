import { useRouter } from 'next/router';
import { RoutePage, ClientOnly } from '@/components';
import { useMemo } from 'react';

export default function Page() {
  const router = useRouter();
  const pdfurl = useMemo(() => decodeURIComponent((router.query.pdfurl || '') as string), [router.query.pdfurl]);
  return (
    <RoutePage>
      <ClientOnly>pdf
      </ClientOnly>
    </RoutePage>
  );
}
