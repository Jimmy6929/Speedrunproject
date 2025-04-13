'use client';

import { useState, useEffect } from 'react';
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
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

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
  Filler
);

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Function to get month name from date string
const getMonthName = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'short' });
};

export default function Reports() {
  const invoices = useInvoiceStore(state => state.invoices);
  const transactions = useTransactionStore(state => state.transactions);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  
  // Derived statistics for invoices
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, invoice) => sum + invoice.total, 0);
  const totalUnpaid = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').reduce((sum, invoice) => sum + invoice.total, 0);
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').length;
  const avgInvoiceValue = totalRevenue / (totalInvoices || 1);
  
  // Derived statistics for transactions
  const totalIncome = transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
  
  // Get available years from invoice data
  const getAvailableYears = () => {
    const invoiceYears = invoices.map(inv => new Date(inv.issueDate).getFullYear());
    const transactionYears = transactions.map(t => new Date(t.date).getFullYear());
    const allYears = [...new Set([...invoiceYears, ...transactionYears])];
    return allYears.sort();
  };
  
  const availableYears = getAvailableYears();
  
  // Generate monthly data for revenue chart
  const getMonthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const revenueData = Array(12).fill(0);
    const paidData = Array(12).fill(0);
    const unpaidData = Array(12).fill(0);
    const incomeData = Array(12).fill(0);
    const expenseData = Array(12).fill(0);
    
    // Process invoice data
    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        revenueData[month] += invoice.total;
        
        if (invoice.status === 'Paid') {
          paidData[month] += invoice.total;
        } else if (invoice.status === 'Unpaid' || invoice.status === 'Overdue') {
          unpaidData[month] += invoice.total;
        }
      }
    });
    
    // Process transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        if (transaction.type === 'Credit') {
          incomeData[month] += transaction.amount;
        } else if (transaction.type === 'Debit') {
          expenseData[month] += transaction.amount;
        }
      }
    });
    
    return {
      labels: months.map(month => new Date(0, month).toLocaleString('default', { month: 'short' })),
      revenueData,
      paidData,
      unpaidData,
      incomeData,
      expenseData
    };
  };
  
  // Generate quarterly data
  const getQuarterlyData = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const revenueData = Array(4).fill(0);
    const paidData = Array(4).fill(0);
    const unpaidData = Array(4).fill(0);
    const incomeData = Array(4).fill(0);
    const expenseData = Array(4).fill(0);
    
    // Process invoice data
    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        const quarter = Math.floor(month / 3);
        
        revenueData[quarter] += invoice.total;
        
        if (invoice.status === 'Paid') {
          paidData[quarter] += invoice.total;
        } else if (invoice.status === 'Unpaid' || invoice.status === 'Overdue') {
          unpaidData[quarter] += invoice.total;
        }
      }
    });
    
    // Process transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        const quarter = Math.floor(month / 3);
        
        if (transaction.type === 'Credit') {
          incomeData[quarter] += transaction.amount;
        } else if (transaction.type === 'Debit') {
          expenseData[quarter] += transaction.amount;
        }
      }
    });
    
    return {
      labels: quarters,
      revenueData,
      paidData,
      unpaidData,
      incomeData,
      expenseData
    };
  };
  
  // Get data based on selected timeframe
  const getTimeframeData = () => {
    return selectedTimeframe === 'monthly' ? getMonthlyData() : getQuarterlyData();
  };
  
  const { labels, revenueData, paidData, unpaidData, incomeData, expenseData } = getTimeframeData();
  
  // Calculate cash flow (income - expenses)
  const cashFlowData = labels.map((_, index) => incomeData[index] - expenseData[index]);
  
  // Status distribution data for pie chart
  const statusDistribution = {
    labels: ['Paid', 'Unpaid', 'Partially Paid', 'Overdue', 'Cancelled'],
    datasets: [
      {
        label: 'Invoices by Status',
        data: [
          invoices.filter(inv => inv.status === 'Paid').length,
          invoices.filter(inv => inv.status === 'Unpaid').length,
          invoices.filter(inv => inv.status === 'Partially Paid').length,
          invoices.filter(inv => inv.status === 'Overdue').length,
          invoices.filter(inv => inv.status === 'Cancelled').length,
        ],
        backgroundColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(201, 203, 207)',
        ],
      },
    ],
  };
  
  // Revenue by status data for doughnut chart
  const revenueByStatus = {
    labels: ['Paid', 'Unpaid', 'Partially Paid', 'Overdue', 'Cancelled'],
    datasets: [
      {
        label: 'Revenue by Status',
        data: [
          invoices.filter(inv => inv.status === 'Paid').reduce((sum, invoice) => sum + invoice.total, 0),
          invoices.filter(inv => inv.status === 'Unpaid').reduce((sum, invoice) => sum + invoice.total, 0),
          invoices.filter(inv => inv.status === 'Partially Paid').reduce((sum, invoice) => sum + invoice.total, 0),
          invoices.filter(inv => inv.status === 'Overdue').reduce((sum, invoice) => sum + invoice.total, 0),
          invoices.filter(inv => inv.status === 'Cancelled').reduce((sum, invoice) => sum + invoice.total, 0),
        ],
        backgroundColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(201, 203, 207)',
        ],
      },
    ],
  };
  
  // Income vs Expense data for bar chart
  const incomeVsExpenseData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };
  
  // Cash flow data for line chart
  const cashFlowChartData = {
    labels,
    datasets: [
      {
        label: 'Net Cash Flow',
        data: cashFlowData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: true,
      }
    ]
  };
  
  // Revenue chart data
  const revenueChartData = {
    labels,
    datasets: [
      {
        label: 'Total Revenue',
        data: revenueData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Paid',
        data: paidData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Unpaid',
        data: unpaidData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  // Revenue trend (line chart)
  const revenueTrendData = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Revenue Trend',
        data: revenueData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
      },
    ],
  };
  
  // Get top clients by revenue
  const getTopClients = () => {
    const clientRevenue = new Map();
    
    invoices.forEach(invoice => {
      const currentAmount = clientRevenue.get(invoice.clientName) || 0;
      clientRevenue.set(invoice.clientName, currentAmount + invoice.total);
    });
    
    return [...clientRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));
  };
  
  const topClients = getTopClients();
  
  // Get expense categories breakdown
  const getExpenseCategories = () => {
    const categoryExpenses = new Map();
    
    transactions
      .filter(t => t.type === 'Debit')
      .forEach(transaction => {
        const currentAmount = categoryExpenses.get(transaction.category) || 0;
        categoryExpenses.set(transaction.category, currentAmount + transaction.amount);
      });
    
    return [...categoryExpenses.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount }));
  };
  
  const expenseCategories = getExpenseCategories();
  
  // Expense categories data for pie chart
  const expenseCategoriesData = {
    labels: expenseCategories.map(c => c.category),
    datasets: [
      {
        label: 'Expenses by Category',
        data: expenseCategories.map(c => c.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
        ],
      },
    ],
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 mt-1">Overview of your business performance</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {availableYears.length ? (
                availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
              Timeframe
            </label>
            <select
              id="timeframe"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
          <p className={`text-2xl font-bold mt-1 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netCashFlow)}
          </p>
          <p className="text-sm text-gray-500">
            {profitMargin.toFixed(1)}% profit margin
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>
      
      {/* Cash Flow and Income vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cash Flow</h2>
          <Line 
            data={cashFlowChartData}
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses</h2>
          <Bar 
            data={incomeVsExpenseData}
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
      </div>
      
      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h2>
          <Bar 
            data={revenueChartData}
            options={{
              responsive: true,
              scales: {
                x: {
                  stacked: false,
                },
                y: {
                  stacked: false,
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h2>
          <Line 
            data={revenueTrendData}
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
      </div>
      
      {/* Expense Categories and Invoice Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="mt-4 space-y-2">
            {expenseCategories.slice(0, 5).map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{category.category}</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(category.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Status Distribution</h2>
          <div className="h-64">
            <Pie 
              data={statusDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Top Clients and Revenue by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Clients</h2>
          <div className="space-y-4">
            {topClients.length > 0 ? (
              topClients.map((client, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-800">{client.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(client.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No client data available</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue by Status</h2>
          <div className="h-64">
            <Doughnut 
              data={revenueByStatus}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices
                .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                .slice(0, 5)
                .map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'Partially Paid' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 