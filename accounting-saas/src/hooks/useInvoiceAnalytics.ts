import { useMemo } from 'react';
import { Invoice } from '@/utils/invoiceStore';

export interface ClientData {
  name: string;
  count: number;
  value: number;
}

export interface StatusCounts {
  'Paid': number;
  'Unpaid': number;
  'Partially Paid': number;
  'Overdue': number;
  'Cancelled': number;
}

export interface RevenueMonth {
  month: string;
  total: number;
  date: Date;
}

export interface RevenueChange {
  month: string;
  prevMonth: string;
  percentChange: number;
  revenue: number;
  prevRevenue: number;
  isSignificant: boolean;
}

export interface InvoiceAnalytics {
  totalRevenue: number;
  avgInvoiceValue: number;
  paidCount: number;
  unpaidCount: number;
  paymentRate: number;
  statusCounts: StatusCounts;
  topClientsByCount: ClientData[];
  topClientsByValue: ClientData[];
  avgTimeToPayment: number;
  monthlyAvgData: {
    labels: string[];
    values: number[];
  };
  topMonths: RevenueMonth[];
  revenueChanges: RevenueChange[];
  biggestRevenueSwing: RevenueChange | null;
}

export function useInvoiceAnalytics(invoices: Invoice[], timeRange: 'all' | '6m' | '1y'): InvoiceAnalytics {
  // Memoize filtered invoices based on time range
  const filteredInvoices = useMemo(() => {
    // Calculate date ranges
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    if (timeRange === 'all') return invoices;
    
    const cutoffDate = timeRange === '6m' ? sixMonthsAgo : oneYearAgo;
    return invoices.filter(inv => new Date(inv.issueDate) >= cutoffDate);
  }, [invoices, timeRange]);

  return useMemo(() => {
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
      .map(([name, data]) => ({ name, count: data.count, value: data.value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get top 5 clients by value
    const topClientsByValue = Object.entries(clientData)
      .map(([name, data]) => ({ name, count: data.count, value: data.value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    // Invoice status distribution
    const statusCounts: StatusCounts = {
      'Paid': filteredInvoices.filter(inv => inv.status === 'Paid').length,
      'Unpaid': filteredInvoices.filter(inv => inv.status === 'Unpaid').length,
      'Partially Paid': filteredInvoices.filter(inv => inv.status === 'Partially Paid').length,
      'Overdue': filteredInvoices.filter(inv => inv.status === 'Overdue').length,
      'Cancelled': filteredInvoices.filter(inv => inv.status === 'Cancelled').length,
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
    
    const monthlyAvgData = {
      labels: recentMonths.map(item => {
        const [year, month] = item.month.split('-');
        return `${month}/${year.substring(2)}`;
      }),
      values: recentMonths.map(item => item.avg)
    };
    
    // Find top performing months
    const monthlyRevenue: Record<string, { total: number, month: string, date: Date }> = {};
    
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = { 
          total: 0, 
          month: monthName,
          date: new Date(date.getFullYear(), date.getMonth(), 1)
        };
      }
      
      monthlyRevenue[monthYear].total += inv.total;
    });
    
    // Convert to array and sort by revenue
    const topMonths = Object.values(monthlyRevenue)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3); // Top 3 months
    
    // Calculate month-over-month changes to detect spikes
    const monthData: Record<string, { revenue: number, month: string, date: Date }> = {};
    
    // Sort invoices by date
    const sortedInvoices = [...filteredInvoices].sort((a, b) => 
      new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    );
    
    sortedInvoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      if (!monthData[monthYear]) {
        monthData[monthYear] = { 
          revenue: 0, 
          month: monthName,
          date: new Date(date.getFullYear(), date.getMonth(), 1)
        };
      }
      
      monthData[monthYear].revenue += inv.total;
    });
    
    // Convert to array and sort by date
    const monthsArray = Object.values(monthData)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate month-over-month changes
    const revenueChanges: RevenueChange[] = [];
    for (let i = 1; i < monthsArray.length; i++) {
      const prevMonth = monthsArray[i - 1];
      const currMonth = monthsArray[i];
      
      if (prevMonth.revenue > 0) {
        const percentChange = ((currMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
        revenueChanges.push({
          month: currMonth.month,
          prevMonth: prevMonth.month,
          percentChange,
          revenue: currMonth.revenue,
          prevRevenue: prevMonth.revenue,
          isSignificant: Math.abs(percentChange) > 20 // Flag if change is >20%
        });
      }
    }
    
    const sortedChanges = revenueChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
    
    // Get biggest revenue swing (positive or negative)
    const biggestRevenueSwing = sortedChanges.length > 0 ? sortedChanges[0] : null;

    return {
      totalRevenue,
      avgInvoiceValue,
      paidCount,
      unpaidCount,
      paymentRate,
      statusCounts,
      topClientsByCount,
      topClientsByValue,
      avgTimeToPayment,
      monthlyAvgData,
      topMonths,
      revenueChanges: sortedChanges,
      biggestRevenueSwing
    };
  }, [filteredInvoices]);
} 