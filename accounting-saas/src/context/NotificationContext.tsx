'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define notification types
export type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'payment' | 'alert' | 'system' | 'report' | 'client';
  read: boolean;
};

// Sample notifications for first-time users
const defaultNotifications: Notification[] = [
  {
    id: 1,
    title: 'New invoice payment',
    message: 'Client ABC Inc. has paid invoice #INV-2023-001',
    time: '2 minutes ago',
    type: 'payment',
    read: false
  },
  {
    id: 2,
    title: 'Invoice overdue',
    message: 'Invoice #INV-2023-005 for XYZ Corp is now overdue',
    time: '3 hours ago',
    type: 'alert',
    read: false
  },
  {
    id: 3,
    title: 'System update',
    message: 'The accounting system will be updated tomorrow at 2:00 AM',
    time: '1 day ago',
    type: 'system',
    read: true
  },
  {
    id: 4,
    title: 'New client registered',
    message: 'TechCorp Ltd. has been added as a new client',
    time: '2 days ago',
    type: 'client',
    read: true
  },
  {
    id: 5,
    title: 'Financial report ready',
    message: 'The Q2 financial report is now available for download',
    time: '3 days ago',
    type: 'report',
    read: true
  }
];

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  addTestNotification: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load notifications from localStorage on initial render
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        } else {
          // Use defaults for first time
          setNotifications(defaultNotifications);
          localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
        setNotifications(defaultNotifications);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadNotifications();
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Delete a notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newId = notifications.length > 0 
      ? Math.max(...notifications.map(n => n.id)) + 1 
      : 1;
    
    const newNotification: Notification = {
      ...notification,
      id: newId,
      read: false
    };
    
    setNotifications([newNotification, ...notifications]);
  };

  // Add a test notification for demo purposes
  const addTestNotification = () => {
    const types: Notification['type'][] = ['payment', 'alert', 'system', 'report', 'client'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    let title = '';
    let message = '';

    switch(randomType) {
      case 'payment':
        title = 'New invoice payment';
        message = `Client XYZ Corp has paid invoice #INV-2023-${Math.floor(Math.random() * 100)}`;
        break;
      case 'alert':
        title = 'Invoice overdue';
        message = `Invoice #INV-2023-${Math.floor(Math.random() * 100)} for ABC Inc is now overdue`;
        break;
      case 'system':
        title = 'System update';
        message = 'The system will be updated tonight for maintenance';
        break;
      case 'report':
        title = 'Report ready';
        message = 'Your monthly financial report is now available';
        break;
      case 'client':
        title = 'New client added';
        message = 'A new client has been added to your account';
        break;
    }

    addNotification({
      title,
      message,
      time: 'Just now',
      type: randomType
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        addTestNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 