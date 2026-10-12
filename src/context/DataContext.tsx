import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Donation,
  NotificationItem,
  DonationStatus,
  LocationCoordinates
} from '../types';
import {
  INITIAL_DONATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_REPORTED_ISSUES,
  DEMO_USERS
} from '../data/mockData';
import { DEFAULT_USER_LOCATION } from '../utils/haversine';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface ImpactMetrics {
  totalMealsRescued: number;
  activeDonors: number;
  partnerNgos: number;
  successfulDeliveries: number;
  co2DivertedKg: number;
  waterSavedLiters: number;
}

interface DataContextType {
  donations: Donation[];
  notifications: NotificationItem[];
  verificationRequests: typeof INITIAL_VERIFICATION_REQUESTS;
  reportedIssues: typeof INITIAL_REPORTED_ISSUES;
  userLocation: LocationCoordinates;
  searchRadius: number; // km
  impactMetrics: ImpactMetrics;
  unreadNotificationCount: number;

  // Actions
  setUserLocation: (loc: LocationCoordinates) => void;
  setSearchRadius: (radius: number) => void;
  detectCurrentLocation: () => Promise<{ success: boolean; message: string }>;
  createDonation: (donation: Omit<Donation, 'id' | 'status' | 'createdAt'>) => string;
  claimDonation: (
    donationId: string,
    ngoData: { id: string; name: string; quantity: number; peopleToServe: number; notes?: string }
  ) => boolean;
  acceptVolunteerTask: (
    donationId: string,
    volunteerData: { id: string; name: string; phone?: string }
  ) => boolean;
  updateDeliveryStatus: (
    donationId: string,
    status: 'Picked Up' | 'Completed',
    details?: { proofPhoto?: string; receiverName?: string; notes?: string }
  ) => boolean;
  cancelDonation: (donationId: string, reason: string, cancelledBy?: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_DONATIONS_KEY = 'foodrescue_donations_v1';
const STORAGE_NOTIF_KEY = 'foodrescue_notifs_v1';
const STORAGE_VERIF_KEY = 'foodrescue_verif_v1';
const STORAGE_LOCATION_KEY = 'foodrescue_loc_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [donations, setDonations] = useState<Donation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_DONATIONS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIF_KEY);
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [verificationRequests, setVerificationRequests] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_VERIF_KEY);
      return stored ? JSON.parse(stored) : INITIAL_VERIFICATION_REQUESTS;
    } catch {
      return INITIAL_VERIFICATION_REQUESTS;
    }
  });

  const [reportedIssues] = useState(INITIAL_REPORTED_ISSUES);

  const [userLocation, setUserLocationState] = useState<LocationCoordinates>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LOCATION_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USER_LOCATION;
    } catch {
      return DEFAULT_USER_LOCATION;
    }
  });

  const [searchRadius, setSearchRadius] = useState<number>(10);

  // Sync with backend API if running
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [donationsRes, notifsRes] = await Promise.all([
          api.donations.list(),
          api.notifications.list(),
        ]);
        if (donationsRes.success && donationsRes.data?.donations && donationsRes.data.donations.length > 0) {
          setDonations(donationsRes.data.donations);
        }
        if (notifsRes.success && notifsRes.data?.notifications && notifsRes.data.notifications.length > 0) {
          setNotifications(notifsRes.data.notifications);
        }
      } catch {
        // Fallback to local storage
      }
    };
    fetchBackendData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_VERIF_KEY, JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  const setUserLocation = (loc: LocationCoordinates) => {
    setUserLocationState(loc);
    localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
    showToast('Location Updated', `Current search location set to ${loc.name || 'custom coordinates'}`, 'info');
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
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

  const createDonation = (donationData: Omit<Donation, 'id' | 'status' | 'createdAt'>): string => {
    const id = `DON-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDonation: Donation = {
      ...donationData,
      id,
      status: 'Available',
      createdAt: new Date().toISOString(),
    };

    setDonations((prev) => [newDonation, ...prev]);

    // Persist to backend database if connected
    api.donations.create(donationData).catch(() => {});

    // Add alert notification
    addNotification({
      title: 'New Donation Posted',
      message: `${newDonation.title} (${newDonation.quantityValue} ${newDonation.quantityUnit}) posted near ${newDonation.area}.`,
      type: 'donation',
      donationId: id,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    showToast(
      'Donation Posted Successfully!',
      `Listing #${id} is now live and visible to nearby verified recipient NGOs.`,
      'success'
    );

    return id;
  };

  const claimDonation = (
    donationId: string,
    ngoData: { id: string; name: string; quantity: number; peopleToServe: number; notes?: string }
  ): boolean => {
    let found = false;
    setDonations((prev) =>
      prev.map((don) => {
        if (don.id === donationId && don.status === 'Available') {
          found = true;
          return {
            ...don,
            status: 'Claimed',
            claimedByNgoId: ngoData.id,
            claimedByNgoName: ngoData.name,
            claimedAt: new Date().toISOString(),
            ngoRequiredQuantity: ngoData.quantity,
            ngoPeopleToServe: ngoData.peopleToServe,
            ngoPickupNotes: ngoData.notes,
          };
        }
        return don;
      })
    );

    if (found) {
      // Sync with backend API
      api.donations
        .claim(donationId, {
          quantity: ngoData.quantity,
          peopleToServe: ngoData.peopleToServe,
          notes: ngoData.notes,
        })
        .catch(() => {});

      addNotification({
        title: 'Donation Claimed!',
        message: `${ngoData.name} claimed #${donationId}. Ready for volunteer pickup dispatch.`,
        type: 'claim',
        donationId,
      });

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
    return false;
  };

  const acceptVolunteerTask = (
    donationId: string,
    volunteerData: { id: string; name: string; phone?: string }
  ): boolean => {
    let found = false;
    setDonations((prev) =>
      prev.map((don) => {
        if (don.id === donationId && (don.status === 'Claimed' || don.status === 'Available')) {
          found = true;
          return {
            ...don,
            status: 'Pickup Scheduled',
            assignedVolunteerId: volunteerData.id,
            assignedVolunteerName: volunteerData.name,
            volunteerPhone: volunteerData.phone || '+1 (555) 345-6789',
            acceptedAt: new Date().toISOString(),
          };
        }
        return don;
      })
    );

    if (found) {
      api.donations.volunteerAccept(donationId).catch(() => {});

      addNotification({
        title: 'Volunteer Task Accepted',
        message: `${volunteerData.name} has accepted pickup task for #${donationId}.`,
        type: 'pickup',
        donationId,
      });
      showToast('Task Accepted', `Pickup scheduled for #${donationId}. Route is ready.`, 'success');
      return true;
    }
    return false;
  };

  const updateDeliveryStatus = (
    donationId: string,
    status: 'Picked Up' | 'Completed',
    details?: { proofPhoto?: string; receiverName?: string; notes?: string }
  ): boolean => {
    let found = false;
    setDonations((prev) =>
      prev.map((don) => {
        if (don.id === donationId) {
          found = true;
          const updated: Donation = { ...don, status };
          if (status === 'Picked Up') {
            updated.pickedUpAt = new Date().toISOString();
          } else if (status === 'Completed') {
            updated.deliveredAt = new Date().toISOString();
            if (details?.proofPhoto) updated.deliveryProofPhoto = details.proofPhoto;
            if (details?.receiverName) updated.receiverName = details.receiverName;
            if (details?.notes) updated.deliveryNotes = details.notes;
          }
          return updated;
        }
        return don;
      })
    );

    if (found) {
      api.donations.updateDeliveryStatus(donationId, status, details).catch(() => {});

      if (status === 'Picked Up') {
        addNotification({
          title: 'Food Picked Up',
          message: `Volunteer picked up #${donationId} and is en route to recipient kitchen.`,
          type: 'pickup',
          donationId,
        });
        showToast('Food Picked Up', `Status updated: In transit to delivery address.`, 'info');
      } else if (status === 'Completed') {
        addNotification({
          title: 'Mission Complete: Food Delivered!',
          message: `Donation #${donationId} was successfully delivered and verified by recipient.`,
          type: 'delivery',
          donationId,
        });
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } catch {}
        showToast('Successfully Delivered!', `Awesome job! Food delivered and verified.`, 'success');
      }
      return true;
    }
    return false;
  };

  const cancelDonation = (donationId: string, reason: string, cancelledBy = 'User'): boolean => {
    let found = false;
    setDonations((prev) =>
      prev.map((don) => {
        if (don.id === donationId && don.status !== 'Completed') {
          found = true;
          return {
            ...don,
            status: 'Cancelled' as DonationStatus,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            cancelledBy,
          };
        }
        return don;
      })
    );

    if (found) {
      api.donations.cancel(donationId, reason).catch(() => {});

      addNotification({
        title: 'Donation Cancelled',
        message: `Donation #${donationId} was cancelled. Reason: ${reason}`,
        type: 'cancellation',
        donationId,
      });
      showToast('Donation Cancelled', `Listing #${donationId} marked as cancelled.`, 'warning');
      return true;
    }
    return false;
  };

  const markNotificationAsRead = (id: string) => {
    api.notifications.markRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    api.notifications.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Marked', 'All notifications marked as read', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'Notification tray is now empty', 'info');
  };

  const approveVerification = (id: string) => {
    setVerificationRequests((prev: typeof INITIAL_VERIFICATION_REQUESTS) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'verified' } : req))
    );
    showToast('Verification Approved', `Entity #${id} has been granted verified credentials.`, 'success');
  };

  const rejectVerification = (id: string) => {
    setVerificationRequests((prev: typeof INITIAL_VERIFICATION_REQUESTS) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'rejected' } : req))
    );
    showToast('Verification Rejected', `Entity #${id} verification was rejected.`, 'warning');
  };

  const resetDemoData = () => {
    setDonations(INITIAL_DONATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setVerificationRequests(INITIAL_VERIFICATION_REQUESTS);
    setUserLocationState(DEFAULT_USER_LOCATION);
    localStorage.removeItem(STORAGE_DONATIONS_KEY);
    localStorage.removeItem(STORAGE_NOTIF_KEY);
    localStorage.removeItem(STORAGE_VERIF_KEY);
    localStorage.removeItem(STORAGE_LOCATION_KEY);
    showToast('Demo Data Reset', 'Platform state has been reset to default mock records.', 'info');
  };

  // Calculate platform impact metrics dynamically
  const totalMealsRescued = donations.reduce((acc, d) => {
    if (d.status === 'Completed' || d.status === 'Pickup Scheduled' || d.status === 'Picked Up' || d.status === 'Claimed') {
      return acc + (d.estimatedPeopleServed || d.quantityValue);
    }
    return acc;
  }, 18450);

  const completedCount = donations.filter((d) => d.status === 'Completed').length + 84;
  const uniqueDonorsCount = new Set(donations.map((d) => d.donorId)).size + 36;
  const uniqueNgosCount = 28;
  const co2DivertedKg = Math.round(totalMealsRescued * 1.85);
  const waterSavedLiters = Math.round(totalMealsRescued * 940);

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
        resetDemoData,
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
