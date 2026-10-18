import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Donation, FoodCategory, FoodDietaryType } from '../../types';
import { SAMPLE_FOOD_PRESETS } from '../../data/mockData';
import { SAMPLE_CITIES } from '../../utils/haversine';
import {
  X,
  PackagePlus,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DonationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (donationId: string) => void;
}

export const DonationFormModal: React.FC<DonationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { createDonation, detectCurrentLocation } = useData();
  const { showToast } = useToast();

  const [step, setStep] = useState<'form' | 'preview'>('form');

  // Form State with sensible defaults
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState<FoodDietaryType>('Vegetarian');
  const [quantityValue, setQuantityValue] = useState<number>(30);
  const [quantityUnit, setQuantityUnit] = useState<'meals' | 'kg' | 'packets' | 'boxes'>('meals');
  const [estimatedPeopleServed, setEstimatedPeopleServed] = useState<number>(30);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
  );
  const [preparedDateTime, setPreparedDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [expiryDateTime, setExpiryDateTime] = useState(
    new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [storageCondition, setStorageCondition] = useState<
    'Room Temperature' | 'Refrigerated' | 'Frozen' | 'Heated/Warm' | 'Dry Cool'
  >('Heated/Warm');
  const [packagingStatus, setPackagingStatus] = useState<
    'Individually Packaged' | 'Bulk Containers' | 'Sealed Trays' | 'Boxes/Crates'
  >('Individually Packaged');
  const [pickupDate, setPickupDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [pickupTimeWindow, setPickupTimeWindow] = useState('14:00 - 17:30');

  // Location fields
  const [pickupAddress, setPickupAddress] = useState(
    currentUser?.address || ''
  );
  const [city, setCity] = useState(currentUser?.city || 'Metropolis');
  const [area, setArea] = useState(currentUser?.area || 'Downtown');
  const [pincode, setPincode] = useState(currentUser?.pincode || '94103');
  const [latitude, setLatitude] = useState(currentUser?.latitude || 37.7758);
  const [longitude, setLongitude] = useState(currentUser?.longitude || -122.4178);

  // Contact
  const [contactPerson, setContactPerson] = useState(currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Food Safety Checklist (all 4 required)
  const [checklist, setChecklist] = useState({
    hygiene: false,
    storage: false,
    packaging: false,
    safePeriod: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof SAMPLE_FOOD_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category as FoodCategory);
    setDescription(preset.description);
    setFoodType(preset.type as FoodDietaryType);
    setQuantityValue(preset.defaultQty);
    setQuantityUnit(preset.unit as any);
    setEstimatedPeopleServed(preset.serves);
    setImageUrl(preset.imageUrl);
    setStorageCondition(preset.storage as any);
    setPackagingStatus(preset.packaging as any);
    showToast('Template Applied', `Populated form with "${preset.title}"`, 'info');
  };

  const handleDetectGPS = async () => {
    setIsDetectingLocation(true);
    const res = await detectCurrentLocation();
    setIsDetectingLocation(false);
    if (res.success && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      });
      showToast('GPS Detected', 'Updated pickup coordinates from device GPS', 'success');
    } else {
      showToast('Notice', res.message, 'warning');
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Food title is required.';
    if (!description.trim()) errs.description = 'Please provide a food description.';
    if (quantityValue <= 0) errs.quantity = 'Quantity must be greater than 0.';
    if (estimatedPeopleServed <= 0) errs.serves = 'Estimated people served must be at least 1.';
    if (!pickupAddress.trim()) errs.address = 'Pickup address is required.';
    if (!contactPerson.trim()) errs.contact = 'Contact person is required.';
    if (!contactPhone.trim()) errs.phone = 'Phone number is required.';

    if (!checklist.hygiene || !checklist.storage || !checklist.packaging || !checklist.safePeriod) {
      errs.checklist = 'All 4 food safety commitments must be accepted.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep('preview');
    } else {
      showToast('Incomplete Form', 'Please review required fields and food safety commitments.', 'error');
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentUser) {
      showToast('Authentication Required', 'Please sign in to post a surplus donation.', 'error');
      return;
    }

    const newDonationData: Omit<Donation, 'id' | 'status' | 'createdAt'> = {
      title,
      category,
      description,
      foodType,
      quantityValue: Number(quantityValue),
      quantityUnit,
      estimatedPeopleServed: Number(estimatedPeopleServed),
      imageUrl,
      preparedDateTime,
      expiryDateTime,
      storageCondition,
      packagingStatus,
      pickupDate,
      pickupTimeWindow,
      pickupAddress,
      city,
      area,
      pincode,
      latitude,
      longitude,
      contactPerson: contactPerson || currentUser.name,
      contactPhone: contactPhone || currentUser.phone,
      specialInstructions,
      foodSafetyConfirmed: true,
      donorId: currentUser.id,
      donorName: currentUser.name,
      donorOrg: currentUser.organization || undefined,
      donorVerified: currentUser.isVerified,
      donorAvatar: currentUser.avatar,
    };

    try {
      const newId = await createDonation(newDonationData);
      if (onSuccess) onSuccess(newId);
      onClose();
    } catch {
      // error toast handled in createDonation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-[#E5EAE7] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:px-8 border-b border-[#E5EAE7] flex items-center justify-between bg-[#F8F8F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#245C45] text-white flex items-center justify-center shadow-md shadow-[#245C45]/20">
              <PackagePlus className="w-5 h-5 text-[#6FAF78]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#25312B] font-heading">
                {step === 'form' ? 'Post Surplus Food Donation' : 'Preview & Confirm Donation'}
              </h3>
              <p className="text-xs text-[#53645B]">
                {step === 'form'
                  ? 'Connect with nearby verified soup kitchens & shelters'
                  : 'Review listing details before publishing to active feed'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E9F96] hover:text-[#25312B] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {step === 'form' ? (
            <form id="donation-form" onSubmit={handleGoToPreview} className="space-y-6">
              {/* Quick Template Presets */}
              <div className="bg-[#EBF5ED] rounded-2xl p-4 border border-[#6FAF78]/30">
                <div className="flex items-center gap-2 mb-2 text-[#245C45] font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[#F4A261]" />
                  <span>1-Click Popular Food Presets:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_FOOD_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-white text-xs font-semibold text-[#245C45] hover:bg-[#245C45] hover:text-white transition-all shadow-2xs border border-[#6FAF78]/30"
                    >
                      + {p.title.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Basic Food Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C45] mb-3">
                  1. Food Item Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Food Title / Name *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Executive Buffet: Grilled Salmon & Herb Rice Platters"
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45]"
                    />
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Food Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FoodCategory)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    >
                      <option value="Cooked Meals">Cooked Meals (Warm / Cold)</option>
                      <option value="Fresh Fruits">Fresh Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Bakery">Bakery & Breads</option>
                      <option value="Packaged Food">Packaged Goods</option>
                      <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                      <option value="Groceries">Groceries / Dry Pantry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Dietary Type *</label>
                    <select
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value as FoodDietaryType)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan (100% Plant-Based)</option>
                      <option value="Egg">Egg-based</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Food Description & Allergens *
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the dishes, temperature history, ingredients, and allergen notes (contains dairy, nuts, gluten, etc.)."
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45]"
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Quantity, Portions & Photo */}
              <div className="pt-4 border-t border-[#F8F8F2]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C45] mb-3">
                  2. Quantity & Portions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Quantity Amount *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantityValue}
                      onChange={(e) => setQuantityValue(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Unit *</label>
                    <select
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    >
                      <option value="meals">Meals / Portions</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="packets">Packets / Containers</option>
                      <option value="boxes">Boxes / Crates</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Est. People Served *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={estimatedPeopleServed}
                      onChange={(e) => setEstimatedPeopleServed(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-[#25312B] mb-1 flex items-center justify-between">
                      <span>Food Image URL / Photo</span>
                      <span className="text-[10px] text-[#8E9F96] font-normal">
                        Pre-populated with high quality demo photography
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-[#F8F8F2] border border-[#E5EAE7] overflow-hidden shrink-0">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste image link or use preset..."
                        className="flex-1 px-3.5 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Storage & Packaging */}
              <div className="pt-4 border-t border-[#F8F8F2]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C45] mb-3">
                  3. Storage & Handling Conditions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Storage Condition *</label>
                    <select
                      value={storageCondition}
                      onChange={(e) => setStorageCondition(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    >
                      <option value="Heated/Warm">Heated / Warm (Kept &gt; 60°C)</option>
                      <option value="Refrigerated">Refrigerated (Chilled &lt; 4°C)</option>
                      <option value="Frozen">Frozen (&lt; -18°C)</option>
                      <option value="Room Temperature">Room Temperature (Bakery / Dry)</option>
                      <option value="Dry Cool">Dry &amp; Cool Pantry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Packaging Status *</label>
                    <select
                      value={packagingStatus}
                      onChange={(e) => setPackagingStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    >
                      <option value="Individually Packaged">Individually Packaged Boxes</option>
                      <option value="Sealed Trays">Sealed Foil Catering Trays</option>
                      <option value="Boxes/Crates">Boxes / Crates</option>
                      <option value="Bulk Containers">Bulk Insulated Food Containers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Prepared At</label>
                    <input
                      type="datetime-local"
                      value={preparedDateTime}
                      onChange={(e) => setPreparedDateTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Consume Before (Expiry) *</label>
                    <input
                      type="datetime-local"
                      value={expiryDateTime}
                      onChange={(e) => setExpiryDateTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Pickup Logistics & Location */}
              <div className="pt-4 border-t border-[#F8F8F2]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C45]">
                    4. Pickup Location & Logistics
                  </h4>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isDetectingLocation}
                    className="text-xs font-semibold text-[#245C45] hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {isDetectingLocation ? 'Locating...' : 'Use My GPS Location'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Pickup Street Address *
                    </label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Service Dock B"
                      className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Area / Neighborhood</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">City & PIN Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-2/3 px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                      />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="PIN"
                        className="w-1/3 px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Pickup Date *</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Available Pickup Window *
                    </label>
                    <input
                      type="text"
                      value={pickupTimeWindow}
                      onChange={(e) => setPickupTimeWindow(e.target.value)}
                      placeholder="e.g. 15:00 - 18:00"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Contact Person *</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Special Pickup Instructions
                    </label>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Parking bay, security guard instructions, trolley availability, etc."
                      className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Food Safety Checklist (Mandatory) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <h4 className="font-bold text-sm text-amber-900 font-heading">
                    Mandatory Food Safety & Hygiene Commitment
                  </h4>
                </div>
                <p className="text-xs text-amber-800 mb-3">
                  You must confirm all 4 requirements prior to posting this donation:
                </p>

                <div className="space-y-2.5 text-xs text-amber-950">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.hygiene}
                      onChange={(e) => setChecklist({ ...checklist, hygiene: e.target.checked })}
                      className="mt-0.5 rounded text-[#245C45] focus:ring-[#245C45]"
                    />
                    <span>Food has been handled and prepared hygienically under clean sanitary conditions.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.storage}
                      onChange={(e) => setChecklist({ ...checklist, storage: e.target.checked })}
                      className="mt-0.5 rounded text-[#245C45] focus:ring-[#245C45]"
                    />
                    <span>Food has been stored at appropriate safe holding temperatures (hot &gt;60°C or cold &lt;4°C).</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.packaging}
                      onChange={(e) => setChecklist({ ...checklist, packaging: e.target.checked })}
                      className="mt-0.5 rounded text-[#245C45] focus:ring-[#245C45]"
                    />
                    <span>Food is cleanly and securely packed in food-grade, leak-proof containers.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.safePeriod}
                      onChange={(e) => setChecklist({ ...checklist, safePeriod: e.target.checked })}
                      className="mt-0.5 rounded text-[#245C45] focus:ring-[#245C45]"
                    />
                    <span>Food is strictly within its safe consumption window with adequate time for redistribution.</span>
                  </label>
                </div>
                {errors.checklist && (
                  <p className="text-xs text-red-600 font-semibold mt-2.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.checklist}
                  </p>
                )}
              </div>
            </form>
          ) : (
            /* PREVIEW STEP */
            <div className="space-y-6">
              <div className="bg-[#EBF5ED] p-4 rounded-2xl border border-[#6FAF78]/40 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#245C45] shrink-0" />
                <div className="text-xs text-[#245C45]">
                  <span className="font-bold">Previewing your donation listing.</span> This is how nearby
                  verified NGOs and soup kitchens will view your surplus food.
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full sm:w-44 h-36 rounded-xl object-cover"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EBF5ED] text-[#245C45]">
                        Available
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {foodType}
                      </span>
                      <span className="text-xs text-[#8E9F96]">{category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#25312B] font-heading">{title}</h3>
                    <p className="text-xs text-[#53645B] leading-relaxed">{description}</p>
                    <div className="text-xs font-bold text-[#245C45] pt-1">
                      {quantityValue} {quantityUnit} · Serves ~{estimatedPeopleServed} people
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F8F8F2] text-xs">
                  <div>
                    <span className="text-[#8E9F96]">Pickup Location:</span>
                    <p className="font-semibold text-[#25312B]">{pickupAddress}, {area}</p>
                  </div>
                  <div>
                    <span className="text-[#8E9F96]">Pickup Window:</span>
                    <p className="font-semibold text-[#25312B]">{pickupDate} ({pickupTimeWindow})</p>
                  </div>
                  <div>
                    <span className="text-[#8E9F96]">Storage & Packaging:</span>
                    <p className="font-semibold text-[#25312B]">{storageCondition} · {packagingStatus}</p>
                  </div>
                  <div>
                    <span className="text-[#8E9F96]">Contact:</span>
                    <p className="font-semibold text-[#25312B]">{contactPerson} ({contactPhone})</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:px-8 border-t border-[#E5EAE7] bg-[#F8F8F2] flex items-center justify-between gap-3">
          {step === 'preview' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#53645B] hover:bg-white rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center gap-2 active:scale-95"
              >
                <span>Publish Listing Now</span>
                <CheckCircle2 className="w-4 h-4 text-[#6FAF78]" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#53645B] hover:bg-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="donation-form"
                className="px-6 py-2.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center gap-2 active:scale-95"
              >
                <span>Review & Preview</span>
                <ArrowRight className="w-4 h-4 text-[#6FAF78]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
