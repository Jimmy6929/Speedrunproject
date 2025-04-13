export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your accounts.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-gray-500 font-medium">Total Revenue</h2>
            <span className="text-green-500 bg-green-100 p-1 rounded">+12.5%</span>
          </div>
          <p className="text-2xl font-bold mt-2">$24,780.90</p>
          <p className="text-gray-500 text-sm mt-2">For current month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-gray-500 font-medium">Total Expenses</h2>
            <span className="text-red-500 bg-red-100 p-1 rounded">+2.3%</span>
          </div>
          <p className="text-2xl font-bold mt-2">$12,450.20</p>
          <p className="text-gray-500 text-sm mt-2">For current month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-gray-500 font-medium">Outstanding Invoices</h2>
            <span className="text-yellow-500 bg-yellow-100 p-1 rounded">4 due</span>
          </div>
          <p className="text-2xl font-bold mt-2">$8,325.60</p>
          <p className="text-gray-500 text-sm mt-2">Total outstanding</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-gray-500 font-medium">Cash Flow</h2>
            <span className="text-green-500 bg-green-100 p-1 rounded">+5.2%</span>
          </div>
          <p className="text-2xl font-bold mt-2">$12,330.70</p>
          <p className="text-gray-500 text-sm mt-2">Net for month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#INV-001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">25 May 2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Invoice payment - Client A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,500.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#EXP-047</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24 May 2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Office supplies</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-$350.20</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#INV-002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">22 May 2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Invoice payment - Client B</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$1,750.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 