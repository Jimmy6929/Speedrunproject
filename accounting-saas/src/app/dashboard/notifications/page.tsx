'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, Notification } from '@/context/NotificationContext';

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    addTestNotification
  } = useNotifications();
  
  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeFilter);
  };
  
  const handleAction = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    navigateToRelevantPage(notification);
  };

  const navigateToRelevantPage = (notification: Notification) => {
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
      case 'system':
        // For system notifications, just stay on the current page
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    navigateToRelevantPage(notification);
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={addTestNotification}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50"
          >
            Create Test Notification
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeFilter === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeFilter === 'unread'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeFilter === 'payment'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveFilter('payment')}
            >
              Payments
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeFilter === 'alert'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveFilter('alert')}
            >
              Alerts
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeFilter === 'system'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveFilter('system')}
            >
              System
            </button>
          </nav>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            <p className="mt-4 text-lg font-medium dark:text-gray-300">No notifications</p>
            <p className="mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`relative px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                  !notification.read ? 'pl-10' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-red-500 rounded-l-md"></div>
                )}
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      notification.type === 'payment' ? 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400' :
                      notification.type === 'alert' ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' :
                      notification.type === 'system' ? 'bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400' :
                      notification.type === 'report' ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {notification.type === 'payment' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      {notification.type === 'alert' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {notification.type === 'system' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      )}
                      {notification.type === 'report' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                        </svg>
                      )}
                      {notification.type === 'client' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="mr-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(notification);
                      }}
                      className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium mr-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 