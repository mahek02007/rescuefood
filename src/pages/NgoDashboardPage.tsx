import React, { useState, useMemo } from 'react';
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
  MapPin,
  Utensils,
  FileCheck,
  RefreshCw,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

export const NgoDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { donations, userLocation, searchRadius, isLoading, error, refreshData } = useData();

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

  // Real NGO claimed list matching authenticated user's ID
  const claimedByMe = useMemo(() => {
    if (!currentUser?.id) return [];
    return donations.filter(
      (d) => d.claimedByNgoId === currentUser.id || currentUser.role === 'admin'
    );
  }, [donations, currentUser?.id, currentUser?.role]);

  const availableDonations = useMemo(() => {
    return donations.filter((d) => d.status === 'Available');
  }, [donations]);

  const upcomingPickups = useMemo(() => {
    return claimedByMe.filter((d) => d.status === 'Pickup Scheduled' || d.status === 'Picked Up');
  }, [claimedByMe]);

  const completedDonations = useMemo(() => {
    return claimedByMe.filter((d) => d.status === 'Completed');
  }, [claimedByMe]);

  const totalClaimedMeals = useMemo(() => {
    return claimedByMe.reduce(
      (acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue || 0),
      0
    );
  }, [claimedByMe]);

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
            {currentUser?.isVerified ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Recipient
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Verification {currentUser?.verificationStatus || 'Pending'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
            {currentUser?.organization || currentUser?.name || 'Community Recipient Kitchen'}
          </h1>
          <p className="text-xs sm:text-sm text-[#53645B] mt-1">
            Discover and claim safe banquet and grocery surplus within your distribution radius.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshData()}
            className="p-3 bg-[#F8F8F2] hover:bg-[#E5EAE7] rounded-2xl text-[#53645B] transition-colors border border-[#E5EAE7]"
            title="Refresh from server"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-right hidden sm:block bg-[#F8F8F2] px-4 py-2.5 rounded-2xl border border-[#E5EAE7]">
            <span className="text-[10px] text-[#8E9F96] uppercase font-bold">Total Claimed Servings</span>
            <p className="text-sm font-bold text-[#245C45]">
              {totalClaimedMeals.toLocaleString()} meals claimed
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs">
          <span>Failed to load server listings: {error}</span>
          <button onClick={() => refreshData()} className="font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

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
            /* NGO Profile & Verification Card - Bound strictly to currentUser */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] space-y-6">
              <div className="flex items-center justify-between border-b border-[#F8F8F2] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#25312B] font-heading">
                    Organization Profile &amp; Verification
                  </h3>
                  <p className="text-xs text-[#53645B] mt-0.5">
                    Verified organization credentials and food handling profile
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    currentUser?.isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {currentUser?.isVerified ? 'Verified Partner' : 'Verification Under Review'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Nonprofit Name</span>
                  <p className="font-bold text-[#25312B] text-sm mt-0.5">
                    {currentUser?.organization || 'Organization Name Not Provided'}
                  </p>
                  <p className="text-[#53645B] mt-1">Role: Verified Recipient Organization</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Primary Contact</span>
                  <p className="font-bold text-[#25312B] text-sm mt-0.5">{currentUser?.name}</p>
                  <p className="text-[#53645B] mt-1">
                    {currentUser?.email} · {currentUser?.phone}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Facility Address</span>
                  <p className="font-bold text-[#25312B] text-sm mt-0.5">{currentUser?.address}</p>
                  <p className="text-[#53645B] mt-1">
                    {currentUser?.area}, {currentUser?.city} - {currentUser?.pincode}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7]">
                  <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Claimed Food Statistics</span>
                  <p className="font-bold text-[#245C45] text-sm mt-0.5">
                    {claimedByMe.length} Total Batches Claimed
                  </p>
                  <p className="text-[#53645B] mt-1">
                    {completedDonations.length} Completed · {upcomingPickups.length} In Transit
                  </p>
                </div>
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
              {isLoading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE7]">
                  <div className="w-8 h-8 rounded-full border-4 border-[#245C45]/20 border-t-[#245C45] animate-spin mx-auto mb-3" />
                  <p className="text-xs text-[#53645B] font-bold">Loading surplus listings from database...</p>
                </div>
              ) : viewMode === 'map' ? (
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
                  <h4 className="font-bold text-base text-[#25312B]">
                    {activeTab === 'available'
                      ? 'No available surplus food found'
                      : activeTab === 'claimed'
                      ? 'No donations claimed yet'
                      : activeTab === 'upcoming'
                      ? 'No upcoming pickups scheduled'
                      : 'No completed deliveries on record'}
                  </h4>
                  <p className="text-xs text-[#53645B] mt-1 max-w-sm mx-auto">
                    {activeTab === 'available'
                      ? 'Try loosening your dietary filters or expanding your geographic radius.'
                      : 'Browse the Available Surplus Food tab to claim food for your community.'}
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredDonations.map((donation) => (
                    <DonationCard
                      key={donation.id}
                      donation={donation}
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

      {/* Claim Modal */}
      <ClaimModal
        donation={claimDonationTarget}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={() => {
          setIsClaimModalOpen(false);
          refreshData();
        }}
      />

      {/* Detail Modal */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onClaim={handleOpenClaim}
      />
    </div>
  );
};
