interface ClientData {
  name: string;
  count: number;
  value: number;
}

interface TopClientsProps {
  topClientsByCount: ClientData[];
  topClientsByValue: ClientData[];
  formatCurrency: (amount: number) => string;
}

export default function TopClients({
  topClientsByCount,
  topClientsByValue,
  formatCurrency
}: TopClientsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Clients by Invoice Count</h2>
        <div className="space-y-4">
          {topClientsByCount.map((client, index) => (
            <div key={client.name} className="flex items-center">
              <div className="w-8 text-gray-500 dark:text-gray-400 font-medium">{index + 1}.</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{client.count} invoices</div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(client.value)}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Clients by Revenue</h2>
        <div className="space-y-4">
          {topClientsByValue.map((client, index) => (
            <div key={client.name} className="flex items-center">
              <div className="w-8 text-gray-500 dark:text-gray-400 font-medium">{index + 1}.</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{client.count} invoices</div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(client.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 