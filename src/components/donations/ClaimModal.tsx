import React, { useState } from 'react';
import { Donation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { HeartHandshake, X, CheckCircle2, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ClaimModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  donation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { claimDonation } = useData();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState<number>(donation?.quantityValue || 30);
  const [peopleToServe, setPeopleToServe] = useState<number>(donation?.estimatedPeopleServed || 30);
  const [pickupNotes, setPickupNotes] = useState(
    'We will arrive with temperature-controlled insulated transport boxes.'
  );
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Sync state if donation changes
  React.useEffect(() => {
    if (donation) {
      setQuantity(donation.quantityValue);
      setPeopleToServe(donation.estimatedPeopleServed);
    }
  }, [donation]);

  if (!isOpen || !donation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      showToast('Agreement Required', 'Please confirm you will distribute food at no cost.', 'warning');
      return;
    }

    const success = claimDonation(donation.id, {
      id: currentUser?.id || 'ngo-demo',
      name: currentUser?.organization || currentUser?.name || 'Hope Hearth Community Kitchen',
      quantity,
      peopleToServe,
      notes: pickupNotes,
    });

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5EAE7] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#F8F8F2]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#EBF5ED] text-[#245C45]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#25312B] font-heading">
                Claim Food Donation #{donation.id}
              </h4>
              <p className="text-xs text-[#53645B]">Reserve surplus provisions for your community kitchen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9F96] hover:text-[#25312B] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] flex items-center gap-3">
            <img
              src={donation.imageUrl}
              alt={donation.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-xs text-[#25312B] truncate">{donation.title}</h5>
              <p className="text-xs text-[#53645B] mt-0.5">
                Total available: <strong className="text-[#245C45]">{donation.quantityValue} {donation.quantityUnit}</strong>
              </p>
              <p className="text-[11px] text-[#8E9F96] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Pickup window: {donation.pickupTimeWindow}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#25312B] mb-1">Quantity Needed</label>
              <input
                type="number"
                min={1}
                max={donation.quantityValue}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(donation.quantityValue, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] font-semibold"
              />
              <span className="text-[10px] text-[#8E9F96] mt-0.5 block">{donation.quantityUnit} requested</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#25312B] mb-1">Beneficiaries Served</label>
              <input
                type="number"
                min={1}
                value={peopleToServe}
                onChange={(e) => setPeopleToServe(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] font-semibold"
              />
              <span className="text-[10px] text-[#8E9F96] mt-0.5 block">Estimated individuals</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#25312B] mb-1">
              Pickup &amp; Storage Instructions
            </label>
            <textarea
              rows={2}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="e.g. Bringing insulated cooler boxes; van license plate #XYZ"
              className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
            />
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#245C45] focus:ring-[#245C45]"
              />
              <span>
                I certify that this claimed food will be provided completely free of charge to individuals experiencing food insecurity, in full compliance with hygiene protocols.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F8F8F2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#53645B] hover:bg-[#F8F8F2] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#6FAF78]" />
              Confirm &amp; Claim Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
