'use client';

import { useState } from 'react';
import useInvoiceStore, { Invoice } from '@/utils/invoiceStore';
import useTransactionStore, { Transaction } from '@/utils/transactionStore';
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
import { Bar, Radar, PolarArea, Pie, Doughnut } from 'react-chartjs-2';

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

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function Analytics() {
  const invoices = useInvoiceStore(state => state.invoices);
  const transactions = useTransactionStore(state => state.transactions);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '6m', '1y'
  
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
  
  // Filter transactions based on time range
  const getFilteredTransactions = () => {
    if (timeRange === 'all') return transactions;
    
    const cutoffDate = timeRange === '6m' ? sixMonthsAgo : oneYearAgo;
    return transactions.filter(trx => new Date(trx.date) >= cutoffDate);
  };
  
  const filteredInvoices = getFilteredInvoices();
  const filteredTransactions = getFilteredTransactions();
  
  // Calculate analytics
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const avgInvoiceValue = totalRevenue / (filteredInvoices.length || 1);
  const paidCount = filteredInvoices.filter(inv => inv.status === 'Paid').length;
  const unpaidCount = filteredInvoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').length;
  const paymentRate = (paidCount / (filteredInvoices.length || 1)) * 100;
  const totalIncome = filteredTransactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  
  // Calculate financial health metrics
  const liquidityRatio = totalIncome > 0 ? totalIncome / (totalExpenses || 1) : 0;
  const profitMargin = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
  
  // Mock budget data (in a real app, this would come from a budget store)
  const mockBudget = {
    Income: 10000,
    Expense: 8000,
    'Office rent payment': 1000,
    'Software subscription': 200,
    'Office supplies': 300,
    'Utility bill payment': 500,
    'Employee salaries': 6000
  };
  
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
  
  // Group transactions by category
  const categoryData = filteredTransactions.reduce((acc, trx) => {
    if (!acc[trx.category]) {
      acc[trx.category] = {
        count: 0,
        value: 0,
      };
    }
    acc[trx.category].count += 1;
    acc[trx.category].value += trx.amount;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);
  
  // Get top 5 categories by count
  const topCategoriesByCount = Object.entries(categoryData)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  
  // Get top 5 categories by value
  const topCategoriesByValue = Object.entries(categoryData)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5);
  
  // Client revenue distribution for Radar chart
  const clientDistributionData = {
    labels: topClientsByValue.map(([name]) => name),
    datasets: [
      {
        label: 'Revenue ($)',
        data: topClientsByValue.map(([_, data]) => data.value),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
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
  
  // Transaction type distribution
  const transactionTypeData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        label: 'Transactions by Type',
        data: [
          filteredTransactions.filter(trx => trx.type === 'Credit').length,
          filteredTransactions.filter(trx => trx.type === 'Debit').length,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
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
  
  // Expense categories for Pie chart
  const expenseCategoriesData = {
    labels: topCategoriesByValue
      .filter(([cat, _]) => filteredTransactions.some(t => t.type === 'Debit' && t.category === cat))
      .map(([cat, _]) => cat),
    datasets: [
      {
        label: 'Expenses by Category',
        data: topCategoriesByValue
          .filter(([cat, _]) => filteredTransactions.some(t => t.type === 'Debit' && t.category === cat))
          .map(([_, data]) => data.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };
  
  // Budget vs Actual for expense categories
  const getBudgetVsActualData = () => {
    const relevantCategories = topCategoriesByValue
      .filter(([cat, _]) => filteredTransactions.some(t => t.type === 'Debit' && t.category === cat))
      .map(([cat, _]) => cat)
      .filter(cat => mockBudget[cat] !== undefined); // Only include categories with budgets
    
    const actualValues = relevantCategories.map(cat => {
      return filteredTransactions
        .filter(t => t.type === 'Debit' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
    });
    
    const budgetValues = relevantCategories.map(cat => mockBudget[cat] || 0);
    
    return {
      labels: relevantCategories,
      actualValues,
      budgetValues
    };
  };
  
  const budgetData = getBudgetVsActualData();
  
  const budgetVsActualData = {
    labels: budgetData.labels,
    datasets: [
      {
        label: 'Actual',
        data: budgetData.actualValues,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Budget',
        data: budgetData.budgetValues,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  };
  
  // Overall budget vs actual
  const overallBudgetVsActual = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Actual',
        data: [totalIncome, totalExpenses],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Budget',
        data: [mockBudget.Income || 0, mockBudget.Expense || 0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
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
      
      {/* Financial Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
              <p className={`text-2xl font-bold text-gray-900 mt-1 ${
                netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>{formatCurrency(netCashFlow)}</p>
            </div>
            <div className={`p-3 rounded-full ${
              netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Total income minus expenses</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{profitMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Net income / Total income</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Liquidity Ratio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{liquidityRatio.toFixed(2)}x</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Income to expense ratio</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{paymentRate.toFixed(1)}%</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{paidCount} of {filteredInvoices.length} invoices paid</p>
        </div>
      </div>
      
      {/* Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overall Budget vs Actual</h2>
          <Bar 
            data={overallBudgetVsActual}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Budget vs Actual</h2>
          <div className="h-80">
            <Bar 
              data={budgetVsActualData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Transaction Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Types</h2>
          <div className="h-64">
            <Doughnut 
              data={transactionTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h2>
          <div className="h-64">
            <Pie 
              data={expenseCategoriesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Client & Invoice Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Client Revenue Distribution</h2>
          <div className="h-80">
            <Radar 
              data={clientDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Status Distribution</h2>
          <div className="h-80">
            <PolarArea 
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Time & Value Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Average Invoice Value</h2>
        <Bar 
          data={avgInvoiceValueData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
        <div className="mt-4 text-center">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Avg. Time to Payment: {Math.round(avgTimeToPayment)} days
          </div>
        </div>
      </div>
      
      {/* Top Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Expense Categories</h2>
          <div className="space-y-4">
            {topCategoriesByValue
              .filter(([cat, _]) => filteredTransactions.some(t => t.type === 'Debit' && t.category === cat))
              .map(([category, data], index) => (
                <div key={category} className="flex items-center">
                  <div className="w-8 text-gray-500 font-medium">{index + 1}.</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{category}</div>
                    <div className="text-sm text-gray-500">{data.count} transactions</div>
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