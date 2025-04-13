'use client';

import { useState, useEffect } from 'react';

// Define expense categories that will match the reports page
const expenseCategories = [
  'Office Rent',
  'Utilities',
  'Salaries & Payroll',
  'Software & Subscriptions',
  'Marketing & Advertising',
  'Travel & Transportation',
  'Office Supplies',
  'Professional Services',
  'Insurance',
  'Equipment & Maintenance',
  'Taxes',
  'Meals & Entertainment',
  'Training & Education',
  'Miscellaneous'
];

// Define income categories
const incomeCategories = [
  'Sales Revenue',
  'Consulting Services',
  'Subscription Fees',
  'Project Income',
  'Refunds',
  'Interest Income',
  'Other Income'
];

type TransactionFormProps = {
  isEdit?: boolean;
  initialData?: {
    id?: string;
    date?: string;
    description?: string;
    category?: string;
    amount?: number;
    status?: string;
    account?: string;
    type?: string;
    reference?: string;
    notes?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export default function TransactionForm({ 
  isEdit = false, 
  initialData = {}, 
  onSubmit,
  onCancel
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    description: initialData.description || '',
    category: initialData.category || 'Sales Revenue',
    amount: initialData.amount || '',
    status: initialData.status || 'Completed',
    account: initialData.account || 'Main Account',
    type: initialData.type || 'Credit',
    reference: initialData.reference || '',
    notes: initialData.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Update category when transaction type changes
  useEffect(() => {
    if (formData.type === 'Credit' && !incomeCategories.includes(formData.category)) {
      setFormData(prev => ({
        ...prev,
        category: incomeCategories[0]
      }));
    } else if (formData.type === 'Debit' && !expenseCategories.includes(formData.category)) {
      setFormData(prev => ({
        ...prev,
        category: expenseCategories[0]
      }));
    }
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    // Validate the field when it loses focus
    validateField(name);
  };

  const validateField = (fieldName: string) => {
    let error = '';
    
    switch (fieldName) {
      case 'date':
        if (!formData.date) error = 'Date is required';
        break;
      case 'description':
        if (!formData.description) error = 'Description is required';
        break;
      case 'amount':
        if (!formData.amount) {
          error = 'Amount is required';
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
          error = 'Amount must be a positive number';
        }
        break;
      case 'account':
        if (!formData.account) error = 'Account is required';
        break;
      case 'category':
        if (!formData.category) error = 'Category is required';
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return !error;
  };

  const validate = () => {
    const fieldNames = ['date', 'description', 'amount', 'account', 'category'];
    let isValid = true;
    
    // Validate all required fields
    fieldNames.forEach(name => {
      if (!validateField(name)) {
        isValid = false;
      }
    });
    
    // Mark all fields as touched
    const allTouched = fieldNames.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouchedFields(prev => ({
      ...prev,
      ...allTouched
    }));
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Use a deterministic ID if not in edit mode to avoid hydration errors
      const submissionData = {
        ...formData,
        amount: Number(formData.amount),
        id: initialData.id || `TRX-NEW`, // Use a deterministic ID here
      };
      
      onSubmit(submissionData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touchedFields.date && errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touchedFields.date && errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Credit">Credit (Money In)</option>
              <option value="Debit">Debit (Money Out)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Transaction description"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touchedFields.description && errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touchedFields.description && errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference (Optional)
          </label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            placeholder="Invoice number, receipt ID, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                className={`w-full pl-8 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  touchedFields.amount && errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {touchedFields.amount && errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touchedFields.category && errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {formData.type === 'Credit' ? (
                // Income categories
                incomeCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))
              ) : (
                // Expense categories
                expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))
              )}
            </select>
            {touchedFields.category && errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account
          </label>
          <select
            name="account"
            value={formData.account}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touchedFields.account && errors.account ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="Main Account">Main Account</option>
            <option value="Business Card">Business Card</option>
            <option value="Payroll Account">Payroll Account</option>
            <option value="Savings Account">Savings Account</option>
          </select>
          {touchedFields.account && errors.account && <p className="mt-1 text-sm text-red-600">{errors.account}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional details about this transaction"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
} 