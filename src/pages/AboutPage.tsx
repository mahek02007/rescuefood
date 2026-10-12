import React from 'react';
import { useData } from '../context/DataContext';
import { FoodWasteCalculator } from '../components/common/FoodWasteCalculator';
import {
  Leaf,
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
  Droplet,
  Wind,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { impactMetrics } = useData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          Our Mission &amp; Purpose
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#25312B] font-heading tracking-tight">
          Eliminating Urban Food Waste.<br />
          <span className="text-[#245C45]">Nourishing Every Neighborhood.</span>
        </h1>
        <p className="text-base text-[#53645B] leading-relaxed">
          Over one-third of all food produced globally is never eaten, while millions experience food insecurity daily. FoodRescue uses intelligent localized radius matching to bridge surplus banquet and grocery provisions to community soup kitchens before they expire.
        </p>
      </div>

      {/* The Global Crisis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#25312B] font-heading">1.3 Billion Tons</h3>
          <p className="text-xs text-[#53645B] leading-relaxed">
            Of edible food is wasted across the globe each year, while 800+ million people face chronic hunger. Food is discarded primarily due to cosmetic standards or banquet over-prep.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wind className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#25312B] font-heading">8-10% of Global GHG</h3>
          <p className="text-xs text-[#53645B] leading-relaxed">
            Decomposing organic food in landfills produces methane, a greenhouse gas 28 times more potent than carbon dioxide. Eliminating food waste is a premier climate solution.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF5ED] text-[#245C45] flex items-center justify-center">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#25312B] font-heading">25% Fresh Water Footprint</h3>
          <p className="text-xs text-[#53645B] leading-relaxed">
            Wasted food squanders a quarter of global agricultural freshwater, alongside labor, fertilizer, fuel, and packaging. Saving meals conserves vital planetary resources.
          </p>
        </div>
      </div>

      {/* Interactive Calculator */}
      <FoodWasteCalculator />

      {/* Platform Architecture & Stakeholders */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5EAE7] shadow-xs space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#245C45] uppercase tracking-wider">
            Who Can Participate
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading mt-1">
            An Open Ecosystem for Social Good
          </h2>
          <p className="text-xs sm:text-sm text-[#53645B] mt-2">
            Every link in the food lifecycle is represented with tailored workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] space-y-2">
            <div className="flex items-center gap-2 text-[#245C45] font-bold text-sm">
              <Building2 className="w-5 h-5" />
              <span>Commercial Food Donors</span>
            </div>
            <p className="text-xs text-[#53645B] leading-relaxed">
              Hotels, corporate banquet caterers, bakeries, organic grocers, and event centers with unserved, temperature-controlled surplus provisions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] space-y-2">
            <div className="flex items-center gap-2 text-[#245C45] font-bold text-sm">
              <HeartHandshake className="w-5 h-5" />
              <span>Accredited Recipient NGOs</span>
            </div>
            <p className="text-xs text-[#53645B] leading-relaxed">
              Registered 501(c)(3) charities, soup kitchens, transitional shelters, and food pantries with verified food-safe handling &amp; storage capabilities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] space-y-2">
            <div className="flex items-center gap-2 text-[#245C45] font-bold text-sm">
              <Users className="w-5 h-5" />
              <span>Volunteer Couriers</span>
            </div>
            <p className="text-xs text-[#53645B] leading-relaxed">
              Local community volunteers using bicycles, EVs, or cars to bridge surplus packages directly to pantries on flexible, on-demand schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Food Safety & Accountability */}
      <div className="bg-[#EBF5ED] rounded-3xl p-8 sm:p-12 border border-[#6FAF78]/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#245C45] text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#6FAF78]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#245C45] font-heading">
              Rigorous Food Safety Standards
            </h3>
            <p className="text-xs text-[#53645B]">
              Ensuring dignity, health, and compliance through strict cold-chain verification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-[#6FAF78]/30">
            <span className="font-bold text-[#25312B] block mb-1">1. Hygiene Verification</span>
            <p className="text-[#53645B]">Donors certify safe food handling in licensed commercial sanitary facilities.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#6FAF78]/30">
            <span className="font-bold text-[#25312B] block mb-1">2. Cold-Chain Monitoring</span>
            <p className="text-[#53645B]">Hot foods held &gt;60°C; refrigerated items maintained &lt;4°C continuously.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#6FAF78]/30">
            <span className="font-bold text-[#25312B] block mb-1">3. Food-Grade Packaging</span>
            <p className="text-[#53645B]">Sealed, tamper-evident containers with preparation timestamps and allergen disclosures.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#6FAF78]/30">
            <span className="font-bold text-[#25312B] block mb-1">4. Good Samaritan Act</span>
            <p className="text-[#53645B]">Protected under Bill Emerson Good Samaritan Food Donation statutes for verified donations.</p>
          </div>
        </div>
      </div>

      {/* Demo statistics note */}
      <div className="text-center text-xs text-[#8E9F96] pt-4">
        Notice: All platform data, metrics, and donor credentials presented on this website are illustrative simulated demo records.
      </div>
    </div>
  );
};
