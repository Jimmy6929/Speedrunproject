'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define settings types
export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export type CompanySettings = {
  companyName: string;
  address: string;
  taxId: string;
  website: string;
  logo: string;
}

export type PreferenceSettings = {
  currency: string;
  dateFormat: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    invoiceReminders: boolean;
    paymentReceipts: boolean;
  }
}

type SettingsContextType = {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
  preferences: PreferenceSettings;
  setPreferences: (prefs: PreferenceSettings) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  applyTheme: (theme: string) => void;
  isLoaded: boolean;
};

const defaultPreferences: PreferenceSettings = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    invoiceReminders: true,
    paymentReceipts: true
  }
};

const defaultUserProfile: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  role: 'Administrator'
};

const defaultCompanySettings: CompanySettings = {
  companyName: 'Acme Corporation',
  address: '123 Business Ave, Suite 100, San Francisco, CA 94107',
  taxId: '12-3456789',
  website: 'www.acmecorp.com',
  logo: '/assets/logo.png'
};

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [preferences, setPreferences] = useState<PreferenceSettings>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Format currency according to preferences
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferences.currency,
    }).format(amount);
  };

  // Format date according to preferences
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    switch (preferences.dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  // Apply theme based on preferences
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Load settings from localStorage on first render
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedUserProfile = localStorage.getItem('userProfile');
        if (storedUserProfile) {
          setUserProfile(JSON.parse(storedUserProfile));
        }
        
        const storedCompanySettings = localStorage.getItem('companySettings');
        if (storedCompanySettings) {
          setCompanySettings(JSON.parse(storedCompanySettings));
        }
        
        const storedPreferences = localStorage.getItem('preferences');
        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences));
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);

  // Apply theme when preferences change
  useEffect(() => {
    if (isLoaded) {
      applyTheme(preferences.theme);
      
      // Save preferences to localStorage when they change
      localStorage.setItem('preferences', JSON.stringify(preferences));
    }
  }, [preferences, isLoaded]);

  return (
    <SettingsContext.Provider 
      value={{ 
        userProfile, 
        setUserProfile, 
        companySettings, 
        setCompanySettings, 
        preferences, 
        setPreferences, 
        formatCurrency, 
        formatDate,
        applyTheme,
        isLoaded
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 