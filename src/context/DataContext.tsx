import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Donation,
  NotificationItem,
  LocationCoordinates
} from '../types';
import { DEFAULT_USER_LOCATION } from '../utils/haversine';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';
import { api, getStoredToken } from '../services/api';

interface ImpactMetrics {
  totalMealsRescued: number;
  activeDonors: number;
  partnerNgos: number;
  successfulDeliveries: number;
  co2DivertedKg: number;
  waterSavedLiters: number;
}

interface VerificationRequestItem {
  id: string;
  userId: string;
  organizationName: string;
  documentUrl?: string | null;
  status: string;
  submittedAt: string;
  notes?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    organization?: string | null;
    city: string;
    avatar?: string | null;
  };
}

interface ReportedIssueItem {
  id: string;
  userId?: string | null;
  donationId?: string | null;
  issueType: string;
  description: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface DataContextType {
  donations: Donation[];
  notifications: NotificationItem[];
  verificationRequests: VerificationRequestItem[];
  reportedIssues: ReportedIssueItem[];
  userLocation: LocationCoordinates;
  searchRadius: number; // km
  impactMetrics: ImpactMetrics;
  unreadNotificationCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  setUserLocation: (loc: LocationCoordinates) => void;
  setSearchRadius: (radius: number) => void;
  detectCurrentLocation: () => Promise<{ success: boolean; message: string }>;
  createDonation: (donation: Omit<Donation, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  claimDonation: (
    donationId: string,
    ngoData: { id: string; name: string; quantity: number; peopleToServe: number; notes?: string }
  ) => Promise<boolean>;
  acceptVolunteerTask: (
    donationId: string,
    volunteerData: { id: string; name: string; phone?: string }
  ) => Promise<boolean>;
  updateDeliveryStatus: (
    donationId: string,
    status: 'Picked Up' | 'Completed',
    details?: { proofPhoto?: string; receiverName?: string; notes?: string }
  ) => Promise<boolean>;
  cancelDonation: (donationId: string, reason: string, cancelledBy?: string) => Promise<boolean>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearAllNotifications: () => void;
  approveVerification: (id: string) => Promise<void>;
  rejectVerification: (id: string) => Promise<void>;
  resolveIssue: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_LOCATION_KEY = 'foodrescue_loc_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequestItem[]>([]);
  const [reportedIssues, setReportedIssues] = useState<ReportedIssueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userLocation, setUserLocationState] = useState<LocationCoordinates>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LOCATION_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USER_LOCATION;
    } catch {
      return DEFAULT_USER_LOCATION;
    }
  });

  const [searchRadius, setSearchRadius] = useState<number>(10);

  // Fetch real database records from backend APIs
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      const promises: Promise<any>[] = [api.donations.list()];

      if (token) {
        promises.push(api.notifications.list());
        promises.push(api.admin.verifications().catch(() => ({ success: false })));
        promises.push(api.admin.issues().catch(() => ({ success: false })));
      }

      const [donationsRes, notifsRes, verifsRes, issuesRes] = await Promise.all(promises);

      if (donationsRes.success && donationsRes.data?.donations) {
        setDonations(donationsRes.data.donations);
      } else if (!donationsRes.success) {
        setError(donationsRes.error || 'Failed to load donations from server.');
      }

      if (notifsRes?.success && notifsRes.data?.notifications) {
        setNotifications(notifsRes.data.notifications);
      }

      if (verifsRes?.success && verifsRes.data?.requests) {
        setVerificationRequests(verifsRes.data.requests);
      }

      if (issuesRes?.success && issuesRes.data?.issues) {
        setReportedIssues(issuesRes.data.issues);
      }
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Unable to connect to FoodRescue API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const setUserLocation = (loc: LocationCoordinates) => {
    setUserLocationState(loc);
    localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
    showToast('Location Updated', `Current search location set to ${loc.name || 'custom coordinates'}`, 'info');
  };

  const detectCurrentLocation = async (): Promise<{ success: boolean; message: string }> => {
    if (!navigator.geolocation) {
      return { success: false, message: 'Geolocation is not supported by your browser.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'My Detected Location',
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          };
          setUserLocation(newLoc);
          resolve({ success: true, message: 'Detected your real GPS location successfully!' });
        },
        (error) => {
          let msg = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. You can select your location manually or choose a metro preset.';
          }
          resolve({ success: false, message: msg });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const createDonation = async (donationData: Omit<Donation, 'id' | 'status' | 'createdAt'>): Promise<string> => {
    const res = await api.donations.create(donationData);
    if (!res.success || !res.data?.donation) {
      showToast('Error Creating Donation', res.error || 'Server error occurred.', 'error');
      throw new Error(res.error || 'Failed to create donation.');
    }

    const created = res.data.donation;
    setDonations((prev) => [created, ...prev]);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    showToast(
      'Donation Posted Successfully!',
      `Listing #${created.id} is now live and stored in the database.`,
      'success'
    );

    return created.id;
  };

  const claimDonation = async (
    donationId: string,
    ngoData: { id: string; name: string; quantity: number; peopleToServe: number; notes?: string }
  ): Promise<boolean> => {
    const res = await api.donations.claim(donationId, {
      quantity: ngoData.quantity,
      peopleToServe: ngoData.peopleToServe,
      notes: ngoData.notes,
    });

    if (res.success && res.data?.donation) {
      const updated = res.data.donation;
      setDonations((prev) => prev.map((d) => (d.id === donationId ? updated : d)));

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      showToast(
        'Donation Claimed!',
        `You have reserved this food surplus. A community volunteer can now accept pickup.`,
        'success'
      );
      return true;
    }

    showToast('Failed to Claim', res.error || 'Could not claim donation.', 'error');
    return false;
  };

  const acceptVolunteerTask = async (
    donationId: string,
    _volunteerData: { id: string; name: string; phone?: string }
  ): Promise<boolean> => {
    const res = await api.donations.volunteerAccept(donationId);
    if (res.success && res.data?.donation) {
      const updated = res.data.donation;
      setDonations((prev) => prev.map((d) => (d.id === donationId ? updated : d)));
      showToast('Task Accepted', `Pickup scheduled for #${donationId}. Route is ready.`, 'success');
      return true;
    }

    showToast('Task Error', res.error || 'Could not accept pickup task.', 'error');
    return false;
  };

  const updateDeliveryStatus = async (
    donationId: string,
    status: 'Picked Up' | 'Completed',
    details?: { proofPhoto?: string; receiverName?: string; notes?: string }
  ): Promise<boolean> => {
    const res = await api.donations.updateDeliveryStatus(donationId, status, details);
    if (res.success && res.data?.donation) {
      const updated = res.data.donation;
      setDonations((prev) => prev.map((d) => (d.id === donationId ? updated : d)));

      if (status === 'Picked Up') {
        showToast('Food Picked Up', `Status updated: In transit to delivery address.`, 'info');
      } else if (status === 'Completed') {
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } catch {}
        showToast('Successfully Delivered!', `Awesome job! Food delivered and verified.`, 'success');
      }
      return true;
    }

    showToast('Update Failed', res.error || 'Could not update delivery status.', 'error');
    return false;
  };

  const cancelDonation = async (donationId: string, reason: string): Promise<boolean> => {
    const res = await api.donations.cancel(donationId, reason);
    if (res.success && res.data?.donation) {
      const updated = res.data.donation;
      setDonations((prev) => prev.map((d) => (d.id === donationId ? updated : d)));
      showToast('Donation Cancelled', `Listing #${donationId} marked as cancelled.`, 'warning');
      return true;
    }

    showToast('Cancel Failed', res.error || 'Could not cancel donation.', 'error');
    return false;
  };

  const markNotificationAsRead = async (id: string) => {
    await api.notifications.markRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    await api.notifications.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Marked', 'All notifications marked as read', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'Notification tray is now empty', 'info');
  };

  const approveVerification = async (id: string) => {
    const res = await api.admin.reviewVerification(id, 'approve');
    if (res.success) {
      setVerificationRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 'verified' } : req))
      );
      showToast('Verification Approved', `Entity #${id} has been granted verified credentials.`, 'success');
    } else {
      showToast('Approval Failed', res.error || 'Server error', 'error');
    }
  };

  const rejectVerification = async (id: string) => {
    const res = await api.admin.reviewVerification(id, 'reject');
    if (res.success) {
      setVerificationRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 'rejected' } : req))
      );
      showToast('Verification Rejected', `Entity #${id} verification was rejected.`, 'warning');
    } else {
      showToast('Rejection Failed', res.error || 'Server error', 'error');
    }
  };

  const resolveIssue = async (id: string) => {
    const res = await api.admin.resolveIssue(id, 'resolved');
    if (res.success) {
      setReportedIssues((prev) =>
        prev.map((iss) => (iss.id === id ? { ...iss, status: 'resolved' } : iss))
      );
      showToast('Issue Resolved', 'Reported issue marked as resolved.', 'success');
    }
  };

  // Platform impact metrics calculated purely from verified database records
  const completedDonations = donations.filter((d) => d.status === 'Completed');
  const totalMealsRescued = completedDonations.reduce((acc, d) => {
    return acc + (d.estimatedPeopleServed || d.quantityValue || 0);
  }, 0);

  const completedCount = completedDonations.length;
  const uniqueDonorsCount = new Set(donations.map((d) => d.donorId).filter(Boolean)).size;
  const uniqueNgosCount = new Set(donations.map((d) => d.claimedByNgoId).filter(Boolean)).size;
  const co2DivertedKg = Math.round(totalMealsRescued * 2.5);
  const waterSavedLiters = Math.round(totalMealsRescued * 180);

  const impactMetrics: ImpactMetrics = {
    totalMealsRescued,
    activeDonors: uniqueDonorsCount,
    partnerNgos: uniqueNgosCount,
    successfulDeliveries: completedCount,
    co2DivertedKg,
    waterSavedLiters,
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        donations,
        notifications,
        verificationRequests,
        reportedIssues,
        userLocation,
        searchRadius,
        impactMetrics,
        unreadNotificationCount,
        isLoading,
        error,
        refreshData,
        setUserLocation,
        setSearchRadius,
        detectCurrentLocation,
        createDonation,
        claimDonation,
        acceptVolunteerTask,
        updateDeliveryStatus,
        cancelDonation,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        approveVerification,
        rejectVerification,
        resolveIssue,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
