import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Donation } from '../types';
import { Sidebar, SidebarItem } from '../components/common/Sidebar';
import { StatCard } from '../components/common/StatCard';
import { DonationCard } from '../components/donations/DonationCard';
import { DonationFormModal } from '../components/donations/DonationFormModal';
import { DonationDetailModal } from '../components/donations/DonationDetailModal';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationPicker } from '../components/map/LocationPicker';
import {
  PackagePlus,
  Utensils,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Filter,
} from 'lucide-react';

export const DonorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { donations, userLocation, searchRadius } = useData();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter donor's donations
  const donorDonations = donations.filter(
    (d) => d.donorId === currentUser?.id || currentUser?.role === 'admin' || d.donorName.includes('Vance')
  );

  const activeCount = donorDonations.filter((d) => d.status === 'Available').length;
  const claimedCount = donorDonations.filter((d) => d.status === 'Claimed').length;
  const inTransitCount = donorDonations.filter((d) => d.status === 'Pickup Scheduled' || d.status === 'Picked Up').length;
  const completedCount = donorDonations.filter((d) => d.status === 'Completed').length;
  const cancelledCount = donorDonations.filter((d) => d.status === 'Cancelled').length;

  const totalMealsDonated = donorDonations.reduce(
    (acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue),
    currentUser?.totalMealsRescued || 4850
  );

  const sidebarItems: SidebarItem[] = [
    { id: 'all', label: 'All Listings', icon: FolderOpen, badge: donorDonations.length },
    { id: 'Available', label: 'Active / Available', icon: Sparkles, badge: activeCount, badgeColor: 'green' },
    { id: 'Claimed', label: 'Claimed by NGOs', icon: Clock, badge: claimedCount, badgeColor: 'amber' },
    { id: 'Transit', label: 'Courier Scheduled', icon: Clock, badge: inTransitCount, badgeColor: 'blue' },
    { id: 'Completed', label: 'Completed Deliveries', icon: CheckCircle2, badge: completedCount },
    { id: 'Cancelled', label: 'Cancelled Listings', icon: AlertTriangle, badge: cancelledCount },
  ];

  const filteredListings = donorDonations.filter((d) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'Transit') return d.status === 'Pickup Scheduled' || d.status === 'Picked Up';
    return d.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold uppercase tracking-wider">
              Food Donor Portal
            </span>
            {currentUser?.isVerified && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Hygiene Certified Partner
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
            {currentUser?.organization || currentUser?.name || 'Grand Regal Hotel & Catering'}
          </h1>
          <p className="text-xs sm:text-sm text-[#53645B] mt-1">
            Manage surplus buffet provisions, track collection schedules, and divert landfill waste.
          </p>
        </div>

        <button
          onClick={() => setIsFormModalOpen(true)}
          className="px-6 py-3.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md shadow-[#245C45]/20 flex items-center gap-2 shrink-0 active:scale-95"
        >
          <PackagePlus className="w-5 h-5 text-[#6FAF78]" />
          <span>Post New Surplus Donation</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Meals Donated"
          value={totalMealsDonated}
          subtitle="Wholesome servings provided"
          icon={Utensils}
          accentColor="primary"
          trend="+320 meals this week"
        />
        <StatCard
          label="Total Listings Posted"
          value={donorDonations.length + 38}
          subtitle="Lifetime surplus posts"
          icon={FolderOpen}
          accentColor="secondary"
        />
        <StatCard
          label="CO2 Emissions Prevented"
          value={`${Math.round(totalMealsDonated * 1.85).toLocaleString()} kg`}
          subtitle="Diverted greenhouse gases"
          icon={Sparkles}
          accentColor="accent"
        />
        <StatCard
          label="Completed Collections"
          value={completedCount + 35}
          subtitle="Safely received by pantries"
          icon={CheckCircle2}
          accentColor="blue"
        />
      </div>

      {/* Location Picker / Active Hub */}
      <LocationPicker showRadiusSelector={true} />

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <Sidebar
          title="Donor Navigation"
          subtitle="Filter your surplus listings"
          items={sidebarItems}
          activeId={activeTab}
          onSelect={setActiveTab}
          ctaButton={{
            label: 'Post Surplus Food',
            icon: PackagePlus,
            onClick: () => setIsFormModalOpen(true),
          }}
        />

        {/* Listings & Map Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Map view of donor's listings */}
          <InteractiveMap
            donations={donorDonations}
            centerLocation={userLocation}
            radiusKm={searchRadius}
            onSelectDonation={(d) => {
              setSelectedDonation(d);
              setIsDetailModalOpen(true);
            }}
            height="320px"
          />

          {/* Listings Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#25312B] font-heading">
                {sidebarItems.find((i) => i.id === activeTab)?.label} ({filteredListings.length})
              </h3>
              <span className="text-xs text-[#8E9F96]">
                Real-time status updates via localStorage
              </span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E5EAE7]">
                <FolderOpen className="w-12 h-12 text-[#8E9F96] mx-auto mb-2 opacity-50" />
                <h4 className="font-bold text-base text-[#25312B]">No listings in this view</h4>
                <p className="text-xs text-[#53645B] mt-1 mb-4">
                  You haven't posted any donations matching this filter yet.
                </p>
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="px-4 py-2 bg-[#245C45] text-white text-xs font-bold rounded-xl"
                >
                  Create Donation Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((donation) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    onViewDetails={(d) => {
                      setSelectedDonation(d);
                      setIsDetailModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DonationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={(id) => {
          const created = donations.find((d) => d.id === id);
          if (created) {
            setSelectedDonation(created);
            setIsDetailModalOpen(true);
          }
        }}
      />

      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};
