interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  timeframe?: string;
  chart?: 'line' | 'bar' | 'none';
  chartData?: number[];
}

export default function KPICard({
  title,
  value,
  change,
  timeframe,
  chart = 'none',
  chartData = [],
}: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.value}
            </p>
          )}
        </div>
      </div>
      
      {timeframe && (
        <p className="text-xs text-gray-500 mt-2">{timeframe}</p>
      )}
      
      {chart !== 'none' && chartData.length > 0 && (
        <div className="mt-4 h-16 flex items-end gap-1">
          {chartData.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-green-200 rounded-t"
              style={{ height: `${(val / Math.max(...chartData)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

