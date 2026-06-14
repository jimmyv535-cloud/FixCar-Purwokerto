
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Halaman ini dinonaktifkan karena login Google telah dihapus.
 * Mengarahkan siapapun yang mengakses rute ini kembali ke login.
 */
export default function InactiveCompleteProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
