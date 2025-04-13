'use client';

import { useState, useEffect } from 'react';
import useInvoiceStore from '@/utils/invoiceStore';
import { useSettings } from '@/context/SettingsContext';
import InvoiceSummary from '@/components/InvoiceSummary';
import InvoiceSearch from '@/components/InvoiceSearch';
import InvoiceList from '@/components/InvoiceList';

export default function Invoices() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">Manage and track your client invoices</p>
      </div>

      {/* Summary Cards */}
      <InvoiceSummary 
        totalUnpaid={totalUnpaid}
        totalPaid={totalPaid}
        totalPartiallyPaid={totalPartiallyPaid}
      />

      {/* Filters and Actions */}
      <InvoiceSearch 
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        setCurrentPage={setCurrentPage}
      />

      {/* Invoices Table */}
      <InvoiceList 
        currentItems={currentItems}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
      />
    </div>
  );
} 