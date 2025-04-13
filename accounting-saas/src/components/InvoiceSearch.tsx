import { ChangeEvent } from 'react';
import Link from 'next/link';

interface InvoiceSearchProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortBy: string;
  sortOrder: string;
  setSortBy: (value: string) => void;
  setSortOrder: (value: string) => void;
  setCurrentPage: (value: number) => void;
}

export default function InvoiceSearch({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  setCurrentPage
}: InvoiceSearchProps) {
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page on sort
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={handleStatusFilterChange}
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
            onChange={handleSortChange}
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
          
          <Link 
            href="/dashboard/invoices/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Invoice
          </Link>
        </div>
      </div>
    </div>
  );
} 