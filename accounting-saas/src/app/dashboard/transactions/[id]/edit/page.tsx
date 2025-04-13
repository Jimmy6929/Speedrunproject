'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm';
import { formatDateTime } from '@/utils/dateUtils';
import useTransactionStore from '@/utils/transactionStore';

export default function EditTransaction({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;
  
  // Get transaction store methods
  const getTransaction = useTransactionStore(state => state.getTransaction);
  const updateTransaction = useTransactionStore(state => state.updateTransaction);

  useEffect(() => {
    // Simulate fetching transaction data
    setIsLoading(true);
    setError(null);
    
    // Use the store to get the transaction
    setTimeout(() => {
      const foundTransaction = getTransaction(id);
      if (foundTransaction) {
        setTransaction(foundTransaction);
        setIsLoading(false);
      } else {
        setTransaction(null);
        setError('Transaction not found');
        setIsLoading(false);
      }
    }, 300);
  }, [id, getTransaction]);

  const handleSubmit = (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    // In a real app, this would update data via API
    console.log('Transaction data to update:', data);
    
    // Update the updatedAt timestamp
    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update the transaction in the store
    updateTransaction(updatedData);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate back to transaction detail page
      router.push(`/dashboard/transactions/${id}`);
    }, 500);
  };

  const handleCancel = () => {
    router.push(`/dashboard/transactions/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !transaction) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
        <p className="text-gray-500 mt-1">Editing transaction {transaction.id}</p>
      </div>

      {isSubmitting ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <TransactionForm 
          isEdit={true}
          initialData={transaction}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
} 