import { formatCurrency } from '@/utils/dateUtils';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpenses: number;
}

export default function TransactionSummary({ totalIncome, totalExpenses }: TransactionSummaryProps) {
  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500">Total Income</h2>
        <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500">Total Expenses</h2>
        <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalExpenses)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500">Net Amount</h2>
        <p className={`text-xl font-bold mt-1 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(Math.abs(netAmount))}
          <span className="text-sm font-normal ml-1">{netAmount >= 0 ? 'Profit' : 'Loss'}</span>
        </p>
      </div>
    </div>
  );
} 