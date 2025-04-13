'use client';

import { useState, useEffect } from 'react';
import useTransactionStore from '@/utils/transactionStore';
import TransactionSummary from '@/components/TransactionSummary';
import TransactionSearch from '@/components/TransactionSearch';
import TransactionList, { Transaction } from '@/components/TransactionList';

export default function Transactions() {
  const transactions = useTransactionStore(state => state.transactions);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of transactions per page
  
  // Reset to page 1 when the component mounts
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = search === '' || 
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

  // Calculate pagination values
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Calculate totals based on filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">Manage and track your financial transactions</p>
      </div>

      {/* Summary Cards */}
      <TransactionSummary 
        totalIncome={totalIncome} 
        totalExpenses={totalExpenses} 
      />

      {/* Filters and Actions */}
      <TransactionSearch 
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        setCurrentPage={setCurrentPage}
      />

      {/* Transactions Table */}
      <TransactionList 
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