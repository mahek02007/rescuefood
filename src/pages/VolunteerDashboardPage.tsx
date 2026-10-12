import React, { useState } from 'react';
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
  ExternalLink,
  Phone,
  ShieldCheck,
  ChevronRight,
  Flame,
  Award,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const VolunteerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { donations, userLocation, searchRadius } = useData();

  const [activeTab, setActiveTab] = useState<string>('available_tasks');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [workflowTarget, setWorkflowTarget] = useState<Donation | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // Available tasks: donations that are Claimed by an NGO and waiting for a volunteer courier
  const availableTasks = donations.filter((d) => d.status === 'Claimed');

  // My Active Tasks: where assignedVolunteerId === currentUser.id and in progress
  const myActiveTasks = donations.filter(
    (d) =>
      (d.assignedVolunteerId === currentUser?.id || d.assignedVolunteerName?.includes('Alex')) &&
      (d.status === 'Pickup Scheduled' || d.status === 'Picked Up')
  );

  // Completed Tasks:
  const myCompletedTasks = donations.filter(
    (d) =>
      (d.assignedVolunteerId === currentUser?.id || d.assignedVolunteerName?.includes('Alex')) &&
      d.status === 'Completed'
  );

  const totalMealsTransported = myCompletedTasks.reduce(
    (acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue),
    currentUser?.totalMealsRescued || 3920
  );

  const sidebarItems: SidebarItem[] = [
    { id: 'available_tasks', label: 'Available Nearby Tasks', icon: Clock, badge: availableTasks.length, badgeColor: 'green' },
    { id: 'active_tasks', label: 'My In-Progress Trips', icon: Truck, badge: myActiveTasks.length, badgeColor: 'blue' },
    { id: 'completed_tasks', label: 'Completed Deliveries', icon: CheckCircle2, badge: myCompletedTasks.length },
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Volunteer Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold uppercase tracking-wider">
              Volunteer Courier Dispatch
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              <Bike className="w-3.5 h-3.5" /> Eco-Courier Certified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
            {currentUser?.name || 'Alex Rivera (Hero Courier)'}
          </h1>
          <p className="text-xs sm:text-sm text-[#53645B] mt-1">
            Pick up surplus batches from donors and safely deliver them to partner community pantries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8F8F2] px-4 py-2.5 rounded-2xl border border-[#E5EAE7] text-right">
            <span className="text-[10px] text-[#8E9F96] uppercase font-bold">Reliability Score</span>
            <p className="text-base font-black text-[#245C45]">99.8% On-Time</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Deliveries Completed"
          value={myCompletedTasks.length + 38}
          subtitle="Direct community drop-offs"
          icon={CheckCircle2}
          accentColor="primary"
          trend="+5 this week"
        />
        <StatCard
          label="Meals Transported"
          value={totalMealsTransported}
          subtitle="Warm meals delivered safely"
          icon={Truck}
          accentColor="secondary"
        />
        <StatCard
          label="Volunteer Transport Hours"
          value="46.5 hrs"
          subtitle="Urban micro-mobility impact"
          icon={Bike}
          accentColor="accent"
        />
      </div>

      {/* Location Picker */}
      <LocationPicker showRadiusSelector={true} />

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

            {currentList.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E5EAE7]">
                <Bike className="w-12 h-12 text-[#8E9F96] mx-auto mb-2 opacity-50" />
                <h4 className="font-bold text-base text-[#25312B]">No dispatch tasks in this list</h4>
                <p className="text-xs text-[#53645B] mt-1">
                  Check the "Available Nearby Tasks" tab to accept upcoming pickup dispatches.
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
                          src={donation.imageUrl}
                          alt={donation.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {donation.status}
                            </span>
                            <span className="text-xs text-[#8E9F96] font-mono">#{donation.id}</span>
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
                              To: <strong className="text-[#245C45]">{donation.claimedByNgoName || 'Hope Hearth Kitchen'}</strong>
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
                              : 'View Trip Receipt'}
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
