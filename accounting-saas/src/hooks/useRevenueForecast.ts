import { useMemo } from 'react';
import { Invoice } from '@/utils/invoiceStore';
import { Transaction } from '@/utils/transactionStore';

export interface ForecastDataPoint {
  month: string;
  revenue: number;
  date: Date;
  isProjection?: boolean;
}

export interface ForecastData {
  hasForecast: boolean;
  message?: string;
  historicalData: ForecastDataPoint[];
  forecasts: ForecastDataPoint[];
  avgRevenue: number;
  avgExpense: number;
  revenueTrend: number;
  recurringClientsCount: number;
  recurringRevenue: number;
}

interface MonthlyData {
  revenue: number;
  expenses: number;
  month: string;
  date: Date;
  monthNum: number;
  yearNum: number;
}

export function useRevenueForecast(invoices: Invoice[], transactions: Transaction[]): ForecastData {
  return useMemo(() => {
    // Get last 6 months of data for forecasting
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    // Group invoices by month
    const monthlyData: Record<string, MonthlyData> = {};
    
    // Get monthly revenue data
    invoices
      .filter(inv => new Date(inv.issueDate) >= sixMonthsAgo)
      .forEach(inv => {
        const date = new Date(inv.issueDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { 
            revenue: 0, 
            expenses: 0,
            month: monthName,
            date: new Date(date.getFullYear(), date.getMonth(), 1),
            monthNum: date.getMonth(),
            yearNum: date.getFullYear()
          };
        }
        
        monthlyData[monthYear].revenue += inv.total;
      });
    
    // Add expense data if we have transactions
    if (transactions && transactions.length > 0) {
      transactions.forEach(trans => {
        // Check if it's an expense transaction
        if (trans.type && trans.type.toLowerCase() === 'debit') {
          const date = new Date(trans.date);
          if (date >= sixMonthsAgo) {
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('default', { month: 'short' });
            
            if (!monthlyData[monthYear]) {
              monthlyData[monthYear] = { 
                revenue: 0, 
                expenses: 0,
                month: monthName,
                date: new Date(date.getFullYear(), date.getMonth(), 1),
                monthNum: date.getMonth(),
                yearNum: date.getFullYear()
              };
            }
            
            monthlyData[monthYear].expenses += trans.amount;
          }
        }
      });
    }
    
    // Convert to array and sort by date
    const sortedMonths = Object.values(monthlyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Need at least 3 months of data for forecasting
    if (sortedMonths.length < 3) {
      return {
        hasForecast: false,
        message: 'Need at least 3 months of data for forecasting',
        historicalData: sortedMonths.map(m => ({
          month: m.month,
          revenue: m.revenue,
          date: m.date
        })),
        forecasts: [],
        avgRevenue: 0,
        avgExpense: 0,
        revenueTrend: 0,
        recurringClientsCount: 0,
        recurringRevenue: 0
      };
    }
    
    // Simple linear regression to forecast next 3 months
    // y = mx + b where m is the slope and b is the y-intercept
    
    // Calculate averages
    const n = sortedMonths.length;
    const sumX = sortedMonths.reduce((sum, _, i) => sum + i, 0);
    const sumY = sortedMonths.reduce((sum, month) => sum + month.revenue, 0);
    const sumXY = sortedMonths.reduce((sum, month, i) => sum + (i * month.revenue), 0);
    const sumXX = sortedMonths.reduce((sum, _, i) => sum + (i * i), 0);
    
    // Calculate slope (m) and y-intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    
    // Generate forecasts for next 3 months
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const forecasts: ForecastDataPoint[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const forecastX = n + i - 1;
      const forecastRevenue = m * forecastX + b;
      
      // Calculate forecast date
      const forecastDate = new Date(lastMonth.date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      forecasts.push({
        month: forecastDate.toLocaleString('default', { month: 'short' }),
        revenue: Math.max(0, forecastRevenue), // Ensure non-negative
        date: forecastDate,
        isProjection: true
      });
    }
    
    // Calculate average revenue and expense
    const avgRevenue = sumY / n;
    const avgExpense = sortedMonths.reduce((sum, month) => sum + month.expenses, 0) / n;
    
    // Calculate revenue growth trend (as percentage)
    const firstMonthRevenue = sortedMonths[0].revenue;
    const lastMonthRevenue = sortedMonths[n - 1].revenue;
    const revenueTrend = firstMonthRevenue > 0 
      ? ((lastMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100 
      : 0;
    
    // Find recurring clients (appearing in multiple consecutive months)
    const clientAppearances: Record<string, number> = {};
    const recurringClients: string[] = [];
    
    invoices
      .filter(inv => new Date(inv.issueDate) >= sixMonthsAgo)
      .forEach(inv => {
        clientAppearances[inv.clientName] = (clientAppearances[inv.clientName] || 0) + 1;
      });
    
    // Consider clients with 3+ invoices as recurring
    for (const [client, count] of Object.entries(clientAppearances)) {
      if (count >= 3) {
        recurringClients.push(client);
      }
    }
    
    // Estimate recurring revenue (from recurring clients)
    const recurringRevenue = invoices
      .filter(inv => 
        new Date(inv.issueDate) >= sixMonthsAgo && 
        recurringClients.includes(inv.clientName)
      )
      .reduce((sum, inv) => sum + inv.total, 0) / sortedMonths.length;
    
    return {
      hasForecast: true,
      historicalData: sortedMonths.map(m => ({
        month: m.month,
        revenue: m.revenue,
        date: m.date
      })),
      forecasts,
      avgRevenue,
      avgExpense,
      revenueTrend,
      recurringClientsCount: recurringClients.length,
      recurringRevenue
    };
  }, [invoices, transactions]);
} 