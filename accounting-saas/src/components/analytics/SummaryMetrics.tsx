import { formatCurrency } from '@/utils/dateUtils';

interface SummaryMetricsProps {
  totalRevenue: number;
  avgInvoiceValue: number;
  paymentRate: number;
  avgTimeToPayment: number;
}

export default function SummaryMetrics({
  totalRevenue,
  avgInvoiceValue,
  paymentRate,
  avgTimeToPayment
}: SummaryMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-2">{formatCurrency(totalRevenue)}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Invoice Value</h3>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-2">{formatCurrency(avgInvoiceValue)}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Rate</h3>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-2">{paymentRate.toFixed(1)}%</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Payment</h3>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-2">{avgTimeToPayment.toFixed(1)} days</p>
      </div>
    </div>
  );
} 