'use client';

import { useState, useEffect } from 'react';
import useInvoiceStore from '@/utils/invoiceStore';
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
import { Bar, Radar, PolarArea } from 'react-chartjs-2';

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
  const { formatCurrency, formatDate, preferences } = useSettings();
  const [timeRange, setTimeRange] = useState('all'); // 'all', '6m', '1y'
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

  // Calculate date ranges
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  // Filter invoices based on time range
  const getFilteredInvoices = () => {
    if (timeRange === 'all') return invoices;
    
    const cutoffDate = timeRange === '6m' ? sixMonthsAgo : oneYearAgo;
    return invoices.filter(inv => new Date(inv.issueDate) >= cutoffDate);
  };
  
  const filteredInvoices = getFilteredInvoices();
  
  // Calculate analytics
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const avgInvoiceValue = totalRevenue / (filteredInvoices.length || 1);
  const paidCount = filteredInvoices.filter(inv => inv.status === 'Paid').length;
  const unpaidCount = filteredInvoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').length;
  const paymentRate = (paidCount / (filteredInvoices.length || 1)) * 100;
  
  // Group invoices by client
  const clientData = filteredInvoices.reduce((acc, inv) => {
    if (!acc[inv.clientName]) {
      acc[inv.clientName] = {
        count: 0,
        value: 0,
      };
    }
    acc[inv.clientName].count += 1;
    acc[inv.clientName].value += inv.total;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);
  
  // Get top 5 clients by invoice count
  const topClientsByCount = Object.entries(clientData)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  
  // Get top 5 clients by value
  const topClientsByValue = Object.entries(clientData)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5);
  
  // Chart colors based on theme
  const chartTextColor = isDarkMode ? '#f9fafb' : '#171717';
  const chartGridColor = isDarkMode ? '#4b5563' : '#e5e7eb';
  
  // Client revenue distribution for Radar chart
  const clientDistributionData = {
    labels: topClientsByValue.map(([name]) => name),
    datasets: [
      {
        label: `Revenue (${preferences.currency})`,
        data: topClientsByValue.map(([_, data]) => data.value),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: chartGridColor,
        },
        pointLabels: {
          color: chartTextColor,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: chartTextColor,
        },
      },
    },
  };
  
  // Invoice status distribution
  const statusCounts = {
    'Paid': filteredInvoices.filter(inv => inv.status === 'Paid').length,
    'Unpaid': filteredInvoices.filter(inv => inv.status === 'Unpaid').length,
    'Partially Paid': filteredInvoices.filter(inv => inv.status === 'Partially Paid').length,
    'Overdue': filteredInvoices.filter(inv => inv.status === 'Overdue').length,
    'Cancelled': filteredInvoices.filter(inv => inv.status === 'Cancelled').length,
  };
  
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Number of Invoices',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(201, 203, 207, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartTextColor,
        },
      },
    },
  };
  
  // Calculate average time to payment
  const timeToPaymentDays = filteredInvoices
    .filter(inv => inv.status === 'Paid' && inv.paymentDate)
    .map(inv => {
      const issueDate = new Date(inv.issueDate);
      const paymentDate = new Date(inv.paymentDate as string);
      return Math.round((paymentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
    });
    
  const avgTimeToPayment = timeToPaymentDays.length 
    ? timeToPaymentDays.reduce((sum, days) => sum + days, 0) / timeToPaymentDays.length 
    : 0;
  
  // Average invoice value by month
  const getMonthlyAvgData = () => {
    // Group by month
    const monthlyData: Record<string, { total: number, count: number }> = {};
    
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { total: 0, count: 0 };
      }
      
      monthlyData[monthYear].total += inv.total;
      monthlyData[monthYear].count += 1;
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort();
    const averages = sortedMonths.map(month => {
      return {
        month: month,
        avg: monthlyData[month].total / monthlyData[month].count
      };
    });
    
    // Take only last 12 months if we have that many
    const recentMonths = averages.slice(-12);
    
    return {
      labels: recentMonths.map(item => {
        const [year, month] = item.month.split('-');
        return `${month}/${year.substring(2)}`;
      }),
      values: recentMonths.map(item => item.avg)
    };
  };
  
  const monthlyAvgData = getMonthlyAvgData();
  
  const avgInvoiceValueData = {
    labels: monthlyAvgData.labels,
    datasets: [
      {
        label: 'Average Invoice Value',
        data: monthlyAvgData.values,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      }
    ],
  };
  
  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: chartGridColor,
        },
        ticks: {
          color: chartTextColor,
        },
      },
      x: {
        grid: {
          color: chartGridColor,
        },
        ticks: {
          color: chartTextColor,
        },
      }
    },
    plugins: {
      legend: {
        labels: {
          color: chartTextColor,
        },
      },
    },
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
        <p className="text-gray-500 mt-1">Insights and trends to help drive your business decisions</p>
      </div>
      
      {/* Time Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '1y' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last Year
          </button>
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '6m' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last 6 Months
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{filteredInvoices.length} invoices</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Invoice</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(avgInvoiceValue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Per invoice average</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{paymentRate.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{paidCount} of {filteredInvoices.length} invoices paid</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Time to Payment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(avgTimeToPayment)} days</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">From issue to payment</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Client Revenue Distribution</h2>
          <div className="h-80">
            <Radar 
              data={clientDistributionData}
              options={radarOptions}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Status Distribution</h2>
          <div className="h-80">
            <PolarArea 
              data={statusData}
              options={polarOptions}
            />
          </div>
        </div>
      </div>
      
      {/* Monthly Average Invoice Value */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Average Invoice Value</h2>
        <Bar 
          data={avgInvoiceValueData}
          options={barOptions}
        />
      </div>
      
      {/* Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Clients by Invoice Count</h2>
          <div className="space-y-4">
            {topClientsByCount.map(([name, data], index) => (
              <div key={name} className="flex items-center">
                <div className="w-8 text-gray-500 font-medium">{index + 1}.</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{name}</div>
                  <div className="text-sm text-gray-500">{data.count} invoices</div>
                </div>
                <div className="text-sm font-medium text-gray-900">{formatCurrency(data.value)}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Clients by Revenue</h2>
          <div className="space-y-4">
            {topClientsByValue.map(([name, data], index) => (
              <div key={name} className="flex items-center">
                <div className="w-8 text-gray-500 font-medium">{index + 1}.</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{name}</div>
                  <div className="text-sm text-gray-500">{data.count} invoices</div>
                </div>
                <div className="text-sm font-medium text-gray-900">{formatCurrency(data.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 