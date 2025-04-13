'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useInvoiceStore, { Invoice } from '@/utils/invoiceStore';
import { v4 as uuidv4 } from 'uuid';

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
};

export default function NewInvoice() {
  const router = useRouter();
  const addInvoice = useInvoiceStore(state => state.addInvoice);
  
  // Get today's date and set due date to 30 days from now
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const dueDate = thirtyDaysFromNow.toISOString().split('T')[0];
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDateValue, setDueDateValue] = useState(dueDate);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uuidv4(), description: '', quantity: 1, price: 0, amount: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [status, setStatus] = useState<'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue' | 'Cancelled'>('Unpaid');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  // Update item amount when quantity or price changes
  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate amount if quantity or price changes
          if (field === 'quantity' || field === 'price') {
            updatedItem.amount = updatedItem.quantity * updatedItem.price;
          }
          
          return updatedItem;
        }
        return item;
      });
    });
  };
  
  // Add a new line item
  const addItem = () => {
    setItems([
      ...items,
      { id: uuidv4(), description: '', quantity: 1, price: 0, amount: 0 }
    ]);
  };
  
  // Remove a line item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!clientEmail.trim()) newErrors.clientEmail = 'Client email is required';
    if (!issueDate) newErrors.issueDate = 'Issue date is required';
    if (!dueDateValue) newErrors.dueDate = 'Due date is required';
    
    // Validate items
    let hasItemErrors = false;
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item-${index}-description`] = 'Description is required';
        hasItemErrors = true;
      }
      if (item.quantity <= 0) {
        newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
        hasItemErrors = true;
      }
      if (item.price < 0) {
        newErrors[`item-${index}-price`] = 'Price cannot be negative';
        hasItemErrors = true;
      }
    });
    
    if (hasItemErrors) {
      newErrors.items = 'Please fix errors in line items';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Generate invoice ID (format: INV-YYYY-XXXX)
    const year = new Date().getFullYear();
    const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    const invoiceId = `INV-${year}-${randomId}`;
    
    // Create the invoice object
    const newInvoice = {
      id: invoiceId,
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate: dueDateValue,
      items: items.map(({ id, price, ...rest }) => ({
        ...rest,
        unitPrice: price
      })), // Map price to unitPrice
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes,
      status,
      paymentDate: status === 'Paid' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to store
    addInvoice(newInvoice);
    
    // Redirect to invoices list
    router.push('/dashboard/invoices');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-500 mt-1">Fill in the details to create a new invoice</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.clientName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.clientName && (
                <p className="mt-1 text-sm text-red-500">{errors.clientName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Client Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="clientEmail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.clientEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-500">{errors.clientEmail}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Client Address
              </label>
              <textarea
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.issueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-500">{errors.issueDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDateValue}
                onChange={(e) => setDueDateValue(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue' | 'Cancelled')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Invoice Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Item
            </button>
          </div>
          
          {errors.items && (
            <p className="mb-4 text-sm text-red-500">{errors.items}</p>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          errors[`item-${index}-description`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`item-${index}-description`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-description`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          errors[`item-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`item-${index}-quantity`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-quantity`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          errors[`item-${index}-price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`item-${index}-price`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-price`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className={`${
                          items.length === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-t pt-4">
              <span className="text-sm font-medium text-gray-700">Subtotal:</span>
              <span className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Tax Rate:</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="ml-1 text-sm font-medium text-gray-700">%</span>
              </div>
              <span className="text-sm font-medium text-gray-900">${taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between border-t pt-4">
              <span className="text-base font-bold text-gray-900">Total:</span>
              <span className="text-base font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add any additional notes or payment instructions"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/invoices')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
} 