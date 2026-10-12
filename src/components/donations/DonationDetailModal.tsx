import React, { useState } from 'react';
import { Donation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { calculateDistance, formatDistance } from '../../utils/haversine';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Users,
  AlertTriangle,
  ExternalLink,
  Phone,
  CheckCircle2,
  Calendar,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface DonationDetailModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onClaim?: (donation: Donation) => void;
  onVolunteerAction?: (donation: Donation) => void;
}

export const DonationDetailModal: React.FC<DonationDetailModalProps> = ({
  donation,
  isOpen,
  onClose,
  onClaim,
  onVolunteerAction,
}) => {
  const { currentUser } = useAuth();
  const { userLocation, cancelDonation } = useData();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Surplus items were consumed on-premise');

  if (!isOpen || !donation) return null;

  const distanceKm = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    donation.latitude,
    donation.longitude
  );

  const steps = [
    { label: 'Donation Posted', done: true, time: 'Initial' },
    {
      label: 'NGO Claimed',
      done: ['Claimed', 'Pickup Scheduled', 'Picked Up', 'Completed'].includes(donation.status),
      actor: donation.claimedByNgoName,
    },
    {
      label: 'Volunteer Assigned',
      done: ['Pickup Scheduled', 'Picked Up', 'Completed'].includes(donation.status),
      actor: donation.assignedVolunteerName,
    },
    {
      label: 'Food Picked Up',
      done: ['Picked Up', 'Completed'].includes(donation.status),
    },
    {
      label: 'Successfully Delivered',
      done: donation.status === 'Completed',
    },
  ];

  const handleConfirmCancel = () => {
    cancelDonation(donation.id, cancelReason, currentUser?.name);
    setIsCancelModalOpen(false);
    onClose();
  };

  const isDonorOwner = currentUser?.id === donation.donorId || currentUser?.role === 'admin';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl border border-[#E5EAE7] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="relative h-48 sm:h-56 w-full bg-[#F8F8F2] shrink-0">
            <img
              src={donation.imageUrl}
              alt={donation.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#25312B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <StatusBadge status={donation.status} size="md" />
              <span className="px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-[#25312B]">
                {donation.foodType}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 text-xs font-medium text-white/80 mb-1">
                <span>{donation.category}</span>
                <span>•</span>
                <span>Listing #{donation.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#F4A261]">
                  <MapPin className="w-3.5 h-3.5" />
                  {formatDistance(distanceKm)} away
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading line-clamp-1">
                {donation.title}
              </h3>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-sm text-[#53645B]">
            {/* Visual 5-Step Progress Tracker */}
            <div className="bg-[#F8F8F2] rounded-2xl p-4 sm:p-5 border border-[#E5EAE7]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C45] mb-3">
                Live Fulfillment Progress Tracker
              </h4>

              {donation.status === 'Cancelled' ? (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Donation Cancelled. Reason: <strong>{donation.cancellationReason || 'Discontinued by donor'}</strong>
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {steps.map((step, idx) => (
                      <div key={step.label} className="flex flex-col items-center text-center flex-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step.done
                              ? 'bg-[#245C45] text-white shadow-xs'
                              : 'bg-white border-2 border-[#E5EAE7] text-[#8E9F96]'
                          }`}
                        >
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 font-semibold line-clamp-1 max-w-[80px] ${
                            step.done ? 'text-[#25312B]' : 'text-[#8E9F96]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#25312B] mb-1.5">
                Food Description &amp; Handling
              </h4>
              <p className="text-xs leading-relaxed text-[#53645B]">{donation.description}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F8F8F2] p-3 rounded-xl border border-[#E5EAE7]">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Quantity</span>
                <p className="font-bold text-[#25312B] text-sm mt-0.5">
                  {donation.quantityValue} {donation.quantityUnit}
                </p>
              </div>
              <div className="bg-[#F8F8F2] p-3 rounded-xl border border-[#E5EAE7]">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Estimated Servings</span>
                <p className="font-bold text-[#245C45] text-sm mt-0.5">
                  ~{donation.estimatedPeopleServed} people
                </p>
              </div>
              <div className="bg-[#F8F8F2] p-3 rounded-xl border border-[#E5EAE7]">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Storage Holding</span>
                <p className="font-bold text-[#25312B] text-xs mt-0.5 truncate">
                  {donation.storageCondition}
                </p>
              </div>
              <div className="bg-[#F8F8F2] p-3 rounded-xl border border-[#E5EAE7]">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Packaging</span>
                <p className="font-bold text-[#25312B] text-xs mt-0.5 truncate">
                  {donation.packagingStatus}
                </p>
              </div>
            </div>

            {/* Timings & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-[#E5EAE7]">
              <div>
                <span className="text-xs font-bold text-[#25312B] flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-[#245C45]" />
                  Pickup Window
                </span>
                <p className="text-xs text-[#53645B]">{donation.pickupDate} ({donation.pickupTimeWindow})</p>
              </div>

              <div>
                <span className="text-xs font-bold text-[#25312B] flex items-center gap-1.5 mb-1">
                  <Calendar className="w-4 h-4 text-[#F4A261]" />
                  Consume Before (Safe Window)
                </span>
                <p className="text-xs text-[#53645B]">{donation.expiryDateTime.replace('T', ' ')}</p>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#245C45] flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Pickup Location &amp; Contact
              </span>
              <p className="text-xs font-bold text-[#25312B]">{donation.pickupAddress}</p>
              <p className="text-xs text-[#53645B]">
                {donation.area}, {donation.city} - {donation.pincode}
              </p>
              <p className="text-xs text-[#53645B]">
                Contact: <strong className="text-[#25312B]">{donation.contactPerson}</strong> ({donation.contactPhone})
              </p>
              {donation.specialInstructions && (
                <div className="p-2.5 rounded-xl bg-white border border-[#E5EAE7] text-xs text-[#245C45]">
                  <strong>Special Instructions:</strong> {donation.specialInstructions}
                </div>
              )}
            </div>

            {/* Assigned Stakeholders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-[#E5EAE7]">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Donor Organization</span>
                <p className="font-bold text-[#25312B] mt-0.5">{donation.donorOrg || donation.donorName}</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Hygiene Certified
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E5EAE7]">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Recipient Organization</span>
                <p className="font-bold text-[#25312B] mt-0.5">
                  {donation.claimedByNgoName || 'Pending NGO Claim'}
                </p>
                {donation.assignedVolunteerName && (
                  <p className="text-[11px] text-blue-600 mt-1">
                    Courier: {donation.assignedVolunteerName}
                  </p>
                )}
              </div>
            </div>

            {/* Proof of delivery photo (if completed) */}
            {donation.status === 'Completed' && donation.deliveryProofPhoto && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Verified Delivery Proof
                </span>
                <img
                  src={donation.deliveryProofPhoto}
                  alt="Delivery Proof"
                  className="w-full h-40 object-cover rounded-xl border"
                />
                {donation.receiverName && (
                  <p className="text-xs text-emerald-950 mt-2">
                    Received and signed off by: <strong>{donation.receiverName}</strong>
                  </p>
                )}
                {donation.deliveryNotes && (
                  <p className="text-xs text-emerald-800 italic mt-0.5">
                    "{donation.deliveryNotes}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:px-7 border-t border-[#E5EAE7] bg-[#F8F8F2] flex flex-wrap items-center justify-between gap-3">
            <div>
              {isDonorOwner && donation.status !== 'Completed' && donation.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
                >
                  Cancel Donation
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#53645B] hover:bg-white rounded-xl transition-colors"
              >
                Close
              </button>

              {donation.status === 'Available' && (currentUser?.role === 'ngo' || !currentUser) && onClaim && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onClaim(donation);
                  }}
                  className="px-5 py-2.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center gap-1.5"
                >
                  <span>Claim Surplus Food</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {(donation.status === 'Claimed' || donation.status === 'Pickup Scheduled' || donation.status === 'Picked Up') &&
                (currentUser?.role === 'volunteer' || currentUser?.role === 'admin') &&
                onVolunteerAction && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onVolunteerAction(donation);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Courier Dispatch Hub</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel This Surplus Listing?"
        message="Are you sure you want to cancel this food donation? Any registered claim will be notified immediately."
        confirmLabel="Yes, Cancel Listing"
        cancelLabel="Keep Listing"
        isDestructive={true}
      />
    </>
  );
};
