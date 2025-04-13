'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useInvoiceStore, { Invoice } from '@/utils/invoiceStore';
import InvoiceDetailView from '@/components/InvoiceDetailView';

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

  return (
    <InvoiceDetailView
      invoice={invoice}
      confirmDelete={confirmDelete}
      setConfirmDelete={setConfirmDelete}
      handleDelete={handleDelete}
    />
  );
} 