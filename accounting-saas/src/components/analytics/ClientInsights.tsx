import { LatePaymentClient, ChurnRiskClient, ValuableClient } from '@/hooks/useClientAnalytics';

interface ClientInsightsProps {
  latePaymentClients: LatePaymentClient[];
  churnRiskClients: ChurnRiskClient[];
  valuableClients: ValuableClient[];
  formatCurrency: (amount: number) => string;
}

export default function ClientInsights({
  latePaymentClients,
  churnRiskClients,
  valuableClients,
  formatCurrency
}: ClientInsightsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
        Client Behavior Insights
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Valuable Clients */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <h3 className="text-md font-medium text-indigo-700 dark:text-indigo-300 mb-3">Most Valuable Clients</h3>
          
          {valuableClients.length > 0 ? (
            <div className="space-y-3">
              {valuableClients.map((client, index) => (
                <div key={client.name} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' :
                    index === 2 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(client.totalSpent)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Not enough client data available.</p>
          )}
        </div>
        
        {/* Clients with Late Payments */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h3 className="text-md font-medium text-amber-700 dark:text-amber-300 mb-3">Late Payment Patterns</h3>
          
          {latePaymentClients.length > 0 ? (
            <div className="space-y-3">
              {latePaymentClients.slice(0, 3).map((client) => (
                <div key={client.name} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.name}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      client.lateRate > 50 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {client.lateRate.toFixed(0)}% late
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {client.latePayments} of {client.invoiceCount} invoices paid late
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Avg. payment time: {Math.round(client.avgPaymentTime)} days
                  </p>
                </div>
              ))}
              
              {latePaymentClients.length > 3 && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{latePaymentClients.length - 3} more clients with late payments
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  No clients with significant late payment patterns
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Churn Risk Clients */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-md font-medium text-red-700 dark:text-red-300 mb-3">Churn Risk Signals</h3>
          
          {churnRiskClients.length > 0 ? (
            <div className="space-y-3">
              {churnRiskClients.slice(0, 3).map((client) => (
                <div key={client.name} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.name}</p>
                    <div className="flex items-center">
                      {client.riskScore > 70 ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                      ) : client.riskScore > 40 ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
                      )}
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Risk: {client.riskScore}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {client.hasUnpaidInvoices && (
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Has unpaid or overdue invoices
                      </p>
                    )}
                    {client.hasConsecutiveLatePayments && (
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        Multiple consecutive late payments
                      </p>
                    )}
                    {client.hasSlowPayments && (
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Slow payment history
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {churnRiskClients.length > 3 && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{churnRiskClients.length - 3} more clients at risk
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  No clients currently showing churn risk signals
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 