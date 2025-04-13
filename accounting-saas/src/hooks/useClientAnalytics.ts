import { useMemo } from 'react';
import { Invoice } from '@/utils/invoiceStore';

export interface ClientBehavior {
  totalSpent: number;
  invoiceCount: number;
  latePayments: number;
  avgPaymentTime: number;
  lastInvoiceDate: Date | null;
  consecutiveLatePayments: number;
  isActive: boolean;
}

export interface LatePaymentClient {
  name: string;
  latePayments: number;
  invoiceCount: number;
  lateRate: number;
  avgPaymentTime: number;
  consecutiveLatePayments: number;
  isActive: boolean;
}

export interface ChurnRiskClient {
  name: string;
  isActive: boolean;
  riskScore: number;
  hasConsecutiveLatePayments: boolean;
  hasSlowPayments: boolean;
  hasUnpaidInvoices: boolean;
  totalSpent: number;
}

export interface ValuableClient {
  name: string;
  totalSpent: number;
  avgInvoiceValue: number;
  invoiceCount: number;
  isActive: boolean;
  valueScore: number;
}

export interface ClientAnalytics {
  clientBehavior: Record<string, ClientBehavior>;
  latePaymentClients: LatePaymentClient[];
  churnRiskClients: ChurnRiskClient[];
  valuableClients: ValuableClient[];
}

export function useClientAnalytics(invoices: Invoice[]): ClientAnalytics {
  return useMemo(() => {
    // Analyze client payment behavior
    const clientBehavior: Record<string, ClientBehavior> = {};
    
    // Process all invoices to build client profiles
    invoices.forEach(inv => {
      if (!clientBehavior[inv.clientName]) {
        clientBehavior[inv.clientName] = {
          totalSpent: 0,
          invoiceCount: 0,
          latePayments: 0,
          avgPaymentTime: 0,
          lastInvoiceDate: null,
          consecutiveLatePayments: 0,
          isActive: false
        };
      }
      
      const client = clientBehavior[inv.clientName];
      client.totalSpent += inv.total;
      client.invoiceCount += 1;
      
      // Track if invoice was paid late
      if (inv.status === 'Paid' && inv.paymentDate) {
        const dueDate = new Date(inv.dueDate);
        const paymentDate = new Date(inv.paymentDate);
        const isLate = paymentDate > dueDate;
        
        if (isLate) {
          client.latePayments += 1;
          client.consecutiveLatePayments += 1;
        } else {
          client.consecutiveLatePayments = 0;
        }
        
        // Calculate days to payment
        const issueDate = new Date(inv.issueDate);
        const daysToPayment = Math.round((paymentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Update average payment time
        client.avgPaymentTime = client.avgPaymentTime === 0 
          ? daysToPayment 
          : (client.avgPaymentTime + daysToPayment) / 2;
      }
      
      // Update last invoice date
      const invoiceDate = new Date(inv.issueDate);
      if (!client.lastInvoiceDate || invoiceDate > client.lastInvoiceDate) {
        client.lastInvoiceDate = invoiceDate;
      }
      
      // Check if client is active (had invoice in last 90 days)
      const now = new Date();
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      client.isActive = client.lastInvoiceDate ? client.lastInvoiceDate >= ninetyDaysAgo : false;
    });

    // Find clients with late payment patterns
    const latePaymentClients = Object.entries(clientBehavior)
      .filter(([_, data]) => data.latePayments > 0)
      .sort((a, b) => b[1].latePayments - a[1].latePayments)
      .map(([name, data]) => ({
        name,
        latePayments: data.latePayments,
        invoiceCount: data.invoiceCount,
        lateRate: (data.latePayments / data.invoiceCount) * 100,
        avgPaymentTime: data.avgPaymentTime,
        consecutiveLatePayments: data.consecutiveLatePayments,
        isActive: data.isActive
      }))
      .slice(0, 5); // Top 5 late payers
    
    // Identify at-risk clients (churn risk)
    // Criteria for churn risk:
    // 1. Active client (had invoice in last 90 days)
    // 2. Has multiple consecutive late payments OR
    // 3. Payment time significantly above average OR
    // 4. Has unpaid/overdue invoices
    
    const overallAvgPaymentTime = Object.values(clientBehavior)
      .reduce((sum, client) => sum + client.avgPaymentTime, 0) / 
      Object.values(clientBehavior).length;
    
    // Find clients with unpaid/overdue invoices
    const clientsWithUnpaidInvoices = new Set<string>();
    invoices
      .filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')
      .forEach(inv => clientsWithUnpaidInvoices.add(inv.clientName));
    
    const churnRiskClients = Object.entries(clientBehavior)
      .map(([name, data]) => {
        // Calculate risk factors
        const hasConsecutiveLatePayments = data.consecutiveLatePayments >= 2;
        const hasSlowPayments = data.avgPaymentTime > overallAvgPaymentTime * 1.5;
        const hasUnpaidInvoices = clientsWithUnpaidInvoices.has(name);
        
        // Calculate risk score (0-100)
        let riskScore = 0;
        if (hasConsecutiveLatePayments) riskScore += 30;
        if (hasSlowPayments) riskScore += 20;
        if (hasUnpaidInvoices) riskScore += 50;
        
        return {
          name,
          isActive: data.isActive,
          riskScore,
          hasConsecutiveLatePayments,
          hasSlowPayments,
          hasUnpaidInvoices,
          totalSpent: data.totalSpent
        };
      })
      .filter(client => client.isActive && client.riskScore > 20)
      .sort((a, b) => b.riskScore - a.riskScore);
    
    // Get most valuable clients (based on average invoice value and frequency)
    const valuableClients = Object.entries(clientBehavior)
      .map(([name, data]) => {
        // Calculate a client value score based on:
        // - Total spent
        // - Average invoice value
        // - Recency of last invoice
        // - Payment reliability
        
        const avgInvoiceValue = data.totalSpent / data.invoiceCount;
        const recencyValue = data.isActive ? 100 : 50; // Higher score for active clients
        const reliabilityValue = 100 - ((data.latePayments / Math.max(1, data.invoiceCount)) * 100);
        
        // Weighted score calculation
        const valueScore = 
          (data.totalSpent * 0.4) + 
          (avgInvoiceValue * 0.3) + 
          (recencyValue * 0.15) + 
          (reliabilityValue * 0.15);
        
        return {
          name,
          totalSpent: data.totalSpent,
          avgInvoiceValue,
          invoiceCount: data.invoiceCount,
          isActive: data.isActive,
          valueScore
        };
      })
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 5); // Top 5 valuable clients
      
    return {
      clientBehavior,
      latePaymentClients,
      churnRiskClients,
      valuableClients
    };
  }, [invoices]);
} 