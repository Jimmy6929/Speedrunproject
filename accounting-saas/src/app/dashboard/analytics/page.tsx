'use client';

import { useState, useEffect } from 'react';
import useInvoiceStore from '@/utils/invoiceStore';
import useTransactionStore from '@/utils/transactionStore';
import { useSettings } from '@/context/SettingsContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';

// Import custom hooks for data processing
import { useInvoiceAnalytics } from '@/hooks/useInvoiceAnalytics';
import { useClientAnalytics } from '@/hooks/useClientAnalytics';
import { useRevenueForecast } from '@/hooks/useRevenueForecast';

// Import components
import TimeRangeSelector from '@/components/analytics/TimeRangeSelector';
import KpiCards from '@/components/analytics/KpiCards';
import ClientRevenueDistribution from '@/components/analytics/ClientRevenueDistribution';
import InvoiceStatusDistribution from '@/components/analytics/InvoiceStatusDistribution';
import TopClients from '@/components/analytics/TopClients';
import InsightsPanel from '@/components/analytics/InsightsPanel';
import ClientInsights from '@/components/analytics/ClientInsights';
import TrendForecastChart from '@/components/analytics/TrendForecastChart';
import SubscriptionMetrics from '@/components/analytics/SubscriptionMetrics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

export default function Analytics() {
  const invoices = useInvoiceStore(state => state.invoices);
  const transactions = useTransactionStore(state => state.transactions);
  const { formatCurrency, formatDate, preferences } = useSettings();
  const [timeRange, setTimeRange] = useState<'all' | '6m' | '1y'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check if dark mode is active
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    // Initial check
    updateTheme();
    
    // Set up a MutationObserver to watch for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [preferences.theme]);

  // Use our custom hooks for data processing
  const invoiceAnalytics = useInvoiceAnalytics(invoices, timeRange);
  const clientAnalytics = useClientAnalytics(invoices);
  const forecastData = useRevenueForecast(invoices, transactions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Insights and trends to help drive your business decisions</p>
      </div>
      
      {/* Time Range Selector */}
      <TimeRangeSelector 
        timeRange={timeRange} 
        onChange={(range) => setTimeRange(range)} 
      />
      
      {/* Insights Panel */}
      <InsightsPanel 
        topMonths={invoiceAnalytics.topMonths}
        biggestRevenueSwing={invoiceAnalytics.biggestRevenueSwing}
        formatCurrency={formatCurrency}
      />
      
      {/* KPI Cards */}
      <KpiCards 
        totalRevenue={invoiceAnalytics.totalRevenue}
        avgInvoiceValue={invoiceAnalytics.avgInvoiceValue}
        paymentRate={invoiceAnalytics.paymentRate}
        avgTimeToPayment={invoiceAnalytics.avgTimeToPayment}
        totalInvoices={invoiceAnalytics.paidCount + invoiceAnalytics.unpaidCount}
        paidInvoices={invoiceAnalytics.paidCount}
        formatCurrency={formatCurrency}
      />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientRevenueDistribution 
          topClientsByValue={invoiceAnalytics.topClientsByValue}
          isDarkMode={isDarkMode}
          currencySymbol={preferences.currency}
        />
        
        <InvoiceStatusDistribution 
          statusCounts={invoiceAnalytics.statusCounts}
          isDarkMode={isDarkMode}
        />
      </div>
      
      {/* Top Clients */}
      <TopClients 
        topClientsByCount={invoiceAnalytics.topClientsByCount}
        topClientsByValue={invoiceAnalytics.topClientsByValue}
        formatCurrency={formatCurrency}
      />
      
      {/* Client Behavior Insights */}
      <ClientInsights 
        latePaymentClients={clientAnalytics.latePaymentClients}
        churnRiskClients={clientAnalytics.churnRiskClients}
        valuableClients={clientAnalytics.valuableClients}
        formatCurrency={formatCurrency}
      />
      
      {/* Forecasting & Subscription Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Forecasting */}
        <TrendForecastChart 
          forecastData={forecastData}
          formatCurrency={formatCurrency}
        />
        
        {/* Subscription Metrics */}
        <SubscriptionMetrics 
          forecastData={forecastData}
          churnRiskClients={clientAnalytics.churnRiskClients}
          clientBehaviorCount={Object.keys(clientAnalytics.clientBehavior).length}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
} 