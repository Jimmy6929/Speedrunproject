'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [numbers, setNumbers] = useState<Array<{x: number, y: number, value: string, size: number, speed: number, color: string, rotation: number, rotationSpeed: number}>>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  // Check for dark mode preference
  useEffect(() => {
    // First check localStorage for saved preference
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedMode === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // If no saved preference, check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Listen for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't explicitly chosen a mode
      if (!localStorage.getItem('darkMode')) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    darkModeMediaQuery.addEventListener('change', handler);
    
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Generate flying numbers for the background
  useEffect(() => {
    const generateNumbers = () => {
      const newNumbers = [];
      // Different color palettes for light and dark mode
      const colors = isDarkMode 
        ? ['#2196F3', '#1976D2', '#64B5F6', '#90CAF9', '#BBDEFB'] // Brighter blues for dark mode
        : ['#42A5F5', '#2196F3', '#1976D2', '#0D47A1', '#64B5F6']; // Darker blues for light mode
      const possibleValues = ['1', '0', '$', '%', '+', '-', '=', '/', '.', '2', '3', '4', '5', '6', '7', '8', '9'];
      
      for (let i = 0; i < 70; i++) {
        newNumbers.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          value: possibleValues[Math.floor(Math.random() * possibleValues.length)],
          size: Math.random() * 24 + 12, // Bigger numbers, between 12-36px
          speed: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2, // -1 to 1
        });
      }
      
      setNumbers(newNumbers);
    };
    
    generateNumbers();
    
    // Regenerate on window resize
    window.addEventListener('resize', generateNumbers);
    return () => window.removeEventListener('resize', generateNumbers);
  }, [isDarkMode]);
  
  // Animate flying numbers
  useEffect(() => {
    const animateNumbers = () => {
      setNumbers(prevNumbers => 
        prevNumbers.map(number => ({
          ...number,
          y: number.y - number.speed, // Move upward
          x: number.x + Math.sin(number.y * 0.02) * 1, // Gentle side-to-side movement
          rotation: number.rotation + number.rotationSpeed,
          // Reset numbers that go off screen
          ...(number.y < -50 ? {
            y: window.innerHeight + 50,
            x: Math.random() * window.innerWidth,
            rotation: Math.random() * 360
          } : {})
        }))
      );
    };
    
    const animationId = setInterval(animateNumbers, 40);
    return () => clearInterval(animationId);
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle dark mode manually
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', newDarkMode ? 'dark' : 'light');
    
    // Update document class
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-blue-100'
      }`}
    >
      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-blue-100 text-gray-700 hover:bg-blue-200'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
      
      {/* Animated Flying Numbers Background */}
      {numbers.map((number, index) => (
        <div 
          key={index}
          className={`absolute font-bold ${isDarkMode ? 'opacity-20' : 'opacity-30'}`}
          style={{
            fontSize: `${number.size}px`,
            left: `${number.x}px`,
            top: `${number.y}px`,
            color: number.color,
            transform: `rotate(${number.rotation}deg)`,
            transition: 'top 0.4s linear, left 0.4s ease-in-out, transform 0.4s ease',
          }}
        >
          {number.value}
        </div>
      ))}
      
      <div className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl z-10 animate-fadeIn
        ${isDarkMode 
          ? 'bg-[#1e1e1e] backdrop-blur-sm border border-gray-700 shadow-gray-900/20' 
          : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Logo - with theme-based version */}
          <div className="w-80 h-80 relative mb-4">
            {isDarkMode ? (
              <Image 
                src="/specount101-logo-dark.png" 
                alt="Specount101 Logo" 
                width={320} 
                height={320}
                className="animate-pulse-subtle drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                priority
              />
            ) : (
              <Image 
                src="/specount101-logo.png" 
                alt="Specount101 Logo" 
                width={320} 
                height={320}
                className="animate-pulse-subtle"
                priority
              />
            )}
          </div>
          
          <h2 className={`mt-2 text-center text-3xl font-extrabold transition-all duration-500 
            ${isDarkMode 
              ? 'text-white hover:text-blue-400' 
              : 'text-gray-900 hover:text-blue-600'
            }`}
          >
            Sign in to your account
          </h2>
          <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Or{' '}
            <a 
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley" 
              target="_blank"
              rel="noopener noreferrer" 
              className={`font-medium transition-colors duration-300
              ${isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              start your 14-day free trial
            </a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border rounded-t-md focus:outline-none focus:ring-blue-500 focus:ring-opacity-60 focus:z-10 sm:text-sm transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-blue-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-blue-400 focus:border-blue-500'
                  }`}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border rounded-b-md focus:outline-none focus:ring-blue-500 focus:ring-opacity-60 focus:z-10 sm:text-sm transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-blue-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-blue-400 focus:border-blue-500'
                  }`}
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className={`${isDarkMode ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded relative animate-shake`} role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-offset-gray-800' 
                    : 'border-gray-300 text-blue-600'
                  }
                `}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className={`font-medium transition-all duration-300 hover:underline
                ${isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 transition-all duration-300 transform hover:scale-105
                ${isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:bg-blue-800/70' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300'
                }`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className={`h-5 w-5 ${isDarkMode ? 'text-blue-300 group-hover:text-blue-200' : 'text-blue-500 group-hover:text-blue-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="mt-2">
            Demo credentials: <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>demo@example.com</span> / <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>password123</span>
          </p>
        </div>
      </div>
    </div>
  );
} 