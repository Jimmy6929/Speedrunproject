import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';
import { formatCurrency } from '@/utils/dateUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CashFlowDataPoint {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface CashFlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  endingBalance: number;
  percentageChange: number;
  projectedRunway: number; // in months
}

interface CashFlowAnalysisProps {
  data: CashFlowDataPoint[];
  summary: CashFlowSummary;
  timeframe: 'monthly' | 'quarterly' | 'yearly';
}

type Dataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  tension: number;
  pointRadius: number;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointBorderWidth: number;
  fill: boolean | string;
  yAxisID: string;
};

export default function CashFlowAnalysis({ 
  data, 
  summary, 
  timeframe = 'monthly'
}: CashFlowAnalysisProps) {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<ChartData<'line', number[], string>>({
    labels: [],
    datasets: []
  });
  
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
    </svg>
  );

  useEffect(() => {
    if (!data?.length) return;
    
    setChartData({
      labels: data.map(point => point.date),
      datasets: [
        {
          label: 'Cash Inflow',
          data: data.map(point => point.inflow),
          borderColor: 'rgba(34, 197, 94, 1)', // Green
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          fill: false,
          yAxisID: 'y',
        },
        {
          label: 'Cash Outflow',
          data: data.map(point => point.outflow),
          borderColor: 'rgba(239, 68, 68, 1)', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          fill: false,
          yAxisID: 'y',
        },
        {
          label: 'Balance',
          data: data.map(point => point.balance),
          borderColor: 'rgba(59, 130, 246, 1)', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    });
  }, [data]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Cash Flow',
        },
        grid: {
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Balance',
        },
        grid: {
          drawOnChartArea: false,
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
  };

  const getPercentageChangeClass = () => {
    if (summary.percentageChange > 0) {
      return 'text-emerald-500';
    } else if (summary.percentageChange < 0) {
      return 'text-red-500';
    }
    return 'text-gray-500';
  };

  const getRunwayStatusClass = () => {
    if (summary.projectedRunway > 12) {
      return 'text-emerald-500';
    } else if (summary.projectedRunway > 6) {
      return 'text-yellow-500';
    }
    return 'text-red-500';
  };

  const timeframeTitle = 
    timeframe === 'monthly' ? 'Monthly' : 
    timeframe === 'quarterly' ? 'Quarterly' : 'Yearly';

  return (
    <ChartContainer title={`${timeframeTitle} Cash Flow Analysis`} icon={icon}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">TOTAL CASH INFLOW</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {formatCurrency(summary.totalInflow)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">TOTAL CASH OUTFLOW</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {formatCurrency(summary.totalOutflow)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">NET CASH FLOW</p>
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
              {formatCurrency(summary.netCashFlow)}
            </p>
            <span className={`ml-2 text-sm font-medium ${getPercentageChangeClass()}`}>
              {summary.percentageChange > 0 ? '+' : ''}
              {summary.percentageChange.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">PROJECTED RUNWAY</p>
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
              {summary.projectedRunway.toFixed(1)}
            </p>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">months</span>
            <span className={`ml-2 text-sm font-medium ${getRunwayStatusClass()}`}>
              {summary.projectedRunway > 12 ? 'Healthy' : summary.projectedRunway > 6 ? 'Watch' : 'Critical'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-72 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ending Balance</p>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {formatCurrency(summary.endingBalance)}
          </p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${summary.netCashFlow >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.abs(summary.percentageChange * 2), 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {summary.netCashFlow >= 0 
            ? `Cash flow positive: Your balance increased by ${summary.percentageChange.toFixed(1)}% in this period`
            : `Cash flow negative: Your balance decreased by ${Math.abs(summary.percentageChange).toFixed(1)}% in this period`
          }
        </p>
      </div>
    </ChartContainer>
  );
} 