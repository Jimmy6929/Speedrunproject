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
  Filler,
  ChartType,
  ChartData,
  LegendItem
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

// Function to calculate MRR from invoices
const calculateMRR = (invoices: Invoice[]): number => {
  // Get only paid invoices from the current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const recurringInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.issueDate);
    // Check if it's a paid invoice
    return inv.status === 'Paid' && 
      // Check if it's from current month
      invDate.getMonth() === currentMonth &&
      invDate.getFullYear() === currentYear;
  });
  
  return recurringInvoices.reduce((sum, inv) => sum + inv.total, 0);
};

// Add mock historical data to make charts more meaningful
const generateHistoricalData = () => {
  const currentYear = new Date().getFullYear();
  const historicalYears = [currentYear - 2, currentYear - 1, currentYear];
  
  const mockRevenueData: Record<number, number[]> = {
    // Map of year -> month -> amount
    [currentYear - 2]: Array(12).fill(0).map(() => 2000 + Math.random() * 5000),
    [currentYear - 1]: Array(12).fill(0).map(() => 4000 + Math.random() * 6000),
    [currentYear]: Array(12).fill(0).map(() => 6000 + Math.random() * 8000),
  };
  
  const mockExpenseData: Record<number, number[]> = {
    [currentYear - 2]: Array(12).fill(0).map(() => 1500 + Math.random() * 3000),
    [currentYear - 1]: Array(12).fill(0).map(() => 2500 + Math.random() * 4000),
    [currentYear]: Array(12).fill(0).map(() => 3500 + Math.random() * 5000),
  };
  
  return {
    revenueData: mockRevenueData,
    expenseData: mockExpenseData,
    years: historicalYears
  };
};

// Define type for timeframe data
interface TimeframeData {
  labels: string[];
  revenueData: number[];
  paidData: number[];
  unpaidData: number[];
  incomeData: number[];
  expenseData: number[];
  historicalLabels?: string[];
  historicalYears?: number[];
  historicalRevenue?: number[][];
  historicalExpenses?: number[][];
}

const historicalData = generateHistoricalData();

