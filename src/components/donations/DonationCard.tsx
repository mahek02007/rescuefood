import React from 'react';
import { Donation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { calculateDistance, formatDistance } from '../../utils/haversine';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, Users, ShieldCheck, ChevronRight, Utensils } from 'lucide-react';

interface DonationCardProps {
  donation: Donation;
  onViewDetails: (donation: Donation) => void;
  onClaim?: (donation: Donation) => void;
  onVolunteerAction?: (donation: Donation) => void;
  layout?: 'grid' | 'list';
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onViewDetails,
  onClaim,
  onVolunteerAction,
  layout = 'grid',
}) => {
  const { userLocation } = useData();
  const { currentUser } = useAuth();

  const distanceKm = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    donation.latitude,
    donation.longitude
  );

  const getDietaryBadgeColor = (diet: string) => {
    switch (diet) {
      case 'Vegetarian':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Vegan':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Non-Vegetarian':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#F8F8F2]">
            <img
              src={donation.imageUrl}
              alt={donation.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1.5 left-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getDietaryBadgeColor(donation.foodType)}`}>
                {donation.foodType}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <StatusBadge status={donation.status} size="sm" />
              <span className="text-[11px] font-bold text-[#245C45] bg-[#EBF5ED] px-2 py-0.5 rounded-md">
                {donation.category}
              </span>
              <span className="text-xs text-[#8E9F96] font-mono">#{donation.id}</span>
            </div>

            <h4
              onClick={() => onViewDetails(donation)}
              className="text-sm sm:text-base font-bold text-[#25312B] hover:text-[#245C45] transition-colors truncate cursor-pointer"
            >
              {donation.title}
            </h4>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#53645B] mt-1.5">
              <span className="font-semibold text-[#25312B] flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-[#245C45]" />
                {donation.quantityValue} {donation.quantityUnit} (~{donation.estimatedPeopleServed} serves)
              </span>
              <span className="flex items-center gap-1 text-[#245C45] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                {formatDistance(distanceKm)} away ({donation.area})
              </span>
              <span className="flex items-center gap-1 text-[#8E9F96]">
                <Clock className="w-3.5 h-3.5" />
                Pickup: {donation.pickupTimeWindow}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F8F8F2]">
          <button
            onClick={() => onViewDetails(donation)}
            className="px-3 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
          >
            Details
          </button>

          {donation.status === 'Available' && (currentUser?.role === 'ngo' || !currentUser) && onClaim && (
            <button
              onClick={() => onClaim(donation)}
              className="px-4 py-2 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Claim Food
            </button>
          )}

          {donation.status === 'Claimed' && currentUser?.role === 'volunteer' && onVolunteerAction && (
            <button
              onClick={() => onVolunteerAction(donation)}
              className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Accept Courier Task
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAE7] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Food Photo Header */}
      <div className="relative h-48 w-full bg-[#F8F8F2] overflow-hidden">
        <img
          src={donation.imageUrl}
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <StatusBadge status={donation.status} size="sm" />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md bg-white/90 border ${getDietaryBadgeColor(donation.foodType)}`}>
            {donation.foodType}
          </span>
        </div>

        {/* Bottom Distance & ID */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-semibold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#F4A261]" />
            {formatDistance(distanceKm)} away
          </span>
          <span className="text-[11px] font-mono text-white/80 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
            #{donation.id}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-[#245C45] font-semibold mb-1">
          <span>{donation.category}</span>
          <span className="text-[#8E9F96]">•</span>
          <span className="text-[#53645B] truncate">{donation.storageCondition}</span>
        </div>

        <h4
          onClick={() => onViewDetails(donation)}
          className="font-bold text-base text-[#25312B] group-hover:text-[#245C45] transition-colors line-clamp-1 cursor-pointer font-heading"
        >
          {donation.title}
        </h4>

        <p className="text-xs text-[#53645B] line-clamp-2 mt-1 leading-relaxed">
          {donation.description}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-[#F8F8F2] border border-[#E5EAE7]/60 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Quantity</span>
            <p className="font-bold text-[#25312B] mt-0.5 truncate">
              {donation.quantityValue} {donation.quantityUnit}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Serves</span>
            <p className="font-bold text-[#25312B] mt-0.5 truncate flex items-center gap-1">
              <Users className="w-3 h-3 text-[#245C45]" />
              ~{donation.estimatedPeopleServed} people
            </p>
          </div>
        </div>

        {/* Pickup Window & Area */}
        <div className="space-y-1 text-xs text-[#53645B] mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8E9F96] shrink-0" />
            <span className="truncate">Window: <strong className="text-[#25312B]">{donation.pickupTimeWindow}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8E9F96] shrink-0" />
            <span className="truncate">{donation.pickupAddress}</span>
          </div>
        </div>

        {/* Donor footer & Action buttons */}
        <div className="mt-auto pt-3 border-t border-[#F8F8F2] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {donation.donorAvatar ? (
              <img
                src={donation.donorAvatar}
                alt={donation.donorName}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#6FAF78]/30 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold flex items-center justify-center shrink-0">
                {donation.donorName[0]}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#25312B] truncate">{donation.donorOrg || donation.donorName}</span>
                {donation.donorVerified && (
                  <span title="Verified Donor">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#245C45] shrink-0" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contextual CTA */}
          <div className="shrink-0">
            {donation.status === 'Available' && (currentUser?.role === 'ngo' || !currentUser) && onClaim ? (
              <button
                onClick={() => onClaim(donation)}
                className="px-3.5 py-1.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 active:scale-95"
              >
                Claim
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onViewDetails(donation)}
                className="px-3 py-1.5 text-xs font-semibold text-[#245C45] hover:bg-[#EBF5ED] rounded-xl transition-colors"
              >
                Details →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
