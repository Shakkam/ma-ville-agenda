'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, verifyToken } = useAuthStore();

  useEffect(() => {
    verifyToken().then(() => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });
  }, [isAuthenticated, router, verifyToken]);

  return null;
}
