'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation items for the sidebar
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Transactions', href: '/dashboard/transactions', icon: '💸' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: '📝' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📉' },
  { name: 'Clients', href: '/dashboard/clients', icon: '👥' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white h-full w-64 border-r shadow-sm">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">Account Hub</h1>
        <p className="text-xs text-gray-500">Financial Management</p>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
} 