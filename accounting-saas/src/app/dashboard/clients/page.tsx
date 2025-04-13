'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/dateUtils';
import useInvoiceStore from '@/utils/invoiceStore';

type Client = {
  name: string;
  email: string;
  address?: string;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  lastInvoiceDate: string;
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const invoices = useInvoiceStore(state => state.invoices);
  
  // Process invoices to get client information
  useEffect(() => {
    const clientMap = new Map<string, Client>();
    
    invoices.forEach(invoice => {
      const { clientName, clientEmail, clientAddress, total, status, issueDate } = invoice;
      
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          name: clientName,
          email: clientEmail,
          address: clientAddress,
          totalBilled: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          invoiceCount: 0,
          lastInvoiceDate: issueDate
        });
      }
      
      const client = clientMap.get(clientName)!;
      
      // Update client data
      client.totalBilled += total;
      client.invoiceCount += 1;
      
      // Update payment status
      if (status === 'Paid') {
        client.totalPaid += total;
      } else {
        client.totalOutstanding += total;
      }
      
      // Update last invoice date if this one is newer
      if (new Date(issueDate) > new Date(client.lastInvoiceDate)) {
        client.lastInvoiceDate = issueDate;
      }
    });
    
    // Convert map to array and sort
    let clientArray = Array.from(clientMap.values());
    setClients(clientArray);
  }, [invoices]);
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    client.email.toLowerCase().includes(search.toLowerCase())
  );
  
  // Sort clients based on current sort settings
  const sortedClients = [...filteredClients].sort((a, b) => {
    let compareA, compareB;
    
    // Determine what to compare based on sortBy
    switch (sortBy) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'totalBilled':
        compareA = a.totalBilled;
        compareB = b.totalBilled;
        break;
      case 'totalPaid':
        compareA = a.totalPaid;
        compareB = b.totalPaid;
        break;
      case 'totalOutstanding':
        compareA = a.totalOutstanding;
        compareB = b.totalOutstanding;
        break;
      case 'invoiceCount':
        compareA = a.invoiceCount;
        compareB = b.invoiceCount;
        break;
      case 'lastInvoiceDate':
        compareA = new Date(a.lastInvoiceDate).getTime();
        compareB = new Date(b.lastInvoiceDate).getTime();
        break;
      default:
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
    }
    
    // Determine sort order
    return sortOrder === 'asc' 
      ? compareA > compareB ? 1 : -1
      : compareA < compareB ? 1 : -1;
  });
  
  // Handle sort changes
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, sort by this column in ascending order
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client relationships</p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Clients table */}
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
              {sortedClients.length > 0 ? (
                sortedClients.map((client, index) => (
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
                        onClick={() => {
                          // Filter invoices by client and open the first one
                          const clientInvoices = invoices.filter(inv => inv.clientName === client.name);
                          if (clientInvoices.length > 0) {
                            window.location.href = `/dashboard/invoices/${clientInvoices[0].id}`;
                          }
                        }}
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
                    {search ? 'No clients found matching your search' : 'No clients found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Clients</h2>
          <p className="text-3xl font-bold text-blue-600">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Billed</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(clients.reduce((sum, client) => sum + client.totalBilled, 0))}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Outstanding</h2>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(clients.reduce((sum, client) => sum + client.totalOutstanding, 0))}
          </p>
        </div>
      </div>
    </div>
  );
} 