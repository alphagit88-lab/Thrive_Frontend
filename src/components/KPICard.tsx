import { LucideIcon } from 'lucide-react';

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
  icon?: LucideIcon;
  gradient?: string;
}

export default function KPICard({
  title,
  value,
  change,
  timeframe,
  chart = 'none',
  chartData = [],
  icon: Icon,
  gradient = 'from-blue-500 to-blue-600',
}: KPICardProps) {
  const maxValue = chartData.length > 0 ? Math.max(...chartData) : 1;
  
  // Map gradient string to Tailwind classes
  const getGradientClasses = (grad: string) => {
    const gradientMap: Record<string, string> = {
      'from-blue-500 to-blue-600': 'bg-linear-to-r from-blue-500 to-blue-600',
      'from-green-500 to-green-600': 'bg-linear-to-r from-green-500 to-green-600',
      'from-purple-500 to-purple-600': 'bg-linear-to-r from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600': 'bg-linear-to-r from-orange-500 to-orange-600',
    };
    return gradientMap[grad] || gradientMap['from-blue-500 to-blue-600'];
  };

  const getGradientClassesVertical = (grad: string) => {
    const gradientMap: Record<string, string> = {
      'from-blue-500 to-blue-600': 'bg-linear-to-t from-blue-500 to-blue-600',
      'from-green-500 to-green-600': 'bg-linear-to-t from-green-500 to-green-600',
      'from-purple-500 to-purple-600': 'bg-linear-to-t from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600': 'bg-linear-to-t from-orange-500 to-orange-600',
    };
    return gradientMap[grad] || gradientMap['from-blue-500 to-blue-600'];
  };

  const getGradientClassesBr = (grad: string) => {
    const gradientMap: Record<string, string> = {
      'from-blue-500 to-blue-600': 'bg-linear-to-br from-blue-500 to-blue-600',
      'from-green-500 to-green-600': 'bg-linear-to-br from-green-500 to-green-600',
      'from-purple-500 to-purple-600': 'bg-linear-to-br from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600': 'bg-linear-to-br from-orange-500 to-orange-600',
    };
    return gradientMap[grad] || gradientMap['from-blue-500 to-blue-600'];
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getGradientClasses(gradient)}`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {Icon && (
              <div className={`p-2 ${getGradientClassesBr(gradient)} rounded-lg shadow-md`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            )}
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
          </div>
          
          <div className="mb-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                  change.isPositive 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  <span className={change.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {change.isPositive ? '↑' : '↓'}
                  </span>
                  {change.value}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {timeframe && (
        <p className="text-xs text-gray-500 mb-4 font-medium">{timeframe}</p>
      )}
      
      {chart !== 'none' && chartData.length > 0 && (
        <div className="mt-4 h-20 flex items-end gap-1.5">
          {chartData.map((val, idx) => {
            const height = `${(val / maxValue) * 100}%`;
            const opacity = val === maxValue ? 'opacity-100' : (chart === 'bar' ? 'opacity-70' : 'opacity-60');
            return (
              <div
                key={idx}
                className={`flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80 ${getGradientClassesVertical(gradient)} ${opacity}`}
                style={{ 
                  height,
                  minHeight: '8px',
                }}
                title={`${val}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

