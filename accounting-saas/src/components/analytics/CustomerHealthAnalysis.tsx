import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';
import { formatCurrency } from '@/utils/dateUtils';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CustomerSegment {
  name: string;
  count: number;
  revenue: number;
  color: string;
}

interface CustomerHealthMetrics {
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  churnedLastMonth: number;
  averageRevenuePerCustomer: number;
  segments: CustomerSegment[];
}

interface CustomerHealthAnalysisProps {
  metrics: CustomerHealthMetrics;
}

export default function CustomerHealthAnalysis({ metrics }: CustomerHealthAnalysisProps) {
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2 1 1 0 01-1-1v-1h1a1 1 0 100-2h-1V7a3 3 0 00-3-3z" clipRule="evenodd" />
    </svg>
  );

  // Prepare data for the segment doughnut chart
  const segmentChartData = {
    labels: metrics.segments.map(segment => segment.name),
    datasets: [
      {
        data: metrics.segments.map(segment => segment.count),
        backgroundColor: metrics.segments.map(segment => segment.color),
        borderColor: metrics.segments.map(segment => segment.color),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} customers (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <ChartContainer title="Customer Health Analysis" icon={icon}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">TOTAL CUSTOMERS</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                {metrics.totalCustomers.toLocaleString()}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">ACTIVE CUSTOMERS</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                {metrics.activeCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round((metrics.activeCustomers / metrics.totalCustomers) * 100)}% of total
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">AT RISK</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                {metrics.atRiskCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round((metrics.atRiskCustomers / metrics.totalCustomers) * 100)}% of total
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">CHURNED LAST MONTH</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                {metrics.churnedLastMonth.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round((metrics.churnedLastMonth / metrics.totalCustomers) * 100)}% of total
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Average Revenue per Customer</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(metrics.averageRevenuePerCustomer)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">per month</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Customer Segmentation</p>
          <div className="h-64">
            <Doughnut data={segmentChartData} options={chartOptions} />
          </div>
          
          <div className="mt-6 space-y-3">
            {metrics.segments.map((segment, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{segment.name}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(segment.revenue)} revenue
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartContainer>
  );
} 