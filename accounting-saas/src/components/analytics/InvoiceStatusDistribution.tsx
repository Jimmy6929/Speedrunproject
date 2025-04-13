import { PolarArea } from 'react-chartjs-2';

interface StatusCounts {
  'Paid': number;
  'Unpaid': number;
  'Partially Paid': number;
  'Overdue': number;
  'Cancelled': number;
}

interface InvoiceStatusDistributionProps {
  statusCounts: StatusCounts;
  isDarkMode: boolean;
}

export default function InvoiceStatusDistribution({ 
  statusCounts, 
  isDarkMode 
}: InvoiceStatusDistributionProps) {
  const chartTextColor = isDarkMode ? '#f9fafb' : '#171717';
  
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Number of Invoices',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(201, 203, 207, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartTextColor,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Invoice Status Distribution</h2>
      <div className="h-80">
        <PolarArea 
          data={statusData}
          options={polarOptions}
        />
      </div>
    </div>
  );
} 