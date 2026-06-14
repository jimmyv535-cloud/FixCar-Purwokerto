
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Halaman perantara untuk menangani rute /member
 * Mengarahkan pengguna ke halaman login yang kemudian akan memproses redirect ke dashboard member.
 */
export default function MemberRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="font-bold uppercase tracking-widest text-xs opacity-50">Mengalihkan ke Akses Member...</p>
      </div>
    </div>
  );
}
