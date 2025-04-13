'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 