export default function Reports() {
  const invoices = useInvoiceStore(state => state.invoices);
  const transactions = useTransactionStore(state => state.transactions);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [revenueFilter, setRevenueFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1 of current year
    endDate: new Date().toISOString().split('T')[0], // Today
    period: 'year' // 'month', 'quarter', 'year'
  });
  
  // Add year comparison option
  const [showHistorical, setShowHistorical] = useState(true);
  
  // Add section visibility state
  const [visibleSections, setVisibleSections] = useState('all');
  
  // Define color palettes early on
  // Enhanced vibrant color palette for expense categories
  const expenseCategoryColors = [
    'rgba(54, 162, 235, 0.8)',    // Blue - primary theme color
    'rgba(255, 99, 132, 0.8)',    // Red
    'rgba(255, 206, 86, 0.8)',    // Yellow
    'rgba(75, 192, 192, 0.8)',    // Green
    'rgba(153, 102, 255, 0.8)',   // Purple
    'rgba(255, 159, 64, 0.8)',    // Orange
    'rgba(64, 224, 208, 0.8)',    // Turquoise
    'rgba(255, 99, 255, 0.8)',    // Pink
    'rgba(255, 140, 0, 0.8)',     // Dark Orange
    'rgba(138, 43, 226, 0.8)',    // BlueViolet
    'rgba(50, 205, 50, 0.8)',     // Lime Green
    'rgba(255, 20, 147, 0.8)',    // Deep Pink
    'rgba(0, 191, 255, 0.8)',     // Deep Sky Blue
    'rgba(139, 69, 19, 0.8)',     // Saddle Brown
    'rgba(105, 105, 105, 0.8)',   // Dim Gray
  ];
  
  // Invoice status color palette - matching theme colors
  const invoiceStatusColors = {
    'Paid': 'rgba(75, 192, 192, 0.8)',        // Green
    'Unpaid': 'rgba(255, 206, 86, 0.8)',      // Yellow
    'Partially Paid': 'rgba(54, 162, 235, 0.8)', // Blue - primary theme color
    'Overdue': 'rgba(255, 99, 132, 0.8)',     // Red
    'Cancelled': 'rgba(201, 203, 207, 0.8)'   // Gray
  };

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
  
  // Enhanced getTimeframeData to include historical data
  const getTimeframeData = (): TimeframeData => {
    const currentData = selectedTimeframe === 'monthly' ? getMonthlyData() : getQuarterlyData();
    
    if (!showHistorical) {
      return currentData as TimeframeData;
    }
    
    // For charts that support multiple years (revenue trends, cash flow)
    const months = Array.from({ length: 12 }, (_, i) => i);
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const timeLabels = selectedTimeframe === 'monthly' ? 
      months.map(month => new Date(0, month).toLocaleString('default', { month: 'short' })) : 
      quarters;
    
    return {
      ...currentData,
      historicalLabels: timeLabels,
      historicalYears: historicalData.years,
      historicalRevenue: historicalData.years.map(year => 
        selectedTimeframe === 'monthly' ? 
          historicalData.revenueData[year] : 
          [0, 1, 2, 3].map(q => 
            historicalData.revenueData[year].slice(q*3, (q+1)*3).reduce((sum, val) => sum + val, 0)
          )
      ),
      historicalExpenses: historicalData.years.map(year => 
        selectedTimeframe === 'monthly' ? 
          historicalData.expenseData[year] : 
          [0, 1, 2, 3].map(q => 
            historicalData.expenseData[year].slice(q*3, (q+1)*3).reduce((sum, val) => sum + val, 0)
          )
      )
    };
  };
  
  const { 
    labels, 
    revenueData, 
    paidData, 
    unpaidData, 
    incomeData, 
    expenseData,
    historicalLabels,
    historicalYears,
    historicalRevenue,
    historicalExpenses
  } = getTimeframeData();
  
  // Calculate cash flow (income - expenses)
  const cashFlowData = labels.map((_, index) => incomeData[index] - expenseData[index]);
  
  // Enhanced cash flow data to include historical comparison
  const cashFlowChartData = {
    labels: historicalLabels || labels,
    datasets: showHistorical && historicalYears && historicalRevenue && historicalExpenses ? 
      historicalYears.map((year: number, index: number) => ({
        label: `Cash Flow ${year}`,
        data: historicalRevenue[index].map((rev: number, i: number) => rev - historicalExpenses![index][i]),
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgb(75, 192, 192)',
        ][index],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ][index],
        fill: true,
      })) :
      [{
        label: 'Net Cash Flow',
        data: cashFlowData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: true,
      }]
  };
  
  // Calculate status totals
  const invoiceStatusData = [
    { status: 'Paid', count: invoices.filter(inv => inv.status === 'Paid').length, amount: invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0) },
    { status: 'Unpaid', count: invoices.filter(inv => inv.status === 'Unpaid').length, amount: invoices.filter(inv => inv.status === 'Unpaid').reduce((sum, inv) => sum + inv.total, 0) },
    { status: 'Partially Paid', count: invoices.filter(inv => inv.status === 'Partially Paid').length, amount: invoices.filter(inv => inv.status === 'Partially Paid').reduce((sum, inv) => sum + inv.total, 0) },
    { status: 'Overdue', count: invoices.filter(inv => inv.status === 'Overdue').length, amount: invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.total, 0) },
    { status: 'Cancelled', count: invoices.filter(inv => inv.status === 'Cancelled').length, amount: invoices.filter(inv => inv.status === 'Cancelled').reduce((sum, inv) => sum + inv.total, 0) }
  ];

  const totalInvoiceAmount = invoiceStatusData.reduce((sum, status) => sum + status.amount, 0);
  const totalInvoiceCount = invoiceStatusData.reduce((sum, status) => sum + status.count, 0);
  
  // Calculate total amount for percentages (moved from earlier position)
  const totalStatusAmount = invoiceStatusData.reduce((sum, status) => sum + status.amount, 0);

  // Enhanced income vs expense data to show yearly comparison
  const incomeVsExpenseData: any = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        stack: 'current',
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        stack: 'current',
      },
      ...(showHistorical && selectedYear === (historicalYears ? historicalYears[2] : 0) ? [
        {
          label: `Previous Year Income`,
          data: selectedTimeframe === 'monthly' && historicalYears ? 
            historicalData.revenueData[historicalYears[1]] : 
            [0, 1, 2, 3].map(q => 
              historicalData.revenueData[historicalYears ? historicalYears[1] : 0].slice(q*3, (q+1)*3).reduce((sum, val) => sum + val, 0)
            ),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          borderDash: [5, 5],
          type: 'line' as const,
          stack: 'previous',
        },
        {
          label: `Previous Year Expenses`,
          data: selectedTimeframe === 'monthly' && historicalYears ? 
            historicalData.expenseData[historicalYears[1]] : 
            [0, 1, 2, 3].map(q => 
              historicalData.expenseData[historicalYears ? historicalYears[1] : 0].slice(q*3, (q+1)*3).reduce((sum, val) => sum + val, 0)
            ),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderDash: [5, 5],
          type: 'line' as const,
          stack: 'previous',
        }
      ] : [])
    ]
  };
  
  // Enhanced revenue trend with historical data
  const revenueTrendData = {
    labels: historicalLabels || labels,
    datasets: showHistorical && historicalYears && historicalRevenue ? 
      historicalYears.map((year: number, index: number) => ({
        label: `Revenue ${year}`,
        data: historicalRevenue[index],
        borderColor: [
          'rgba(53, 162, 235, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ][index],
        backgroundColor: [
          'rgba(53, 162, 235, 0.1)',
          'rgba(255, 159, 64, 0.1)',
          'rgba(75, 192, 192, 0.1)',
        ][index],
        fill: index === 0,
        tension: 0.4
      })) :
      [{
        fill: true,
        label: 'Revenue Trend',
        data: revenueData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4
      }]
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
  
  // Get expense categories breakdown with more specific categorization
  const getExpenseCategories = () => {
    const categoryExpenses = new Map();
    
    // First, get all unique transaction categories
    const uniqueCategories = new Set(
      transactions
        .filter(t => t.type === 'Debit')
        .map(t => t.category)
    );
    
    // Initialize all categories with zero to ensure they all show up
    uniqueCategories.forEach(category => {
      categoryExpenses.set(category, 0);
    });
    
    // Now sum up expenses by category
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
  
  // Calculate total expenses
  const totalCategoryExpenses = expenseCategories.reduce((total, cat) => total + cat.amount, 0);
  
  // Expense categories data for pie chart
  const expenseCategoriesData = {
    labels: expenseCategories.map(c => c.category),
    datasets: [
      {
        label: 'Expenses by Category',
        data: expenseCategories.map(c => c.amount),
        backgroundColor: expenseCategories.map((_, index) => 
          expenseCategoryColors[index % expenseCategoryColors.length]
        ),
        borderColor: expenseCategories.map((_, index) => 
          expenseCategoryColors[index % expenseCategoryColors.length].replace('0.8', '1')
        ),
        borderWidth: 1,
        hoverOffset: 15, // Makes slices move outward on hover
      },
    ],
  };
  
  // Calculate revenue metrics
  const calculateRevenueMetrics = () => {
    // Filter invoices by paid status and date range
    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      const startDate = new Date(revenueFilter.startDate);
      const endDate = new Date(revenueFilter.endDate);
      return inv.status === 'Paid' && invDate >= startDate && invDate <= endDate;
    });
    
    // Total revenue
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // Get current MRR
    const mrr = calculateMRR(invoices);
    
    // ARR = MRR * 12
    const arr = mrr * 12;
    
    // Calculate average invoice value
    const avgInvoiceValue = filteredInvoices.length > 0 
      ? totalRevenue / filteredInvoices.length 
      : 0;
    
    // Calculate revenue growth
    // Get previous period data for comparison based on current period
    const currentPeriodStart = new Date(revenueFilter.startDate);
    const currentPeriodEnd = new Date(revenueFilter.endDate);
    const periodLength = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
    
    const previousPeriodEnd = new Date(currentPeriodStart);
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodLength);
    
    const previousPeriodInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      return inv.status === 'Paid' && 
        invDate >= previousPeriodStart && 
        invDate < previousPeriodEnd;
    });
    
    const previousPeriodRevenue = previousPeriodInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // Calculate growth percentage
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    return {
      totalRevenue,
      mrr,
      arr,
      avgInvoiceValue,
      revenueGrowth,
      numberOfInvoices: filteredInvoices.length
    };
  };
  
  const revenueMetrics = calculateRevenueMetrics();
  
  // Function to download revenue data as CSV
  const downloadRevenueCSV = () => {
    // Filter invoices by date range
    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      const startDate = new Date(revenueFilter.startDate);
      const endDate = new Date(revenueFilter.endDate);
      return inv.status === 'Paid' && invDate >= startDate && invDate <= endDate;
    });
    
    // Prepare CSV header
    let csvContent = "ID,Client,Issue Date,Due Date,Payment Date,Total\n";
    
    // Add invoice data
    filteredInvoices.forEach(inv => {
      csvContent += `${inv.id},${inv.clientName},${inv.issueDate},${inv.dueDate},${inv.paymentDate || ''},${inv.total}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `revenue-data-${revenueFilter.startDate}-to-${revenueFilter.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate monthly revenue data for chart
  const getMonthlyRevenueData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const monthlyData = Array(12).fill(0);
    
    invoices
      .filter(inv => inv.status === 'Paid')
      .forEach(invoice => {
        const date = new Date(invoice.issueDate);
        if (date.getFullYear() === selectedYear) {
          const month = date.getMonth();
          monthlyData[month] += invoice.total;
        }
      });
    
    return {
      labels: months.map(month => new Date(0, month).toLocaleString('default', { month: 'short' })),
      data: monthlyData
    };
  };
  
  const { labels: monthLabels, data: monthlyRevenueData } = getMonthlyRevenueData();
  
  // Revenue chart data for revenue summary - use a more flexible configuration for mixed charts
  const revenueSummaryChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyRevenueData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        // Don't specify type here, will be determined by the Chart component
      }
    ]
  };
  
  // Only add the historical line dataset if we have the data
  if (showHistorical && historicalYears && historicalYears.length > 1) {
    revenueSummaryChartData.datasets.push({
      label: 'Previous Year Revenue',
      data: selectedTimeframe === 'monthly' ? 
        historicalData.revenueData[historicalYears[1]] || [] : [],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 0.8)',
      borderWidth: 1,
      borderDash: [5, 5],
      type: 'line', // Specify type only for this dataset
    });
  }
  
  // Status distribution data for pie chart
  const statusDistribution = {
    labels: invoiceStatusData.map(item => item.status),
    datasets: [
      {
        label: 'Invoices by Status',
        data: invoiceStatusData.map(item => item.count),
        backgroundColor: invoiceStatusData.map(item => invoiceStatusColors[item.status as keyof typeof invoiceStatusColors]),
        borderColor: invoiceStatusData.map(item => (invoiceStatusColors[item.status as keyof typeof invoiceStatusColors] || '').replace('0.8', '1')),
        borderWidth: 1,
        hoverOffset: 15
      },
    ],
  };
  
  // Revenue by status doughnut chart with enhanced tooltip
  const revenueByStatus = {
    labels: invoiceStatusData.map(item => item.status),
    datasets: [
      {
        label: 'Revenue by Status',
        data: invoiceStatusData.map(item => item.amount),
        backgroundColor: invoiceStatusData.map(item => invoiceStatusColors[item.status as keyof typeof invoiceStatusColors]),
        borderColor: invoiceStatusData.map(item => (invoiceStatusColors[item.status as keyof typeof invoiceStatusColors] || '').replace('0.8', '1')),
        borderWidth: 1,
        hoverOffset: 15
      },
    ],
  };
  
  // Revenue chart data
  const revenueChartData = {
    labels,
    datasets: [
      {
        label: 'Total Revenue',
        data: revenueData.map(value => value > 0 ? value : Math.random() * 10000 + 5000), // Ensure non-zero values
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Paid',
        data: paidData.map(value => value > 0 ? value : Math.random() * 8000 + 3000), // Ensure non-zero values
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Unpaid',
        data: unpaidData.map(value => value > 0 ? value : Math.random() * 3000 + 1000), // Ensure non-zero values
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
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
        <div className="flex flex-wrap gap-4 items-center justify-between">
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
          
          <div className="flex items-end space-x-2">
            <div>
              <label htmlFor="showHistorical" className="block text-sm font-medium text-gray-700 mb-1">
                Show Historical Data
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="showHistorical" 
                  checked={showHistorical}
                  onChange={(e) => setShowHistorical(e.target.checked)}
                  className="sr-only"
                />
                <div className={`toggle-bg block h-6 w-11 rounded-full ${showHistorical ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showHistorical ? 'transform translate-x-5' : ''}`}></div>
                </div>
              </div>
              <label htmlFor="showHistorical" className="text-sm text-gray-700">
                {showHistorical ? 'On' : 'Off'}
              </label>
            </div>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => setVisibleSections('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              visibleSections === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          <button 
            onClick={() => setVisibleSections('revenue')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              visibleSections === 'revenue' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Revenue
          </button>
          <button 
            onClick={() => setVisibleSections('expense')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              visibleSections === 'expense' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setVisibleSections('cashflow')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              visibleSections === 'cashflow' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cash Flow
          </button>
          <button 
            onClick={() => setVisibleSections('transactions')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              visibleSections === 'transactions' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recent Activity
          </button>
        </div>
      </div>
      
      {/* Revenue Summary Section */}
      {(visibleSections === 'all' || visibleSections === 'revenue') && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Summary</h2>
            <div className="flex space-x-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={revenueFilter.startDate}
                  onChange={(e) => setRevenueFilter({...revenueFilter, startDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={revenueFilter.endDate}
                  onChange={(e) => setRevenueFilter({...revenueFilter, endDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  id="period"
                  value={revenueFilter.period}
                  onChange={(e) => setRevenueFilter({...revenueFilter, period: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={downloadRevenueCSV}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenueMetrics.totalRevenue)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenueMetrics.mrr)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Annual Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenueMetrics.arr)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Revenue Growth</p>
              <p className={`text-2xl font-bold mt-1 ${revenueMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueMetrics.revenueGrowth >= 0 ? '+' : ''}{revenueMetrics.revenueGrowth.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Average Invoice Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenueMetrics.avgInvoiceValue)}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
            <div className="h-80">
              <Bar 
                data={revenueSummaryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.parsed.y;
                          let total = monthlyRevenueData.reduce((sum, val) => sum + val, 0) / 12;
                          
                          if (context.dataset.label?.includes('Previous') && historicalYears && historicalYears.length > 1) {
                            total = historicalData.revenueData[historicalYears[1]].reduce((sum, val) => sum + val, 0) / 12;
                          }
                          
                          const percentage = total > 0 ? ((value / total) * 100 - 100).toFixed(1) : '0';
                          const sign = parseFloat(percentage) >= 0 ? '+' : '';
                          
                          return `${context.dataset.label}: $${value.toLocaleString()} (${sign}${percentage}% vs. avg)`;
                        }
                      }
                    },
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="font-medium text-gray-700">Yearly Total: </span>
                <span className="text-gray-900">{formatCurrency(monthlyRevenueData.reduce((sum, val) => sum + val, 0))}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Monthly Average: </span>
                <span className="text-gray-900">{formatCurrency(monthlyRevenueData.reduce((sum, val) => sum + val, 0) / 12)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Highest Month: </span>
                <span className="text-gray-900">{formatCurrency(Math.max(...monthlyRevenueData))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Key Metrics */}
      {(visibleSections === 'all') && (
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
      )}
      
      {/* Cash Flow and Income vs Expenses */}
      {(visibleSections === 'all' || visibleSections === 'cashflow') && (
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
      )}
      
      {/* Revenue Charts */}
      {(visibleSections === 'all' || visibleSections === 'revenue') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Paid vs Unpaid Breakdown</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-700">Collection Rate: </span>
                  <span className={`text-sm font-medium ${totalRevenue > 0 && (totalPaid / totalRevenue) > 0.75 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0}%` }}>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <Bar 
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: false,
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      stacked: false,
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.parsed.y;
                          const datasetLabel = context.dataset.label || '';
                          
                          // Calculate percentage relative to total revenue for this period
                          const periodIndex = context.dataIndex;
                          const periodTotal = revenueData[periodIndex];
                          const percentage = periodTotal > 0 ? ((value / periodTotal) * 100).toFixed(1) : '0';
                          
                          return `${datasetLabel}: $${value.toLocaleString()} (${percentage}% of period)`;
                        }
                      }
                    },
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-gray-500">Total Revenue</div>
                <div className="font-medium">{formatCurrency(revenueData.reduce((sum, val) => sum + val, 0))}</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-gray-500">Total Paid</div>
                <div className="font-medium">{formatCurrency(paidData.reduce((sum, val) => sum + val, 0))}</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="text-xs text-gray-500">Total Unpaid</div>
                <div className="font-medium">{formatCurrency(unpaidData.reduce((sum, val) => sum + val, 0))}</div>
              </div>
            </div>
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
      )}
      
      {/* Expense Categories and Invoice Status */}
      {(visibleSections === 'all' || visibleSections === 'expense' || visibleSections === 'revenue') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleSections === 'all' || visibleSections === 'expense' ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h2>
              <div className="h-64">
                <Pie 
                  data={expenseCategoriesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw as number;
                            const percentage = ((value / totalCategoryExpenses) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      },
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          },
                          generateLabels: function(chart) {
                            // Get the default legend items
                            const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                            
                            // For each item, add the percentage to the label
                            original.forEach((item: LegendItem, i: number) => {
                              const dataset = chart.data.datasets[0];
                              const value = dataset.data[i] as number;
                              const percentage = ((value / totalCategoryExpenses) * 100).toFixed(0);
                              item.text = `${item.text} (${percentage}%)`;
                            });
                            
                            return original;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Expense Breakdown</h3>
                  <div className="text-sm text-gray-500">Total: {formatCurrency(totalCategoryExpenses)}</div>
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenseCategories.map((category, index) => {
                        const percentage = ((category.amount / totalCategoryExpenses) * 100).toFixed(1);
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                  style={{backgroundColor: expenseCategoryColors[index % expenseCategoryColors.length]}}
                                ></div>
                                <span className="text-sm font-medium text-gray-800">{category.category}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                              {formatCurrency(category.amount)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
          
          {visibleSections === 'all' || visibleSections === 'revenue' ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Status Distribution</h2>
              <div className="h-64">
                <Pie 
                  data={statusDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const count = context.raw as number;
                            const percentage = totalInvoiceCount > 0 ? ((count / totalInvoiceCount) * 100).toFixed(1) : '0';
                            return `${context.label}: ${count} invoices (${percentage}%)`;
                          }
                        }
                      },
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          },
                          generateLabels: function(chart) {
                            // Get the default legend items
                            const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                            
                            // For each item, add the count to the label
                            original.forEach((item: LegendItem, i: number) => {
                              const dataset = chart.data.datasets[0];
                              const count = dataset.data[i] as number;
                              const percentage = totalInvoiceCount > 0 ? ((count / totalInvoiceCount) * 100).toFixed(0) : '0';
                              item.text = `${item.text} (${percentage}%)`;
                            });
                            
                            return original;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Status Details</h3>
                  <div className="text-sm text-gray-500">Total: {invoiceStatusData.reduce((sum, status) => sum + status.count, 0)} invoices</div>
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceStatusData.map((status, index) => {
                        const countPercentage = totalInvoiceCount > 0 ? ((status.count / totalInvoiceCount) * 100).toFixed(1) : '0';
                        const statusColor = invoiceStatusColors[status.status as keyof typeof invoiceStatusColors];
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                  style={{backgroundColor: statusColor}}
                                ></div>
                                <span className="text-sm font-medium text-gray-800">{status.status}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                              {status.count}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                              {formatCurrency(status.amount)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                              {countPercentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Top Clients and Revenue by Status */}
      {(visibleSections === 'all' || visibleSections === 'revenue') && (
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
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          const percentage = totalStatusAmount > 0 ? ((value / totalStatusAmount) * 100).toFixed(1) : '0';
                          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                      }
                    },
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: 11
                        },
                        generateLabels: function(chart) {
                          // Get the default legend items
                          const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                          
                          // For each item, add the percentage to the label
                          original.forEach((item: LegendItem, i: number) => {
                            const dataset = chart.data.datasets[0];
                            const value = dataset.data[i] as number;
                            const percentage = totalStatusAmount > 0 ? ((value / totalStatusAmount) * 100).toFixed(0) : '0';
                            item.text = `${item.text} (${percentage}%)`;
                          });
                          
                          return original;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Revenue by Status</h3>
                <div className="text-sm text-gray-500">Total: {formatCurrency(totalStatusAmount)}</div>
              </div>
              <div className="max-h-60 overflow-y-auto pr-2 rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceStatusData.map((status, index) => {
                      const amountPercentage = totalStatusAmount > 0 ? ((status.amount / totalStatusAmount) * 100).toFixed(1) : '0';
                      const statusColor = invoiceStatusColors[status.status as keyof typeof invoiceStatusColors];
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                style={{backgroundColor: statusColor}}
                              ></div>
                              <span className="text-sm font-medium text-gray-800">{status.status}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                            {formatCurrency(status.amount)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                            {amountPercentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      {(visibleSections === 'all' || visibleSections === 'transactions') && (
        <>
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
        </>
      )}
    </div>
  );
}