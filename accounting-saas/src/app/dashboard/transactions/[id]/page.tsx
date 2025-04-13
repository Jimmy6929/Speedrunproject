'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useTransactionStore from '@/utils/transactionStore';
import TransactionDetailView from '@/components/TransactionDetailView';
import { Transaction } from '@/components/TransactionList';

export default function TransactionDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = params;
  
  // Get the transaction store methods
  const getTransaction = useTransactionStore(state => state.getTransaction);
  const deleteTransaction = useTransactionStore(state => state.deleteTransaction);

  useEffect(() => {
    // Simulate fetching transaction data
    setIsLoading(true);
    
    // Use the store to get the transaction
    setTimeout(() => {
      const foundTransaction = getTransaction(id);
      setTransaction(foundTransaction || null);
      setIsLoading(false);
    }, 300);
  }, [id, getTransaction]);

  const handleDelete = () => {
    setIsDeleting(true);
    
    // Use the store to delete the transaction
    deleteTransaction(id);
    console.log('Deleting transaction:', id);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsDeleting(false);
      router.push('/dashboard/transactions');
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800">Transaction Not Found</h2>
        <p className="text-gray-600 mt-2">The transaction you're looking for doesn't exist.</p>
        <button 
          onClick={() => router.push('/dashboard/transactions')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <TransactionDetailView
      transaction={transaction}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      showDeleteConfirm={showDeleteConfirm}
      setShowDeleteConfirm={setShowDeleteConfirm}
    />
  );
} 