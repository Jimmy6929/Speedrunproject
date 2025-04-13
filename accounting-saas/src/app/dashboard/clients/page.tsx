'use client';

import { useState, useEffect } from 'react';
import useInvoiceStore from '@/utils/invoiceStore';
import ClientSummary from '@/components/ClientSummary';
import ClientSearch from '@/components/ClientSearch';
import ClientList, { Client } from '@/components/ClientList';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const invoices = useInvoiceStore(state => state.invoices);
  
  // Process invoices to get client information
  useEffect(() => {
    const clientMap = new Map<string, Client>();
    
    invoices.forEach(invoice => {
      const { clientName, clientEmail, clientAddress, total, status, issueDate } = invoice;
      
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          name: clientName,
          email: clientEmail,
          address: clientAddress,
          totalBilled: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          invoiceCount: 0,
          lastInvoiceDate: issueDate
        });
      }
      
      const client = clientMap.get(clientName)!;
      
      // Update client data
      client.totalBilled += total;
      client.invoiceCount += 1;
      
      // Update payment status
      if (status === 'Paid') {
        client.totalPaid += total;
      } else {
        client.totalOutstanding += total;
      }
      
      // Update last invoice date if this one is newer
      if (new Date(issueDate) > new Date(client.lastInvoiceDate)) {
        client.lastInvoiceDate = issueDate;
      }
    });
    
    // Convert map to array and sort
    let clientArray = Array.from(clientMap.values());
    setClients(clientArray);
  }, [invoices]);
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    client.email.toLowerCase().includes(search.toLowerCase())
  );
  
  // Sort clients based on current sort settings
  const sortedClients = [...filteredClients].sort((a, b) => {
    let compareA, compareB;
    
    // Determine what to compare based on sortBy
    switch (sortBy) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'totalBilled':
        compareA = a.totalBilled;
        compareB = b.totalBilled;
        break;
      case 'totalPaid':
        compareA = a.totalPaid;
        compareB = b.totalPaid;
        break;
      case 'totalOutstanding':
        compareA = a.totalOutstanding;
        compareB = b.totalOutstanding;
        break;
      case 'invoiceCount':
        compareA = a.invoiceCount;
        compareB = b.invoiceCount;
        break;
      case 'lastInvoiceDate':
        compareA = new Date(a.lastInvoiceDate).getTime();
        compareB = new Date(b.lastInvoiceDate).getTime();
        break;
      default:
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
    }
    
    // Determine sort order
    return sortOrder === 'asc' 
      ? compareA > compareB ? 1 : -1
      : compareA < compareB ? 1 : -1;
  });
  
  // Handle sort changes
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, sort by this column in ascending order
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Handle viewing client invoices
  const handleViewInvoices = (clientName: string) => {
    // Filter invoices by client and open the first one
    const clientInvoices = invoices.filter(inv => inv.clientName === clientName);
    if (clientInvoices.length > 0) {
      window.location.href = `/dashboard/invoices/${clientInvoices[0].id}`;
    }
  };
  
  // Calculate total values for summary
  const totalBilled = clients.reduce((sum, client) => sum + client.totalBilled, 0);
  const totalOutstanding = clients.reduce((sum, client) => sum + client.totalOutstanding, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client relationships</p>
        </div>
      </div>
      
      {/* Search */}
      <ClientSearch 
        search={search} 
        setSearch={setSearch} 
      />
      
      {/* Clients table */}
      <ClientList 
        clients={sortedClients}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        onViewInvoices={handleViewInvoices}
      />
      
      {/* Stats cards */}
      <ClientSummary 
        totalClients={clients.length}
        totalBilled={totalBilled}
        totalOutstanding={totalOutstanding}
      />
    </div>
  );
} 