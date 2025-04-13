import { formatCurrency } from '@/utils/dateUtils';

interface ClientSummaryProps {
  totalClients: number;
  totalBilled: number;
  totalOutstanding: number;
}

export default function ClientSummary({ 
  totalClients, 
  totalBilled, 
  totalOutstanding 
}: ClientSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Total Clients</h2>
        <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Total Billed</h2>
        <p className="text-3xl font-bold text-blue-600">
          {formatCurrency(totalBilled)}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Outstanding</h2>
        <p className="text-3xl font-bold text-red-600">
          {formatCurrency(totalOutstanding)}
        </p>
      </div>
    </div>
  );
} 