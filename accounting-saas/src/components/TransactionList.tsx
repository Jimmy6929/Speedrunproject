import Link from 'next/link';
import { formatDate, formatCurrency } from '@/utils/dateUtils';

// Define the Transaction type to match the store
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  account: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TransactionListProps {
  currentItems: Transaction[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (pageNumber: number) => void;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  totalItems: number;
}

export default function TransactionList({
  currentItems,
  currentPage,
  totalPages,
  handlePageChange,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems
}: TransactionListProps) {
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page, last page, and pages around current page
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link 
                      href={`/dashboard/transactions/${transaction.id}`}
                      className="hover:text-blue-600"
                    >
                      {transaction.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.account}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'Credit' ? '+' : '-'}{formatCurrency(transaction.amount).slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <Link 
                      href={`/dashboard/transactions/${transaction.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/dashboard/transactions/${transaction.id}`}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="font-medium">{totalItems}</span> transactions
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              Previous
            </button>
            
            {getPageNumbers().map(number => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-3 py-1 rounded text-sm ${currentPage === number ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50 text-gray-700'}`}
              >
                {number}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 