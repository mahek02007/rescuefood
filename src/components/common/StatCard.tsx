import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'primary' | 'secondary' | 'accent' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'primary',
}) => {
  const iconColorStyles = {
    primary: 'bg-[#245C45]/10 text-[#245C45]',
    secondary: 'bg-[#6FAF78]/15 text-[#2E7356]',
    accent: 'bg-[#F4A261]/15 text-[#D97706]',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5EAE7] shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#53645B]">{label}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] mt-1.5 tracking-tight font-heading">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtitle && <p className="text-xs text-[#8E9F96] mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl ${iconColorStyles[accentColor]} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-[#F8F8F2] flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trendPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {trend}
          </span>
          <span className="text-[#8E9F96]">vs last 30 days</span>
        </div>
      )}
    </div>
  );
};
