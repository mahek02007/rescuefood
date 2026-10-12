import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Donation } from '../types';
import { Sidebar, SidebarItem } from '../components/common/Sidebar';
import { FilterPanel, FilterState } from '../components/donations/FilterPanel';
import { DonationCard } from '../components/donations/DonationCard';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { DonationDetailModal } from '../components/donations/DonationDetailModal';
import { ClaimModal } from '../components/donations/ClaimModal';
import { calculateDistance } from '../utils/haversine';
import {
  HeartHandshake,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Sparkles,
  MapPin,
  Utensils,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const NgoDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { donations, userLocation, searchRadius } = useData();

  const [activeTab, setActiveTab] = useState<string>('available');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    foodType: 'All',
    quantityRange: 'all',
    sortBy: 'distance',
    statusFilter: 'all',
  });

  // Modals
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [claimDonationTarget, setClaimDonationTarget] = useState<Donation | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // NGO Claimed list
  const claimedByMe = donations.filter(
    (d) =>
      d.claimedByNgoId === currentUser?.id ||
      d.claimedByNgoName?.includes('Hope Hearth') ||
      d.claimedByNgoName?.includes(currentUser?.name || '')
  );

  const availableDonations = donations.filter((d) => d.status === 'Available');
  const upcomingPickups = claimedByMe.filter((d) => d.status === 'Pickup Scheduled' || d.status === 'Picked Up');
  const completedDonations = claimedByMe.filter((d) => d.status === 'Completed');

  const sidebarItems: SidebarItem[] = [
    { id: 'available', label: 'Available Surplus Food', icon: Search, badge: availableDonations.length, badgeColor: 'green' },
    { id: 'claimed', label: 'My Claimed Donations', icon: HeartHandshake, badge: claimedByMe.length, badgeColor: 'amber' },
    { id: 'upcoming', label: 'Upcoming Pickups', icon: Clock, badge: upcomingPickups.length, badgeColor: 'blue' },
    { id: 'completed', label: 'Completed Deliveries', icon: CheckCircle2, badge: completedDonations.length },
    { id: 'profile', label: 'NGO Profile & Verification', icon: FileCheck },
  ];

  // Base list based on tab
  const currentBaseList =
    activeTab === 'available'
      ? availableDonations
      : activeTab === 'claimed'
      ? claimedByMe
      : activeTab === 'upcoming'
      ? upcomingPickups
      : activeTab === 'completed'
      ? completedDonations
      : [];

  // Filter & sort
  const filteredDonations = currentBaseList
    .map((donation) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        donation.latitude,
        donation.longitude
      );
      return { donation, distance };
    })
    .filter(({ donation, distance }) => {
      // Radius filter
      if (distance > searchRadius) return false;

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matches =
          donation.title.toLowerCase().includes(query) ||
          donation.description.toLowerCase().includes(query) ||
          donation.category.toLowerCase().includes(query) ||
          donation.area.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Category
      if (filters.category !== 'All' && donation.category !== filters.category) return false;

      // Dietary
      if (filters.foodType !== 'All' && donation.foodType !== filters.foodType) return false;

      // Quantity range
      if (filters.quantityRange === 'small' && donation.quantityValue >= 25) return false;
      if (filters.quantityRange === 'medium' && (donation.quantityValue < 25 || donation.quantityValue > 50)) return false;
      if (filters.quantityRange === 'large' && donation.quantityValue <= 50) return false;

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'distance') return a.distance - b.distance;
      if (filters.sortBy === 'newest') return new Date(b.donation.createdAt).getTime() - new Date(a.donation.createdAt).getTime();
      if (filters.sortBy === 'deadline') return a.donation.expiryDateTime.localeCompare(b.donation.expiryDateTime);
      return 0;
    })
    .map((item) => item.donation);

  const handleOpenDetail = (d: Donation) => {
    setSelectedDonation(d);
    setIsDetailModalOpen(true);
  };

  const handleOpenClaim = (d: Donation) => {
    setClaimDonationTarget(d);
    setIsClaimModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* NGO Portal Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold uppercase tracking-wider">
              NGO &amp; Recipient Portal
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> 501(c)(3) Verified Organization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
            {currentUser?.organization || 'Hope Hearth Community Kitchen'}
          </h1>
          <p className="text-xs sm:text-sm text-[#53645B] mt-1">
            Discover and claim safe banquet and grocery surplus within your distribution radius.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#8E9F96] uppercase font-bold">Capacity Today</span>
            <p className="text-sm font-bold text-[#245C45]">250 meals/day active capacity</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <Sidebar
          title="Recipient Portal"
          subtitle="Manage food redistribution"
          items={sidebarItems}
          activeId={activeTab}
          onSelect={setActiveTab}
        />

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'profile' ? (
            /* NGO Profile & Verification Card */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] space-y-6">
              <div className="flex items-center justify-between border-b border-[#F8F8F2] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#25312B] font-heading">
                    Organization Profile &amp; Verification
                  </h3>
                  <p className="text-xs text-[#53645B] mt-0.5">
                    Accredited charity credentials and cold storage facilities
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Partner (Simulated)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Nonprofit Name</span>
                  <p className="font-bold text-[#25312B] text-sm mt-0.5">Hope Hearth Community Kitchen</p>
                  <p className="text-[#53645B] mt-1">Registration #NP-449102-CA</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Primary Contact</span>
                  <p className="font-bold text-[#25312B] text-sm mt-0.5">Sarah Jenkins, Director</p>
                  <p className="text-[#53645B] mt-1">sarah@hopehearth.org · +1 (555) 876-5432</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Facility Address</span>
                  <p className="font-bold text-[#25312B] text-sm mt-0.5">1280 St. Jude Sanctuary Way</p>
                  <p className="text-[#53645B] mt-1">East Valley Community Zone, Metropolis - 94107</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Cold Storage Amenities</span>
                  <p className="font-bold text-[#245C45] text-sm mt-0.5">Walk-in Cooler (4°C) &amp; Deep Freezer</p>
                  <p className="text-[#53645B] mt-1">Insulated thermal transport bins verified</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <p className="font-bold mb-1">Demo Verification Notice:</p>
                <p>
                  All NGO accounts in demo mode receive simulated accreditation. In live production, organizations submit their 501(c)(3) certificate, health department food permit, and facility storage audit for admin manual review.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Panel */}
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalResults={filteredDonations.length}
              />

              {/* View Switch Rendering */}
              {viewMode === 'map' ? (
                <InteractiveMap
                  donations={filteredDonations}
                  centerLocation={userLocation}
                  radiusKm={searchRadius}
                  onSelectDonation={handleOpenDetail}
                  height="500px"
                />
              ) : filteredDonations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE7]">
                  <Utensils className="w-12 h-12 text-[#8E9F96] mx-auto mb-2 opacity-50" />
                  <h4 className="font-bold text-base text-[#25312B]">No surplus listings found</h4>
                  <p className="text-xs text-[#53645B] mt-1 max-w-sm mx-auto">
                    Try loosening your dietary filters or expanding your geographic radius.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'list'
                      ? 'space-y-3'
                      : 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  }
                >
                  {filteredDonations.map((donation) => (
                    <DonationCard
                      key={donation.id}
                      donation={donation}
                      layout={viewMode}
                      onViewDetails={handleOpenDetail}
                      onClaim={handleOpenClaim}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onClaim={handleOpenClaim}
      />

      <ClaimModal
        donation={claimDonationTarget}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={() => setActiveTab('claimed')}
      />
    </div>
  );
};
