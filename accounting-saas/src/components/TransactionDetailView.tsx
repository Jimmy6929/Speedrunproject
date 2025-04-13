import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/dateUtils';
import { Transaction } from '@/components/TransactionList';

interface TransactionDetailViewProps {
  transaction: Transaction;
  onDelete: () => void;
  isDeleting: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
}

export default function TransactionDetailView({
  transaction,
  onDelete,
  isDeleting,
  showDeleteConfirm,
  setShowDeleteConfirm
}: TransactionDetailViewProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete transaction <span className="font-semibold">{transaction.id}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Transaction'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-500 mt-1">Viewing transaction {transaction.id}</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/dashboard/transactions/${transaction.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </Link>
          <button 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            onClick={() => router.push('/dashboard/transactions')}
          >
            Back
          </button>
        </div>
      </div>

      {/* Transaction Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm text-gray-500 font-medium">Transaction ID</h2>
            <p className="text-lg font-semibold">{transaction.id}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500 font-medium">Date</h2>
            <p className="text-lg font-semibold">{formatDate(transaction.date)}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500 font-medium">Status</h2>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              transaction.status === 'Completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {transaction.status}
            </span>
          </div>
          <div>
            <h2 className="text-sm text-gray-500 font-medium">Amount</h2>
            <p className={`text-lg font-semibold ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'Credit' ? '+' : '-'}{formatCurrency(transaction.amount).slice(1)}
            </p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500 font-medium">Category</h2>
            <p className="text-lg font-semibold">{transaction.category}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500 font-medium">Account</h2>
            <p className="text-lg font-semibold">{transaction.account}</p>
          </div>
        </div>
      </div>

      {/* Transaction Details Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Description</h3>
            <p className="mt-1">{transaction.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Reference</h3>
            <p className="mt-1">{transaction.reference || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Notes</h3>
            <p className="mt-1">{transaction.notes || 'No notes provided'}</p>
          </div>
        </div>
      </div>

      {/* Transaction History Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-xs text-gray-500">
                {transaction.createdAt ? formatDateTime(transaction.createdAt) : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-xs text-gray-500">
                {transaction.updatedAt ? formatDateTime(transaction.updatedAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Export PDF
          </button>
          <button 
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  );
} 