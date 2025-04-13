'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, Notification } from '@/context/NotificationContext';

// Sample notifications for demo
const sampleNotifications = [
  {
    id: 1,
    title: 'New invoice payment',
    message: 'Client ABC Inc. has paid invoice #INV-2023-001',
    time: '2 minutes ago',
    read: false
  },
  {
    id: 2,
    title: 'Invoice overdue',
    message: 'Invoice #INV-2023-005 for XYZ Corp is now overdue',
    time: '3 hours ago',
    read: false
  },
  {
    id: 3,
    title: 'System update',
    message: 'The accounting system will be updated tomorrow at 2:00 AM',
    time: '1 day ago',
    read: true
  }
];

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const router = useRouter();

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    logout();
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Close the dropdown
    setIsNotificationsOpen(false);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'payment':
        router.push('/dashboard/invoices');
        break;
      case 'alert':
        router.push('/dashboard/invoices');
        break;
      case 'report':
        router.push('/dashboard/reports');
        break;
      case 'client':
        router.push('/dashboard/clients');
        break;
      default:
        // For system notifications, navigate to notifications page
        router.push('/dashboard/notifications');
        break;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 h-16 flex items-center justify-between px-6">
      <div className="flex items-center lg:hidden">
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex justify-end items-center space-x-4">
        <div className="relative">
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative"
            onClick={toggleNotifications}
            aria-label="Toggle notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700">
              <div className="px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id}
                      className={`relative px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !notification.read ? 'pl-8' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-red-500 rounded-l-md"></div>
                      )}
                      <div className="flex justify-between">
                        <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="px-4 py-2 border-t dark:border-gray-700">
                <Link 
                  href="/dashboard/notifications"
                  className="text-xs text-center block text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => setIsNotificationsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center text-sm rounded-full focus:outline-none"
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              if (isNotificationsOpen) setIsNotificationsOpen(false);
            }}
            aria-label="User menu"
          >
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {getInitials()}
            </div>
            <span className="ml-2 hidden md:block text-gray-700 dark:text-gray-300">
              {user?.name || 'User'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700">
              <Link 
                href="/dashboard/settings" 
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 