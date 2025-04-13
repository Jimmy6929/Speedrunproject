'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      router.push(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-2 text-gray-600">Loading...</p>
    </div>
  );
}
