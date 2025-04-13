import { useSettings } from '@/context/SettingsContext';

interface InvoiceSummaryProps {
  totalUnpaid: number;
  totalPaid: number;
  totalPartiallyPaid: number;
}

export default function InvoiceSummary({ 
  totalUnpaid, 
  totalPaid, 
  totalPartiallyPaid 
}: InvoiceSummaryProps) {
  const { formatCurrency } = useSettings();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500">Unpaid Invoices</h2>
        <p className="text-xl font-bold text-yellow-600 mt-1">{formatCurrency(totalUnpaid)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500">Paid Invoices</h2>
        <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500">Partially Paid</h2>
        <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalPartiallyPaid)}</p>
      </div>
    </div>
  );
} 