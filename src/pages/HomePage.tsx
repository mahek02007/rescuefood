import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Donation } from '../types';
import { StatCard } from '../components/common/StatCard';
import { LocationPicker } from '../components/map/LocationPicker';
import { DonationCard } from '../components/donations/DonationCard';
import { FoodWasteCalculator } from '../components/common/FoodWasteCalculator';
import { DonationFormModal } from '../components/donations/DonationFormModal';
import { DonationDetailModal } from '../components/donations/DonationDetailModal';
import { ClaimModal } from '../components/donations/ClaimModal';
import { DeliveryWorkflowModal } from '../components/donations/DeliveryWorkflowModal';
import { TESTIMONIALS, HOW_IT_WORKS_STEPS } from '../data/mockData';
import { calculateDistance, formatDistance } from '../utils/haversine';
import {
  Utensils,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { donations, impactMetrics, userLocation, searchRadius } = useData();

  // Modals state
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [claimDonationTarget, setClaimDonationTarget] = useState<Donation | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [volunteerDonationTarget, setVolunteerDonationTarget] = useState<Donation | null>(null);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);

  // Filter nearby donations by user location and radius
  const nearbyDonations = donations
    .filter((d) => d.status === 'Available')
    .map((d) => ({
      donation: d,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        d.latitude,
        d.longitude
      ),
    }))
    .filter((item) => item.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  const handleOpenDetail = (d: Donation) => {
    setSelectedDonation(d);
    setIsDetailModalOpen(true);
  };

  const handleOpenClaim = (d: Donation) => {
    setClaimDonationTarget(d);
    setIsClaimModalOpen(true);
  };

  const handleOpenVolunteer = (d: Donation) => {
    setVolunteerDonationTarget(d);
    setIsVolunteerModalOpen(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        {/* Soft decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#6FAF78]/10 via-[#245C45]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5ED] border border-[#6FAF78]/40 text-[#245C45] text-xs font-bold uppercase tracking-wider animate-in fade-in">
              <Sparkles className="w-4 h-4 text-[#F4A261]" />
              Zero Food Waste · Maximum Community Impact
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#25312B] tracking-tight font-heading leading-tight sm:leading-none">
              Share More. <br className="hidden sm:inline" />
              <span className="text-[#245C45]">Waste Less.</span>
            </h1>

            <p className="text-base sm:text-xl text-[#53645B] max-w-2xl mx-auto leading-relaxed">
              Every surplus meal is an opportunity to make a difference. Connect commercial banquet kitchens, restaurants, and grocery surplus directly with neighborhood pantries.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsDonationFormOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#245C45] hover:bg-[#1B4534] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#245C45]/25 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Donate Surplus Food</span>
                <ArrowRight className="w-4 h-4 text-[#6FAF78]" />
              </button>

              <Link
                to="/find-food"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#F8F8F2] text-[#25312B] font-bold rounded-2xl border border-[#E5EAE7] transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Find Food Near Me</span>
                <ChevronRight className="w-4 h-4 text-[#8E9F96]" />
              </Link>
            </div>
          </div>

          {/* Location search bar with GPS */}
          <div className="max-w-4xl mx-auto mt-10">
            <LocationPicker showRadiusSelector={true} />
          </div>
        </div>
      </section>

      {/* 2. FOUR IMPACT CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Total Meals Rescued"
            value={impactMetrics.totalMealsRescued}
            subtitle="Diverted from urban landfills"
            icon={Utensils}
            trend={impactMetrics.totalMealsRescued > 0 ? "Live verified total" : undefined}
            accentColor="primary"
          />
          <StatCard
            label="Active Food Donors"
            value={impactMetrics.activeDonors}
            subtitle="Hotels, bistros & caterers"
            icon={Building2}
            trend={impactMetrics.activeDonors > 0 ? `${impactMetrics.activeDonors} active partners` : undefined}
            accentColor="secondary"
          />
          <StatCard
            label="Partner NGOs"
            value={impactMetrics.partnerNgos}
            subtitle="Verified community kitchens"
            icon={HeartHandshake}
            trend="Accredited charities"
            accentColor="accent"
          />
          <StatCard
            label="Successful Deliveries"
            value={impactMetrics.successfulDeliveries}
            subtitle="Completed safe dispatches"
            icon={CheckCircle2}
            trend={impactMetrics.successfulDeliveries > 0 ? `${impactMetrics.successfulDeliveries} drop-offs` : undefined}
            accentColor="blue"
          />
        </div>
      </section>

      {/* 3. NEARBY SURPLUS FOOD FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#245C45] font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#245C45] animate-ping" />
              Live Radius Matching
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#25312B] font-heading">
              Available Surplus Meals Nearby
            </h2>
            <p className="text-xs sm:text-sm text-[#53645B] mt-1">
              Surplus provisions within <strong>{searchRadius} km</strong> of {userLocation.name}
            </p>
          </div>

          <Link
            to="/find-food"
            className="text-xs sm:text-sm font-bold text-[#245C45] hover:text-[#1B4534] flex items-center gap-1 hover:underline shrink-0"
          >
            <span>Explore All Surplus Listings ({donations.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {nearbyDonations.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E5EAE7]">
            <div className="w-16 h-16 rounded-full bg-[#EBF5ED] text-[#245C45] flex items-center justify-center mx-auto mb-3">
              <Utensils className="w-8 h-8 opacity-70" />
            </div>
            <h4 className="text-lg font-bold text-[#25312B]">No available donations within {searchRadius} km</h4>
            <p className="text-xs sm:text-sm text-[#53645B] max-w-md mx-auto mt-1 mb-4">
              Try expanding your geographic search radius or browse our regional metro listings.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDonationFormOpen(true)}
                className="px-5 py-2.5 bg-[#245C45] text-white text-xs font-bold rounded-xl"
              >
                Post First Donation Here
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyDonations.map(({ donation }) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                onViewDetails={handleOpenDetail}
                onClaim={handleOpenClaim}
                onVolunteerAction={handleOpenVolunteer}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW FOODRESCUE WORKS */}
      <section className="bg-white py-16 border-y border-[#E5EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#245C45] uppercase tracking-wider">
              Transparent Redistribution Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading mt-1">
              How FoodRescue Works
            </h2>
            <p className="text-xs sm:text-sm text-[#53645B] mt-2">
              From surplus kitchen trays to community bellies in under 90 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.step}
                className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] relative hover:shadow-md transition-shadow"
              >
                <div className="text-3xl font-black text-[#6FAF78]/40 font-mono mb-2">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-[#25312B] mb-2 font-heading">
                  {step.title}
                </h3>
                <p className="text-xs text-[#53645B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FOOD WASTE ENVIRONMENTAL IMPACT CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FoodWasteCalculator />
      </section>

      {/* 6. FEATURED VERIFIED NGOS & COMMUNITY KITCHENS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#25312B] font-heading">
              Featured Verified Partners
            </h2>
            <p className="text-xs text-[#53645B] mt-0.5">
              Accredited soup kitchens &amp; distribution centers active this week
            </p>
          </div>
          <Link to="/find-food" className="text-xs font-bold text-[#245C45] hover:underline">
            View Partner Network →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5ED] text-[#245C45]">
                  Soup Kitchen
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 501(c)(3) Verified
                </span>
              </div>
              <h4 className="font-bold text-base text-[#25312B]">Hope Hearth Community Kitchen</h4>
              <p className="text-xs text-[#53645B] mt-1">
                Serves over 250 warm nutritious lunches daily to families and unhoused individuals.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F8F8F2] flex items-center justify-between text-xs text-[#8E9F96]">
              <span>East Valley Hub</span>
              <strong className="text-[#245C45]">12,400 meals served</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Food Bank
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Facility
                </span>
              </div>
              <h4 className="font-bold text-base text-[#25312B]">CareForAll Food Pantry</h4>
              <p className="text-xs text-[#53645B] mt-1">
                Equipped with industrial walk-in refrigeration for bulk grocery and produce redistribution.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F8F8F2] flex items-center justify-between text-xs text-[#8E9F96]">
              <span>Central District</span>
              <strong className="text-[#245C45]">8,900 meals served</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                  Youth Refuge
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Program
                </span>
              </div>
              <h4 className="font-bold text-base text-[#25312B]">Sunlight Youth Shelter</h4>
              <p className="text-xs text-[#53645B] mt-1">
                Provides safe accommodation and wholesome evening meals for vulnerable urban youth.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F8F8F2] flex items-center justify-between text-xs text-[#8E9F96]">
              <span>West Bay Park</span>
              <strong className="text-[#245C45]">4,250 meals served</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UPCOMING VOLUNTEER OPPORTUNITIES BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#245C45] to-[#1B4534] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-[#F4A261] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              Community Courier Force
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Have 30 minutes? Help transport meals today.
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Volunteers are the vital link that bridges donors with community kitchens. Accept tasks on your own schedule, receive turn-by-turn routes, and confirm drop-offs.
            </p>
          </div>

          <Link
            to="/volunteer"
            className="px-6 py-3.5 bg-[#F4A261] hover:bg-[#e76f51] text-[#25312B] font-bold text-sm rounded-2xl transition-all shadow-md shrink-0 active:scale-95"
          >
            Explore Pickup Tasks Near You
          </Link>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#245C45] uppercase tracking-wider">
            Voices of Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading mt-1">
            Loved by Donors, Chefs &amp; Volunteers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="bg-white rounded-2xl p-6 border border-[#E5EAE7] shadow-xs flex flex-col justify-between"
            >
              <p className="text-xs text-[#53645B] leading-relaxed italic mb-6">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[#F8F8F2]">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#6FAF78]/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#25312B]">{t.author}</h4>
                  <p className="text-[10px] text-[#8E9F96]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Dialogs */}
      <DonationFormModal
        isOpen={isDonationFormOpen}
        onClose={() => setIsDonationFormOpen(false)}
        onSuccess={(id) => {
          const created = donations.find((d) => d.id === id);
          if (created) handleOpenDetail(created);
        }}
      />

      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onClaim={handleOpenClaim}
        onVolunteerAction={handleOpenVolunteer}
      />

      <ClaimModal
        donation={claimDonationTarget}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />

      <DeliveryWorkflowModal
        donation={volunteerDonationTarget}
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
      />
    </div>
  );
};
