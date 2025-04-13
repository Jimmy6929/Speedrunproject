'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useInvoiceStore, { Invoice } from '@/utils/invoiceStore';

export default function InvoiceDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const getInvoice = useInvoiceStore(state => state.getInvoice);
  const deleteInvoice = useInvoiceStore(state => state.deleteInvoice);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const invoiceData = getInvoice(id);
    if (invoiceData) {
      setInvoice(invoiceData);
    } else {
      // Invoice not found, redirect to invoices list
      router.push('/dashboard/invoices');
    }
  }, [id, getInvoice, router]);

  const handleDelete = () => {
    if (confirmDelete && invoice) {
      deleteInvoice(invoice.id);
      router.push('/dashboard/invoices');
    } else {
      setConfirmDelete(true);
    }
  };

  if (!invoice) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statusColors = {
    'Paid': 'bg-green-100 text-green-800',
    'Unpaid': 'bg-yellow-100 text-yellow-800',
    'Partially Paid': 'bg-blue-100 text-blue-800',
    'Overdue': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.id}</h1>
          <p className="text-gray-500">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/invoices/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Invoice
          </Link>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 rounded-lg ${
              confirmDelete 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
            }`}
          >
            {confirmDelete ? 'Confirm Delete' : 'Delete Invoice'}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Client Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {invoice.clientName}</p>
              <p><span className="font-medium">Email:</span> {invoice.clientEmail}</p>
              {invoice.clientAddress && (
                <p><span className="font-medium">Address:</span> {invoice.clientAddress}</p>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-3">Invoice Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                  {invoice.status}
                </span>
              </p>
              {invoice.paymentDate && (
                <p><span className="font-medium">Payment Date:</span> {new Date(invoice.paymentDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">Invoice Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-t pt-4">
              <span className="text-sm font-medium text-gray-700">Subtotal:</span>
              <span className="text-sm font-medium text-gray-900">${invoice.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Tax Rate:</span>
                <span>{invoice.taxRate}%</span>
              </div>
              <span className="text-sm font-medium text-gray-900">${invoice.taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between border-t pt-4">
              <span className="text-base font-bold text-gray-900">Total:</span>
              <span className="text-base font-bold text-gray-900">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div>
            <h2 className="text-lg font-medium mb-3">Notes</h2>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Link
          href="/dashboard/invoices"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back to Invoices
        </Link>
      </div>
    </div>
  );
} 