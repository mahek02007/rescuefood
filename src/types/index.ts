export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: string;
  address: string;
  city: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
  avatar: string;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verificationDoc?: string;
  joinedDate: string;
  // Stats
  totalMealsRescued?: number;
  totalDonations?: number;
  totalDeliveries?: number;
}

export type FoodCategory =
  | 'Cooked Meals'
  | 'Fresh Fruits'
  | 'Vegetables'
  | 'Bakery'
  | 'Packaged Food'
  | 'Groceries'
  | 'Dairy & Refrigerated'
  | 'Other';

export type FoodDietaryType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Egg' | 'Other';

export type DonationStatus =
  | 'Available'
  | 'Claimed'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'Completed'
  | 'Cancelled';

export interface Donation {
  id: string;
  title: string;
  category: FoodCategory;
  description: string;
  foodType: FoodDietaryType;
  quantityValue: number;
  quantityUnit: 'meals' | 'kg' | 'packets' | 'boxes';
  estimatedPeopleServed: number;
  imageUrl: string;
  preparedDateTime?: string;
  expiryDateTime: string;
  storageCondition: 'Room Temperature' | 'Refrigerated' | 'Frozen' | 'Heated/Warm' | 'Dry Cool';
  packagingStatus: 'Individually Packaged' | 'Bulk Containers' | 'Sealed Trays' | 'Boxes/Crates';
  pickupDate: string;
  pickupTimeWindow: string; // e.g. "14:00 - 16:30"
  
  // Location
  pickupAddress: string;
  city: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;

  // Contact
  contactPerson: string;
  contactPhone: string;
  specialInstructions?: string;

  // Food safety check
  foodSafetyConfirmed: boolean;

  // Status & Assignment
  status: DonationStatus;
  createdAt: string;
  donorId: string;
  donorName: string;
  donorOrg?: string;
  donorVerified: boolean;
  donorAvatar?: string;

  // Claimed NGO
  claimedByNgoId?: string;
  claimedByNgoName?: string;
  claimedAt?: string;
  ngoRequiredQuantity?: number;
  ngoPeopleToServe?: number;
  ngoPickupNotes?: string;

  // Volunteer
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  volunteerPhone?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryProofPhoto?: string;
  receiverName?: string;
  deliveryNotes?: string;

  // Cancellation
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

export interface ActivityTimelineItem {
  id: string;
  donationId: string;
  timestamp: string;
  status: DonationStatus;
  description: string;
  actorName: string;
  actorRole: UserRole;
}

export interface NotificationItem {
  id: string;
  userId?: string; // target user or 'all'
  role?: UserRole | 'all';
  title: string;
  message: string;
  type: 'donation' | 'claim' | 'pickup' | 'delivery' | 'cancellation' | 'verification' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
  donationId?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}
