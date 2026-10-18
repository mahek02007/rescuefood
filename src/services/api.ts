import { User, Donation, NotificationItem, UserRole } from '../types';

const TOKEN_KEY = 'foodrescue_jwt_token_v1';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || `Server responded with status ${res.status}`,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error or backend unavailable.',
    };
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    return apiFetch<{ status: string; database: { connected: boolean; message: string } }>('/api/health');
  },

  // Auth
  auth: {
    login: async (email: string, password?: string) => {
      return apiFetch<{ success: boolean; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: password || 'FoodRescue2026!' }),
      });
    },

    register: async (userData: {
      name: string;
      email: string;
      password?: string;
      role: UserRole;
      phone?: string;
      organization?: string;
    }) => {
      return apiFetch<{ success: boolean; token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          password: userData.password || 'FoodRescue2026!',
        }),
      });
    },

    me: async () => {
      return apiFetch<{ success: boolean; user: User }>('/api/auth/me');
    },

    updateProfile: async (updatedData: Partial<User>) => {
      return apiFetch<{ success: boolean; user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
    },
  },

  // Donations
  donations: {
    list: async (params?: {
      status?: string;
      category?: string;
      foodType?: string;
      search?: string;
      lat?: number;
      lng?: number;
      radius?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.foodType && params.foodType !== 'All') query.append('foodType', params.foodType);
      if (params?.search) query.append('search', params.search);
      if (params?.lat !== undefined) query.append('lat', params.lat.toString());
      if (params?.lng !== undefined) query.append('lng', params.lng.toString());
      if (params?.radius !== undefined) query.append('radius', params.radius.toString());

      const url = `/api/donations${query.toString() ? `?${query.toString()}` : ''}`;
      return apiFetch<{ success: boolean; count: number; donations: Donation[] }>(url);
    },

    getById: async (id: string) => {
      return apiFetch<{ success: boolean; donation: Donation }>(`/api/donations/${id}`);
    },

    create: async (donation: Omit<Donation, 'id' | 'status' | 'createdAt'>) => {
      return apiFetch<{ success: boolean; donation: Donation }>('/api/donations', {
        method: 'POST',
        body: JSON.stringify(donation),
      });
    },

    claim: async (id: string, payload: { quantity?: number; peopleToServe?: number; notes?: string }) => {
      return apiFetch<{ success: boolean; donation: Donation }>(`/api/donations/${id}/claim`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    volunteerAccept: async (id: string) => {
      return apiFetch<{ success: boolean; donation: Donation }>(`/api/donations/${id}/volunteer`, {
        method: 'PUT',
      });
    },

    updateDeliveryStatus: async (
      id: string,
      status: 'Picked Up' | 'Completed',
      details?: { proofPhoto?: string; receiverName?: string; notes?: string }
    ) => {
      return apiFetch<{ success: boolean; donation: Donation }>(`/api/donations/${id}/delivery-status`, {
        method: 'PUT',
        body: JSON.stringify({ status, ...details }),
      });
    },

    cancel: async (id: string, reason: string) => {
      return apiFetch<{ success: boolean; donation: Donation }>(`/api/donations/${id}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    },
  },

  // Notifications
  notifications: {
    list: async () => {
      return apiFetch<{ success: boolean; notifications: NotificationItem[] }>('/api/notifications');
    },

    markRead: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    markAllRead: async () => {
      return apiFetch<{ success: boolean }>('/api/notifications/read-all', {
        method: 'PATCH',
      });
    },
  },

  // Admin
  admin: {
    stats: async () => {
      return apiFetch<{ success: boolean; stats: any }>('/api/admin/stats');
    },

    users: async () => {
      return apiFetch<{ success: boolean; count: number; users: User[] }>('/api/admin/users');
    },

    verifications: async () => {
      return apiFetch<{ success: boolean; count: number; requests: any[] }>('/api/admin/verifications');
    },

    reviewVerification: async (id: string, action: 'approve' | 'reject', notes?: string) => {
      return apiFetch<{ success: boolean; verification: any }>(`/api/admin/verifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, notes }),
      });
    },

    issues: async () => {
      return apiFetch<{ success: boolean; count: number; issues: any[] }>('/api/admin/issues');
    },

    resolveIssue: async (id: string, status: 'resolved' | 'dismissed') => {
      return apiFetch<{ success: boolean; issue: any }>(`/api/admin/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },
};
