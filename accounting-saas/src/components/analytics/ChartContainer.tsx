import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartContainer({
  title,
  icon,
  children,
  className = ''
}: ChartContainerProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow ${className}`}>
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
} 