import { create } from 'zustand';

// Initial invoice data
const initialInvoices: Invoice[] = [
  {
    id: 'INV-2023-001',
    clientName: 'ABC Corporation',
    clientEmail: 'billing@abccorp.com',
    issueDate: '2023-06-10',
    dueDate: '2023-07-10',
    items: [
      { description: 'Website Development', quantity: 1, unitPrice: 3500.00, amount: 3500.00 },
      { description: 'Hosting Setup', quantity: 1, unitPrice: 150.00, amount: 150.00 }
    ],
    subtotal: 3650.00,
    taxRate: 8.5,
    taxAmount: 310.25,
    total: 3960.25,
    notes: 'Thank you for your business!',
    status: 'Paid' as 'Paid',
    paymentDate: '2023-07-05',
    createdAt: '2023-06-10T09:30:00.000Z',
    updatedAt: '2023-07-05T14:20:00.000Z'
  },
  {
    id: 'INV-2023-002',
    clientName: 'XYZ Ltd',
    clientEmail: 'accounts@xyzltd.com',
    issueDate: '2023-06-15',
    dueDate: '2023-07-15',
    items: [
      { description: 'Monthly Consulting Services', quantity: 20, unitPrice: 150.00, amount: 3000.00 },
      { description: 'Software License', quantity: 1, unitPrice: 500.00, amount: 500.00 }
    ],
    subtotal: 3500.00,
    taxRate: 8.5,
    taxAmount: 297.50,
    total: 3797.50,
    notes: 'Net 30 payment terms',
    status: 'Paid' as 'Paid',
    paymentDate: '2023-07-10',
    createdAt: '2023-06-15T11:20:00.000Z',
    updatedAt: '2023-07-10T15:45:00.000Z'
  },
  {
    id: 'INV-2023-003',
    clientName: 'Smith & Partners',
    clientEmail: 'finance@smithpartners.com',
    issueDate: '2023-07-01',
    dueDate: '2023-07-31',
    items: [
      { description: 'Logo Design', quantity: 1, unitPrice: 800.00, amount: 800.00 },
      { description: 'Business Card Design', quantity: 1, unitPrice: 300.00, amount: 300.00 },
      { description: 'Stationery Design', quantity: 1, unitPrice: 500.00, amount: 500.00 }
    ],
    subtotal: 1600.00,
    taxRate: 8.5,
    taxAmount: 136.00,
    total: 1736.00,
    notes: 'Please remit payment by due date',
    status: 'Unpaid' as 'Unpaid',
    paymentDate: null,
    createdAt: '2023-07-01T09:15:00.000Z',
    updatedAt: '2023-07-01T09:15:00.000Z'
  },
  {
    id: 'INV-2023-004',
    clientName: 'Tech Innovations',
    clientEmail: 'ap@techinnovations.com',
    issueDate: '2023-07-10',
    dueDate: '2023-08-09',
    items: [
      { description: 'Mobile App Development - Phase 1', quantity: 1, unitPrice: 5000.00, amount: 5000.00 }
    ],
    subtotal: 5000.00,
    taxRate: 8.5,
    taxAmount: 425.00,
    total: 5425.00,
    notes: '50% deposit paid. Balance due upon completion.',
    status: 'Partially Paid' as 'Partially Paid',
    paymentDate: '2023-07-12',
    createdAt: '2023-07-10T14:30:00.000Z',
    updatedAt: '2023-07-12T16:45:00.000Z'
  },
  {
    id: 'INV-2023-005',
    clientName: 'Global Marketing Solutions',
    clientEmail: 'invoices@globalmarketing.com',
    issueDate: '2023-07-15',
    dueDate: '2023-08-14',
    items: [
      { description: 'Social Media Campaign - July', quantity: 1, unitPrice: 2000.00, amount: 2000.00 },
      { description: 'Content Creation', quantity: 10, unitPrice: 100.00, amount: 1000.00 }
    ],
    subtotal: 3000.00,
    taxRate: 8.5,
    taxAmount: 255.00,
    total: 3255.00,
    notes: 'Monthly recurring invoice',
    status: 'Unpaid' as 'Unpaid',
    paymentDate: null,
    createdAt: '2023-07-15T10:00:00.000Z',
    updatedAt: '2023-07-15T10:00:00.000Z'
  }
];

// Invoice item type
export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

// Invoice type
export type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
};

// Define the store type
type InvoiceStore = {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
};

// Create the store
const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: initialInvoices,
  
  addInvoice: (invoice) => {
    set((state) => ({
      invoices: [invoice, ...state.invoices]
    }));
  },
  
  updateInvoice: (invoice) => {
    set((state) => ({
      invoices: state.invoices.map((inv) => 
        inv.id === invoice.id ? invoice : inv
      )
    }));
  },
  
  deleteInvoice: (id) => {
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id)
    }));
  },
  
  getInvoice: (id) => {
    return get().invoices.find((inv) => inv.id === id);
  }
}));

export default useInvoiceStore; 