'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm';
import { formatDateTime } from '@/utils/dateUtils';
import useTransactionStore from '@/utils/transactionStore';

export default function NewTransaction() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Get the transaction store method
  const addTransaction = useTransactionStore(state => state.addTransaction);

  const handleSubmit = (data: any) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    // Generate a random ID here, not in the component
    const newId = `TRX-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Add created and updated timestamps
    const transactionData = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, this would send data to your API
    console.log('Transaction data to submit:', transactionData);
    
    try {
      // Add the transaction to the store
      addTransaction(transactionData);
      
      // Simulate API call delay and potential error
      setTimeout(() => {
        setSuccessMessage('Transaction created successfully!');
        // Navigate back to transactions list after showing success message
        setTimeout(() => {
          router.push('/dashboard/transactions');
        }, 500);
      }, 800);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/transactions');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Transaction</h1>
        <p className="text-gray-500 mt-1">Create a new financial transaction</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <span className="block mt-1">Redirecting to transactions list...</span>
        </div>
      )}

      {isSubmitting ? (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Creating transaction...</p>
        </div>
      ) : (
        <TransactionForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
} 