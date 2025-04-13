import { Radar } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';

interface ClientData {
  name: string;
  count: number;
  value: number;
}

interface ClientRevenueDistributionProps {
  topClientsByValue: ClientData[];
  isDarkMode: boolean;
  currencySymbol: string;
}

export default function ClientRevenueDistribution({ 
  topClientsByValue, 
  isDarkMode,
  currencySymbol
}: ClientRevenueDistributionProps) {
  // Chart colors based on theme
  const chartTextColor = isDarkMode ? '#f9fafb' : '#171717';
  const chartGridColor = isDarkMode ? '#4b5563' : '#e5e7eb';
  
  // Client revenue distribution data for Radar chart
  const clientDistributionData = {
    labels: topClientsByValue.map(client => client.name),
    datasets: [
      {
        label: `Revenue (${currencySymbol})`,
        data: topClientsByValue.map(client => client.value),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: chartGridColor,
        },
        pointLabels: {
          color: chartTextColor,
        },
      },
    },
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
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Client Revenue Distribution</h2>
      <div className="h-80">
        <Radar 
          data={clientDistributionData}
          options={radarOptions}
        />
      </div>
    </div>
  );
} 