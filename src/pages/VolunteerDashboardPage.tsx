import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Donation } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Sidebar, SidebarItem } from '../components/common/Sidebar';
import { DeliveryWorkflowModal } from '../components/donations/DeliveryWorkflowModal';
import { DonationDetailModal } from '../components/donations/DonationDetailModal';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationPicker } from '../components/map/LocationPicker';
import { calculateDistance, formatDistance } from '../utils/haversine';
import {
  Bike,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  LogIn,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const VolunteerDashboardPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { donations, userLocation, searchRadius, isLoading, error, refreshData } = useData();

  const [activeTab, setActiveTab] = useState<string>('available_tasks');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [workflowTarget, setWorkflowTarget] = useState<Donation | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // Available tasks: donations Claimed by an NGO and waiting for a courier
  const availableTasks = useMemo(() => {
    return donations.filter((d) => d.status === 'Claimed');
  }, [donations]);

  // My Active Tasks: assignedVolunteerId matches authenticated user and in progress
  const myActiveTasks = useMemo(() => {
    if (!currentUser?.id) return [];
    return donations.filter(
      (d) =>
        d.assignedVolunteerId === currentUser.id &&
        (d.status === 'Pickup Scheduled' || d.status === 'Picked Up')
    );
  }, [donations, currentUser?.id]);

  // My Completed Tasks: assignedVolunteerId matches authenticated user and status === Completed
  const myCompletedTasks = useMemo(() => {
    if (!currentUser?.id) return [];
    return donations.filter(
      (d) => d.assignedVolunteerId === currentUser.id && d.status === 'Completed'
    );
  }, [donations, currentUser?.id]);

  // Exact real-time calculations from actual verified records
  const totalCompletedDeliveries = myCompletedTasks.length;

  const totalMealsTransported = useMemo(() => {
    return myCompletedTasks.reduce(
      (acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue || 0),
      0
    );
  }, [myCompletedTasks]);

  // Transport hours calculated from real recorded timestamps (deliveredAt - pickedUpAt / acceptedAt)
  const totalTransportHours = useMemo(() => {
    return myCompletedTasks.reduce((acc, d) => {
      if (d.deliveredAt && (d.pickedUpAt || d.acceptedAt)) {
        const start = new Date(d.pickedUpAt || d.acceptedAt!).getTime();
        const end = new Date(d.deliveredAt).getTime();
        const diffHours = (end - start) / (1000 * 60 * 60);
        return acc + (diffHours > 0 ? diffHours : 0);
      }
      return acc;
    }, 0);
  }, [myCompletedTasks]);

  // On-time reliability formula: on-time deliveries / eligible completed deliveries * 100
  const reliability = useMemo(() => {
    if (totalCompletedDeliveries === 0) {
      return { score: 'N/A', label: 'No deliveries yet' };
    }
    let onTimeCount = 0;
    let trackedCount = 0;
    for (const d of myCompletedTasks) {
      if (d.deliveredAt && d.expiryDateTime) {
        trackedCount++;
        if (new Date(d.deliveredAt).getTime() <= new Date(d.expiryDateTime).getTime()) {
          onTimeCount++;
        }
      }
    }
    if (trackedCount === 0) {
      return { score: '100%', label: '100% On-Time' };
    }
    const pct = Math.round((onTimeCount / trackedCount) * 100);
    return { score: `${pct}%`, label: `${pct}% On-Time Record` };
  }, [myCompletedTasks, totalCompletedDeliveries]);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'available_tasks',
      label: 'Available Nearby Tasks',
      icon: Clock,
      badge: availableTasks.length,
      badgeColor: 'green',
    },
    {
      id: 'active_tasks',
      label: 'My In-Progress Trips',
      icon: Truck,
      badge: myActiveTasks.length,
      badgeColor: 'blue',
    },
    {
      id: 'completed_tasks',
      label: 'Completed Deliveries',
      icon: CheckCircle2,
      badge: totalCompletedDeliveries,
    },
  ];

  const currentList =
    activeTab === 'available_tasks'
      ? availableTasks
      : activeTab === 'active_tasks'
      ? myActiveTasks
      : myCompletedTasks;

  const handleOpenWorkflow = (d: Donation) => {
    setWorkflowTarget(d);
    setIsWorkflowModalOpen(true);
  };

  const handleOpenDetail = (d: Donation) => {
    setSelectedDonation(d);
    setIsDetailModalOpen(true);
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#EBF5ED] text-[#245C45] flex items-center justify-center mx-auto">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
          Volunteer Courier Dispatch Hub
        </h2>
        <p className="text-sm text-[#53645B] max-w-md mx-auto leading-relaxed">
          Please sign in to view your assigned deliveries, accept pending community dispatches, and track verified transit hours.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#245C45] hover:bg-[#1B4534] text-white text-sm font-bold rounded-2xl transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Courier Portal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role Notice if logged in with non-volunteer account */}
      {currentUser.role !== 'volunteer' && currentUser.role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              You are signed in as a <strong>{currentUser.role}</strong> ({currentUser.name}).
              Volunteer delivery assignments and courier metrics reflect volunteer accounts.
            </span>
          </div>
          <Link
            to={currentUser.role === 'donor' ? '/donate' : '/find-food'}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold shrink-0 hover:bg-blue-700"
          >
            Go to My Portal
          </Link>
        </div>
      )}

      {/* Volunteer Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#245C45]/20 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#EBF5ED] text-[#245C45] flex items-center justify-center font-bold text-xl shrink-0">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Admin / Dispatch Mode' : 'Volunteer Courier'}
              </span>
              {currentUser.isVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Courier
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
              {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#53645B] mt-1">
              {currentUser.organization || 'Community Transport Volunteer'} · Member since {currentUser.joinedDate?.slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshData()}
            className="p-2.5 rounded-2xl border border-[#E5EAE7] hover:bg-[#F8F8F2] text-[#53645B] transition-colors"
            title="Refresh from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="bg-[#F8F8F2] px-4 py-2.5 rounded-2xl border border-[#E5EAE7] text-right">
            <span className="text-[10px] text-[#8E9F96] uppercase font-bold">Reliability Score</span>
            <p className="text-base font-black text-[#245C45]">{reliability.label}</p>
          </div>
        </div>
      </div>

      {/* Stats - purely dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Deliveries Completed"
          value={totalCompletedDeliveries}
          subtitle={totalCompletedDeliveries > 0 ? "Direct community drop-offs" : "No completed deliveries yet"}
          icon={CheckCircle2}
          accentColor="primary"
          trend={totalCompletedDeliveries > 0 ? `${totalCompletedDeliveries} verified records` : undefined}
        />
        <StatCard
          label="Meals Transported"
          value={totalMealsTransported}
          subtitle={totalMealsTransported > 0 ? "Wholesome meals delivered" : "0 meals recorded"}
          icon={Truck}
          accentColor="secondary"
        />
        <StatCard
          label="Volunteer Transport Hours"
          value={totalTransportHours > 0 ? `${totalTransportHours.toFixed(1)} hrs` : '0 hrs'}
          subtitle={totalTransportHours > 0 ? "Verified transit duration" : "Calculated from completed dispatches"}
          icon={Bike}
          accentColor="accent"
        />
      </div>

      {/* Location Picker */}
      <LocationPicker showRadiusSelector={true} />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs">
          <span>Failed to load server data: {error}</span>
          <button onClick={() => refreshData()} className="font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <Sidebar
          title="Courier Hub"
          subtitle="Task management"
          items={sidebarItems}
          activeId={activeTab}
          onSelect={setActiveTab}
        />

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Dispatch Map */}
          <InteractiveMap
            donations={currentList}
            centerLocation={userLocation}
            radiusKm={searchRadius}
            onSelectDonation={handleOpenDetail}
            height="320px"
          />

          {/* Tasks List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#25312B] font-heading">
                {sidebarItems.find((i) => i.id === activeTab)?.label} ({currentList.length})
              </h3>
              <span className="text-xs text-[#8E9F96]">
                Radius: {searchRadius} km around {userLocation.name}
              </span>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE7]">
                <div className="w-8 h-8 rounded-full border-4 border-[#245C45]/20 border-t-[#245C45] animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#53645B] font-bold">Loading tasks from database...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E5EAE7]">
                <Bike className="w-12 h-12 text-[#8E9F96] mx-auto mb-2 opacity-50" />
                <h4 className="font-bold text-base text-[#25312B]">
                  {activeTab === 'available_tasks'
                    ? 'No pending courier tasks found'
                    : activeTab === 'active_tasks'
                    ? 'No active trips in progress'
                    : 'No completed deliveries recorded yet'}
                </h4>
                <p className="text-xs text-[#53645B] mt-1 max-w-md mx-auto">
                  {activeTab === 'available_tasks'
                    ? 'When verified recipient NGOs claim food donations, dispatch courier pickup requests will appear here.'
                    : activeTab === 'active_tasks'
                    ? 'Check "Available Nearby Tasks" to accept an upcoming food rescue transport.'
                    : 'Once you pick up and deliver an assigned batch, your delivery record and hours will be logged here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentList.map((donation) => {
                  const dist = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    donation.latitude,
                    donation.longitude
                  );

                  return (
                    <div
                      key={donation.id}
                      className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <img
                          src={donation.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
                          alt={donation.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {donation.status}
                            </span>
                            <span className="text-xs text-[#8E9F96] font-mono">#{donation.id.slice(0, 8)}</span>
                            <span className="text-xs font-semibold text-[#245C45] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {formatDistance(dist)} away
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-[#25312B] truncate">
                            {donation.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#53645B]">
                            <span>
                              From: <strong className="text-[#25312B]">{donation.pickupAddress}</strong>
                            </span>
                            <span>
                              To: <strong className="text-[#245C45]">{donation.claimedByNgoName || 'Verified Recipient NGO'}</strong>
                            </span>
                            <span>
                              Payload: <strong>{donation.quantityValue} {donation.quantityUnit}</strong> (~{donation.estimatedPeopleServed} people)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#F8F8F2] shrink-0">
                        <button
                          onClick={() => handleOpenDetail(donation)}
                          className="px-3.5 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => handleOpenWorkflow(donation)}
                          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                            donation.status === 'Claimed'
                              ? 'bg-[#245C45] hover:bg-[#1B4534] text-white'
                              : donation.status === 'Pickup Scheduled'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : donation.status === 'Picked Up'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                          <span>
                            {donation.status === 'Claimed'
                              ? 'Accept Task'
                              : donation.status === 'Pickup Scheduled'
                              ? 'Start Trip / Pickup'
                              : donation.status === 'Picked Up'
                              ? 'Verify Final Delivery'
                              : 'View Trip Details'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeliveryWorkflowModal
        donation={workflowTarget}
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onVolunteerAction={handleOpenWorkflow}
      />
    </div>
  );
};
