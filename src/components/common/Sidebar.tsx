import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: 'green' | 'amber' | 'blue' | 'gray';
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  ctaButton?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  subtitle,
  items,
  activeId,
  onSelect,
  ctaButton,
}) => {
  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl border border-[#E5EAE7] p-4 shrink-0 shadow-xs">
      <div className="mb-4 pb-3 border-b border-[#F8F8F2] px-2">
        <h3 className="font-bold text-base text-[#25312B] font-heading">{title}</h3>
        {subtitle && <p className="text-xs text-[#8E9F96] mt-0.5">{subtitle}</p>}
      </div>

      {ctaButton && (
        <div className="mb-4">
          <button
            onClick={ctaButton.onClick}
            className="w-full py-2.5 px-4 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center justify-center gap-2 active:scale-98"
          >
            {ctaButton.icon && <ctaButton.icon className="w-4 h-4 text-[#6FAF78]" />}
            <span>{ctaButton.label}</span>
          </button>
        </div>
      )}

      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#EBF5ED] text-[#245C45] shadow-xs'
                  : 'text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <item.icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#245C45]' : 'text-[#8E9F96]'}`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
                    isActive
                      ? 'bg-[#245C45] text-white'
                      : item.badgeColor === 'green'
                      ? 'bg-[#EBF5ED] text-[#245C45]'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : item.badgeColor === 'blue'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
