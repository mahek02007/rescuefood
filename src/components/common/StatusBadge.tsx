import React from 'react';
import { DonationStatus } from '../../types';
import { CheckCircle2, Clock, Truck, Check, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DonationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  switch (status) {
    case 'Available':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-[#EBF5ED] text-[#245C45] border border-[#6FAF78]/40 ${sizeClasses[size]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#245C45] animate-pulse" />
          Available
        </span>
      );
    case 'Claimed':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/30 ${sizeClasses[size]}`}
        >
          <Clock className="w-3 h-3" />
          Claimed
        </span>
      );
    case 'Pickup Scheduled':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#3B82F6]/30 ${sizeClasses[size]}`}
        >
          <Truck className="w-3 h-3" />
          Pickup Scheduled
        </span>
      );
    case 'Picked Up':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-[#FAF5FF] text-[#9333EA] border border-[#A855F7]/30 ${sizeClasses[size]}`}
        >
          <Truck className="w-3 h-3" />
          In Transit
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-[#ECFDF5] text-[#059669] border border-[#10B981]/30 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3 h-3" />
          Delivered
        </span>
      );
    case 'Cancelled':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-red-50 text-red-600 border border-red-200 ${sizeClasses[size]}`}
        >
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-gray-100 text-gray-700 ${sizeClasses[size]}`}
        >
          {status}
        </span>
      );
  }
};
