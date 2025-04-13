import { formatCurrency } from '@/utils/dateUtils';

export interface Client {
  name: string;
  email: string;
  address?: string;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  lastInvoiceDate: string;
}

interface ClientListProps {
  clients: Client[];
  sortBy: string;
  sortOrder: string;
  handleSort: (column: string) => void;
  onViewInvoices: (clientName: string) => void;
}

export default function ClientList({
  clients,
  sortBy,
  sortOrder,
  handleSort,
  onViewInvoices
}: ClientListProps) {
  
  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Client Name {renderSortIndicator('name')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalBilled')}
              >
                Total Billed {renderSortIndicator('totalBilled')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalOutstanding')}
              >
                Outstanding {renderSortIndicator('totalOutstanding')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('invoiceCount')}
              >
                Invoices {renderSortIndicator('invoiceCount')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastInvoiceDate')}
              >
                Last Invoice {renderSortIndicator('lastInvoiceDate')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.length > 0 ? (
              clients.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(client.totalBilled)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${client.totalOutstanding > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {formatCurrency(client.totalOutstanding)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.invoiceCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.lastInvoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewInvoices(client.name)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Invoices
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 