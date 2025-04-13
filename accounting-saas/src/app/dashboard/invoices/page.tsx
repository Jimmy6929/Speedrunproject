'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/utils/dateUtils';
import useInvoiceStore from '@/utils/invoiceStore';

export default function Invoices() {
  const router = useRouter();
  const invoices = useInvoiceStore(state => state.invoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of invoices per page
  
  // Reset to page 1 when the component mounts
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = search === '' || 
        invoice.clientName.toLowerCase().includes(search.toLowerCase()) ||
        invoice.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'issueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
          : new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      } else if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'total') {
        return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
      } else if (sortBy === 'client') {
        return sortOrder === 'asc'
          ? a.clientName.localeCompare(b.clientName)
          : b.clientName.localeCompare(a.clientName);
      }
      return 0;
    });

  // Calculate pagination values
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Calculate summary statistics
  const totalUnpaid = filteredInvoices
    .filter(invoice => invoice.status === 'Unpaid' || invoice.status === 'Overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);
    
  const totalPaid = filteredInvoices
    .filter(invoice => invoice.status === 'Paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const totalPartiallyPaid = filteredInvoices
    .filter(invoice => invoice.status === 'Partially Paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);

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

  // Helper function to get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800';
      case 'Unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">Manage and track your client invoices</p>
      </div>

      {/* Summary Cards */}
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

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <select 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <select 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setCurrentPage(1); // Reset to first page on sort
              }}
            >
              <option value="issueDate-desc">Issue Date (Newest)</option>
              <option value="issueDate-asc">Issue Date (Oldest)</option>
              <option value="dueDate-desc">Due Date (Newest)</option>
              <option value="dueDate-asc">Due Date (Oldest)</option>
              <option value="total-desc">Amount (Highest)</option>
              <option value="total-asc">Amount (Lowest)</option>
              <option value="client-asc">Client (A-Z)</option>
              <option value="client-desc">Client (Z-A)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Link 
            href="/dashboard/invoices/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Invoice
          </Link>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link 
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="hover:text-blue-600"
                      >
                        {invoice.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <Link 
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <Link 
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="font-medium">{totalItems}</span> invoices
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
    </div>
  );
} 