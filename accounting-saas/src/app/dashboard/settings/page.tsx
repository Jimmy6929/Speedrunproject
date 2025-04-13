'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSettings, UserProfile, CompanySettings, PreferenceSettings } from '@/context/SettingsContext';

export default function Settings() {
  const router = useRouter();
  const { 
    userProfile, 
    setUserProfile, 
    companySettings, 
    setCompanySettings, 
    preferences, 
    setPreferences, 
    formatCurrency, 
    formatDate,
    isLoaded
  } = useSettings();
  
  // Active tab state
  const [activeTab, setActiveTab] = React.useState('profile');
  
  // Handle form submissions
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    toast.success('Profile updated successfully!');
  };
  
  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    toast.success('Company settings updated successfully!');
  };
  
  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Settings context will automatically save to localStorage
    toast.success('Preferences updated successfully!');
  };
  
  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64">Loading settings...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>
      
      {/* Settings navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Profile
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'company'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Company
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>
      
      {/* Profile settings */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
                <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={userProfile.role}
                      onChange={(e) => setUserProfile({...userProfile, role: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                      <option>Administrator</option>
                      <option>Accountant</option>
                      <option>Billing Manager</option>
                      <option>Read-only</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Company settings */}
      {activeTab === 'company' && (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleCompanySubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                <p className="mt-1 text-sm text-gray-500">This information will appear on your invoices.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      value={companySettings.companyName}
                      onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                    Tax ID / EIN
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="taxId"
                      id="taxId"
                      value={companySettings.taxId}
                      onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="website"
                      id="website"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="logo"
                      id="logo"
                      value={companySettings.logo}
                      onChange={(e) => setCompanySettings({...companySettings, logo: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Preferences settings */}
      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handlePreferencesSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">Customize your application experience.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <div className="mt-1">
                    <select
                      id="currency"
                      name="currency"
                      value={preferences.currency}
                      onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Example: {formatCurrency(1234.56)}
                  </p>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                    Date Format
                  </label>
                  <div className="mt-1">
                    <select
                      id="dateFormat"
                      name="dateFormat"
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Example: {formatDate(new Date())}
                  </p>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <div className="mt-1">
                    <select
                      id="theme"
                      name="theme"
                      value={preferences.theme}
                      onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Controls the application appearance
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email"
                        name="email"
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => 
                          setPreferences({
                            ...preferences, 
                            notifications: {
                              ...preferences.notifications,
                              email: e.target.checked
                            }
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email" className="font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-gray-500">Receive email notifications for important events.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="push"
                        name="push"
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => 
                          setPreferences({
                            ...preferences, 
                            notifications: {
                              ...preferences.notifications,
                              push: e.target.checked
                            }
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="push" className="font-medium text-gray-700">
                        Push Notifications
                      </label>
                      <p className="text-gray-500">Receive browser push notifications.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="invoiceReminders"
                        name="invoiceReminders"
                        type="checkbox"
                        checked={preferences.notifications.invoiceReminders}
                        onChange={(e) => 
                          setPreferences({
                            ...preferences, 
                            notifications: {
                              ...preferences.notifications,
                              invoiceReminders: e.target.checked
                            }
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="invoiceReminders" className="font-medium text-gray-700">
                        Invoice Reminders
                      </label>
                      <p className="text-gray-500">Receive reminders about upcoming and overdue invoices.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="paymentReceipts"
                        name="paymentReceipts"
                        type="checkbox"
                        checked={preferences.notifications.paymentReceipts}
                        onChange={(e) => 
                          setPreferences({
                            ...preferences, 
                            notifications: {
                              ...preferences.notifications,
                              paymentReceipts: e.target.checked
                            }
                          })
                        }
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="paymentReceipts" className="font-medium text-gray-700">
                        Payment Receipts
                      </label>
                      <p className="text-gray-500">Receive notifications when payments are made.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 