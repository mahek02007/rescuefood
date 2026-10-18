import React, { useState } from 'react';
import { Donation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  Truck,
  MapPin,
  ExternalLink,
  Phone,
  Camera,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DeliveryWorkflowModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryWorkflowModal: React.FC<DeliveryWorkflowModalProps> = ({
  donation,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { acceptVolunteerTask, updateDeliveryStatus } = useData();
  const { showToast } = useToast();

  const [receiverName, setReceiverName] = useState(donation?.claimedByNgoName || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [proofPhoto, setProofPhoto] = useState(
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800'
  );
  const [step, setStep] = useState<'details' | 'confirm_pickup' | 'complete_delivery'>('details');

  React.useEffect(() => {
    if (donation?.claimedByNgoName) {
      setReceiverName(donation.claimedByNgoName);
    }
  }, [donation]);

  if (!isOpen || !donation) return null;

  const isAssignedToCurrent = donation.assignedVolunteerId === currentUser?.id;
  const isAccepted = donation.status === 'Pickup Scheduled';
  const isPickedUp = donation.status === 'Picked Up';
  const isCompleted = donation.status === 'Completed';

  const pickupQuery = encodeURIComponent(`${donation.pickupAddress}, ${donation.city}`);
  const dropoffQuery = encodeURIComponent(
    donation.claimedByNgoName ? `${donation.claimedByNgoName}, ${donation.city}` : `${donation.city} Recipient Kitchen`
  );
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupQuery}&destination=${dropoffQuery}`;

  const handleAccept = async () => {
    if (!currentUser) {
      showToast('Login Required', 'Please sign in to accept delivery tasks.', 'warning');
      return;
    }
    await acceptVolunteerTask(donation.id, {
      id: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
    });
    onClose();
  };

  const handleMarkPickedUp = async () => {
    await updateDeliveryStatus(donation.id, 'Picked Up');
    onClose();
  };

  const handleMarkDelivered = async () => {
    await updateDeliveryStatus(donation.id, 'Completed', {
      proofPhoto,
      receiverName: receiverName.trim() || donation.claimedByNgoName || 'Verified Pantry Manager',
      notes: deliveryNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E5EAE7] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#F8F8F2]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#25312B] font-heading">
                Volunteer Task Dispatch #{donation.id}
              </h4>
              <p className="text-xs text-[#53645B]">Courier Food Transit &amp; Drop-off Workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9F96] hover:text-[#25312B] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Progress Tracker */}
          <div className="p-4 bg-[#F8F8F2] rounded-2xl border border-[#E5EAE7]">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className={donation.status === 'Claimed' ? 'text-[#245C45]' : 'text-[#8E9F96]'}>
                1. Ready
              </span>
              <span className={donation.status === 'Pickup Scheduled' ? 'text-[#245C45]' : 'text-[#8E9F96]'}>
                2. Accepted
              </span>
              <span className={donation.status === 'Picked Up' ? 'text-[#245C45]' : 'text-[#8E9F96]'}>
                3. In Transit
              </span>
              <span className={donation.status === 'Completed' ? 'text-[#059669]' : 'text-[#8E9F96]'}>
                4. Delivered
              </span>
            </div>
            <div className="w-full bg-[#E5EAE7] h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-[#245C45] h-full transition-all duration-500"
                style={{
                  width:
                    donation.status === 'Claimed'
                      ? '25%'
                      : donation.status === 'Pickup Scheduled'
                      ? '50%'
                      : donation.status === 'Picked Up'
                      ? '75%'
                      : '100%',
                }}
              />
            </div>
          </div>

          {/* Route Overview */}
          <div className="space-y-3 p-4 rounded-2xl border border-[#E5EAE7]">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#EBF5ED] text-[#245C45] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                A
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Pickup Location</span>
                <p className="text-xs font-bold text-[#25312B]">{donation.pickupAddress}</p>
                <p className="text-xs text-[#53645B]">
                  Contact: {donation.contactPerson} ({donation.contactPhone})
                </p>
                {donation.specialInstructions && (
                  <p className="text-[11px] text-[#245C45] italic mt-0.5">
                    "{donation.specialInstructions}"
                  </p>
                )}
              </div>
              <a
                href={`tel:${donation.contactPhone}`}
                className="p-2 bg-[#F8F8F2] hover:bg-[#EBF5ED] text-[#245C45] rounded-xl transition-colors shrink-0"
                title="Call Donor"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="border-l-2 border-dashed border-[#E5EAE7] ml-3.5 h-4" />

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                B
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-[#8E9F96]">Drop-off Kitchen</span>
                <p className="text-xs font-bold text-[#25312B]">
                  {donation.claimedByNgoName || 'Hope Hearth Community Kitchen'}
                </p>
                <p className="text-xs text-[#53645B]">East Valley Community Zone, Metropolis</p>
                {donation.ngoPickupNotes && (
                  <p className="text-[11px] text-blue-700 italic mt-0.5">
                    NGO Notes: "{donation.ngoPickupNotes}"
                  </p>
                )}
              </div>
              <a
                href="tel:+15558765432"
                className="p-2 bg-[#F8F8F2] hover:bg-blue-50 text-blue-600 rounded-xl transition-colors shrink-0"
                title="Call Recipient Kitchen"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Google Maps link */}
            <div className="pt-2 border-t border-[#F8F8F2] flex items-center justify-between">
              <span className="text-xs text-[#53645B]">Est. Transit: ~12-18 mins (4.2 km)</span>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#245C45] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Route in Google Maps
              </a>
            </div>
          </div>

          {/* Delivery Completion Details (if In Transit) */}
          {isPickedUp && (
            <div className="space-y-3 p-4 bg-[#F8F8F2] rounded-2xl border border-[#E5EAE7]">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#245C45] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Delivery Hand-off Verification
              </h5>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">
                  Receiver Staff Name *
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">
                  Proof of Delivery Photo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={proofPhoto}
                    onChange={(e) => setProofPhoto(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                  />
                  <img src={proofPhoto} alt="Proof" className="w-10 h-10 rounded-lg object-cover border" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Delivery Notes</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F8F8F2]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#53645B] hover:bg-[#F8F8F2] rounded-xl"
            >
              Close
            </button>

            {donation.status === 'Claimed' && (
              <button
                onClick={handleAccept}
                className="px-5 py-2.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#6FAF78]" />
                Accept Task
              </button>
            )}

            {donation.status === 'Pickup Scheduled' && (
              <button
                onClick={handleMarkPickedUp}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                Mark Food as Picked Up
              </button>
            )}

            {donation.status === 'Picked Up' && (
              <button
                onClick={handleMarkDelivered}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Final Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
