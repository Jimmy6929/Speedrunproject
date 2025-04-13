import { create } from 'zustand';

// Initial transaction data
const initialTransactions = [
  {
    id: 'TRX-001',
    date: '2023-06-10',
    description: 'Client payment - ABC Corp',
    category: 'Sales Revenue',
    amount: 5000.00,
    status: 'Completed',
    account: 'Main Account',
    type: 'Credit',
    reference: 'INV-2023-0042',
    notes: 'Payment for consulting services provided in May 2023',
    createdAt: '2023-06-10T09:30:00.000Z',
    updatedAt: '2023-06-10T09:30:00.000Z'
  },
  {
    id: 'TRX-002',
    date: '2023-06-08',
    description: 'Office rent payment',
    category: 'Office Rent',
    amount: 1200.00,
    status: 'Completed',
    account: 'Main Account',
    type: 'Debit',
    reference: 'RENT-JUN2023',
    notes: 'Monthly office rent for June 2023',
    createdAt: '2023-06-08T14:15:00.000Z',
    updatedAt: '2023-06-08T14:15:00.000Z'
  },
  {
    id: 'TRX-003',
    date: '2023-06-05',
    description: 'Software subscription',
    category: 'Software & Subscriptions',
    amount: 49.99,
    status: 'Completed',
    account: 'Business Card',
    type: 'Debit',
    reference: 'SOFTWARE-JUN',
    notes: 'Monthly software subscription',
    createdAt: '2023-06-05T11:20:00.000Z',
    updatedAt: '2023-06-05T11:20:00.000Z'
  },
  {
    id: 'TRX-004',
    date: '2023-06-01',
    description: 'Client payment - XYZ Ltd',
    category: 'Project Income',
    amount: 3500.00,
    status: 'Completed',
    account: 'Main Account',
    type: 'Credit',
    reference: 'INV-2023-0038',
    notes: 'Payment for design project',
    createdAt: '2023-06-01T15:45:00.000Z',
    updatedAt: '2023-06-01T15:45:00.000Z'
  },
  {
    id: 'TRX-005',
    date: '2023-05-28',
    description: 'Office supplies',
    category: 'Office Supplies',
    amount: 125.30,
    status: 'Completed',
    account: 'Business Card',
    type: 'Debit',
    reference: 'OFF-2023-123',
    notes: 'Paper, pens, and other office supplies',
    createdAt: '2023-05-28T10:15:00.000Z',
    updatedAt: '2023-05-28T10:15:00.000Z'
  },
  {
    id: 'TRX-006',
    date: '2023-05-25',
    description: 'Client deposit - New Project',
    category: 'Project Income',
    amount: 2000.00,
    status: 'Pending',
    account: 'Main Account',
    type: 'Credit',
    reference: 'DEP-2023-007',
    notes: 'Initial deposit for new website project',
    createdAt: '2023-05-25T09:30:00.000Z',
    updatedAt: '2023-05-25T09:30:00.000Z'
  },
  {
    id: 'TRX-007',
    date: '2023-05-20',
    description: 'Utility bill payment',
    category: 'Utilities',
    amount: 210.15,
    status: 'Completed',
    account: 'Main Account',
    type: 'Debit',
    reference: 'UTIL-MAY2023',
    notes: 'Electricity and water bills',
    createdAt: '2023-05-20T14:30:00.000Z',
    updatedAt: '2023-05-20T14:30:00.000Z'
  },
  {
    id: 'TRX-008',
    date: '2023-05-15',
    description: 'Employee salaries',
    category: 'Salaries & Payroll',
    amount: 8500.00,
    status: 'Completed',
    account: 'Payroll Account',
    type: 'Debit',
    reference: 'PAY-MAY2023',
    notes: 'May 2023 payroll',
    createdAt: '2023-05-15T10:00:00.000Z',
    updatedAt: '2023-05-15T10:00:00.000Z'
  },
  {
    id: 'TRX-009',
    date: '2023-06-12',
    description: 'Marketing campaign',
    category: 'Marketing & Advertising',
    amount: 750.50,
    status: 'Completed',
    account: 'Business Card',
    type: 'Debit',
    reference: 'MKTG-JUN2023',
    notes: 'Social media advertising campaign',
    createdAt: '2023-06-12T13:20:00.000Z',
    updatedAt: '2023-06-12T13:20:00.000Z'
  },
  {
    id: 'TRX-010',
    date: '2023-06-11',
    description: 'Business insurance',
    category: 'Insurance',
    amount: 420.75,
    status: 'Completed',
    account: 'Main Account',
    type: 'Debit',
    reference: 'INS-JUN2023',
    notes: 'Quarterly business insurance payment',
    createdAt: '2023-06-11T09:45:00.000Z',
    updatedAt: '2023-06-11T09:45:00.000Z'
  },
  {
    id: 'TRX-011',
    date: '2023-06-09',
    description: 'Client meeting lunch',
    category: 'Meals & Entertainment',
    amount: 85.30,
    status: 'Completed',
    account: 'Business Card',
    type: 'Debit',
    reference: 'MEAL-0609',
    notes: 'Lunch with potential client',
    createdAt: '2023-06-09T14:30:00.000Z',
    updatedAt: '2023-06-09T14:30:00.000Z'
  },
  {
    id: 'TRX-012',
    date: '2023-06-07',
    description: 'Professional development course',
    category: 'Training & Education',
    amount: 299.99,
    status: 'Completed',
    account: 'Business Card',
    type: 'Debit',
    reference: 'TRAIN-0607',
    notes: 'Online course for staff development',
    createdAt: '2023-06-07T11:15:00.000Z',
    updatedAt: '2023-06-07T11:15:00.000Z'
  },
  {
    id: 'TRX-013',
    date: '2023-06-03',
    description: 'Monthly subscription revenue',
    category: 'Subscription Fees',
    amount: 3200.00,
    status: 'Completed',
    account: 'Main Account',
    type: 'Credit',
    reference: 'SUB-JUN2023',
    notes: 'Customer subscription fees for June',
    createdAt: '2023-06-03T08:30:00.000Z',
    updatedAt: '2023-06-03T08:30:00.000Z'
  }
];

// Transaction type
export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: string;
  account: string;
  type: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Define the store type
type TransactionStore = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
};

// Create the store
const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: initialTransactions,
  
  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions]
    }));
  },
  
  updateTransaction: (transaction) => {
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === transaction.id ? transaction : t
      )
    }));
  },
  
  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id)
    }));
  },
  
  getTransaction: (id) => {
    return get().transactions.find((t) => t.id === id);
  }
}));

export default useTransactionStore; 