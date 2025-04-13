interface KpiCardsProps {
  totalRevenue: number;
  avgInvoiceValue: number;
  paymentRate: number;
  avgTimeToPayment: number;
  totalInvoices: number;
  paidInvoices: number;
  formatCurrency: (amount: number) => string;
}

export default function KpiCards({
  totalRevenue,
  avgInvoiceValue,
  paymentRate,
  avgTimeToPayment,
  totalInvoices,
  paidInvoices,
  formatCurrency
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{totalInvoices} invoices</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Invoice</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(avgInvoiceValue)}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Per invoice average</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{paymentRate.toFixed(1)}%</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{paidInvoices} of {totalInvoices} invoices paid</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Payment</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{Math.round(avgTimeToPayment)} days</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">From issue to payment</p>
      </div>
    </div>
  );
} 