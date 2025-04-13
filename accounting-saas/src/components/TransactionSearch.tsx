import { ChangeEvent } from 'react';
import Link from 'next/link';

interface TransactionSearchProps {
  search: string;
  setSearch: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortBy: string;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  setSortBy: (value: string) => void;
  setCurrentPage: (value: number) => void;
}

export default function TransactionSearch({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  setCurrentPage
}: TransactionSearchProps) {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleTypeFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleCategoryFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select 
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="all">All Types</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
          
          <select 
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="all">All Categories</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          
          <select 
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
          
          <select 
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (Highest)</option>
            <option value="amount-asc">Amount (Lowest)</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Link 
          href="/dashboard/transactions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Transaction
        </Link>
      </div>
    </div>
  );
} 