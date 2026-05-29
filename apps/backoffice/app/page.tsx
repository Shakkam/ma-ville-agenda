'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, verifyToken, token } = useAuthStore();

  useEffect(() => {
    const redirect = async () => {
      // If we have a token, verify it
      if (token) {
        await verifyToken();
        if (isAuthenticated) {
          router.push('/dashboard');
          return;
        }
      }
      // No valid token, go to login
      router.push('/login');
    };

    redirect();
  }, [isAuthenticated, router, verifyToken, token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Chargement...</p>
    </div>
  );
}
