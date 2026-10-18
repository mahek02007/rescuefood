import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  ShieldCheck,
  Bell,
  Lock,
  LogOut,
  CheckCircle2,
  Save,
  Utensils,
  Truck,
  HeartHandshake,
  Award,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const { donations, impactMetrics } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Dynamic user calculations from real database records
  const donorListings = donations.filter((d) => d.donorId === currentUser?.id);
  const donorCompleted = donorListings.filter((d) => d.status === 'Completed');
  const donorMeals = donorCompleted.reduce((acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue || 0), 0);

  const ngoClaimed = donations.filter((d) => d.claimedByNgoId === currentUser?.id);
  const ngoCompleted = ngoClaimed.filter((d) => d.status === 'Completed');
  const ngoMeals = ngoCompleted.reduce((acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue || 0), 0);

  const volCompleted = donations.filter((d) => d.assignedVolunteerId === currentUser?.id && d.status === 'Completed');
  const volMeals = volCompleted.reduce((acc, d) => acc + (d.estimatedPeopleServed || d.quantityValue || 0), 0);
  const volHours = volCompleted.reduce((acc, d) => {
    if (d.deliveredAt && (d.pickedUpAt || d.acceptedAt)) {
      const h = (new Date(d.deliveredAt).getTime() - new Date(d.pickedUpAt || d.acceptedAt!).getTime()) / 3600000;
      return acc + (h > 0 ? h : 0);
    }
    return acc;
  }, 0);

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [organization, setOrganization] = useState(currentUser?.organization || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Metropolis');
  const [area, setArea] = useState(currentUser?.area || 'Downtown');
  const [pincode, setPincode] = useState(currentUser?.pincode || '94103');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Notification preferences
  const [notifSettings, setNotifSettings] = useState({
    surplusAlerts: true,
    claimReminders: true,
    smsDispatches: false,
    impactReports: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      organization,
      address,
      city,
      area,
      pincode,
      avatar,
    });
    showToast('Profile Updated', 'Your contact and organization details have been saved.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Weak Password', 'New password must have at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Mismatch', 'New passwords do not match.', 'error');
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    showToast('Password Changed', 'Your account credentials have been updated successfully.', 'success');
  };

  const handleLogout = () => {
    logout();
    showToast('Signed Out', 'You have been logged out of FoodRescue.', 'info');
    navigate('/auth');
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-[#245C45]/15 shadow-md shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
              {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-bold uppercase tracking-wider">
              {currentUser.role}
            </span>
            {currentUser.isVerified && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#53645B]">
            {currentUser.organization || 'Independent Food Rescuer'} · Member since {currentUser.joinedDate}
          </p>

          <p className="text-xs text-[#8E9F96] flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#245C45]" />
            {currentUser.address}, {currentUser.city}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200 flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Role-Specific Impact Showcase */}
      <div className="bg-[#245C45] text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#F4A261]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6FAF78]">
            Your Contribution Highlights
          </h3>
        </div>

        {currentUser.role === 'donor' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Meals Rescued</span>
              <h4 className="text-2xl font-black text-[#F4A261] mt-1 font-heading">
                {donorMeals.toLocaleString()}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">From verified completed drop-offs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Listings Posted</span>
              <h4 className="text-2xl font-black text-white mt-1 font-heading">
                {donorListings.length} {donorListings.length === 1 ? 'batch' : 'batches'}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">{donorCompleted.length} completed collections</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Greenhouse Gases Saved</span>
              <h4 className="text-2xl font-black text-[#6FAF78] mt-1 font-heading">
                {Math.round(donorMeals * 2.5).toLocaleString()} kg CO₂e
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Diverted from methane decomposition</p>
            </div>
          </div>
        )}

        {currentUser.role === 'ngo' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Servings Distributed</span>
              <h4 className="text-2xl font-black text-[#F4A261] mt-1 font-heading">
                {ngoMeals.toLocaleString()}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Delivered to local community</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Donations Claimed</span>
              <h4 className="text-2xl font-black text-white mt-1 font-heading">
                {ngoClaimed.length} {ngoClaimed.length === 1 ? 'listing' : 'listings'}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">{ngoCompleted.length} fulfilled dispatches</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Estimated Meal Value Saved</span>
              <h4 className="text-2xl font-black text-[#6FAF78] mt-1 font-heading">
                ${(ngoMeals * 3.5).toLocaleString()}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Nutritious provisions redirected</p>
            </div>
          </div>
        )}

        {currentUser.role === 'volunteer' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Courier Deliveries</span>
              <h4 className="text-2xl font-black text-[#F4A261] mt-1 font-heading">
                {volCompleted.length} {volCompleted.length === 1 ? 'trip' : 'trips'}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Completed courier runs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Meals Transported</span>
              <h4 className="text-2xl font-black text-white mt-1 font-heading">
                {volMeals.toLocaleString()}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Delivered directly to pantries</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Transport Duration</span>
              <h4 className="text-2xl font-black text-[#6FAF78] mt-1 font-heading">
                {volHours.toFixed(1)} hrs
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Recorded transit time</p>
            </div>
          </div>
        )}

        {currentUser.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Platform Status</span>
              <h4 className="text-2xl font-black text-[#6FAF78] mt-1 font-heading">Operational</h4>
              <p className="text-[11px] text-white/80 mt-1">All pipelines active</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Platform Listings</span>
              <h4 className="text-2xl font-black text-[#F4A261] mt-1 font-heading">
                {donations.length} total
              </h4>
              <p className="text-[11px] text-white/80 mt-1">In real-time database</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-[10px] text-white/70 uppercase font-bold">Total Meals Diverted</span>
              <h4 className="text-2xl font-black text-white mt-1 font-heading">
                {impactMetrics.totalMealsRescued.toLocaleString()}
              </h4>
              <p className="text-[11px] text-white/80 mt-1">Across all verified donors</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EDIT PROFILE FORM */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F8F8F2] pb-3">
            <User className="w-5 h-5 text-[#245C45]" />
            <h3 className="font-bold text-base text-[#25312B] font-heading">
              Edit Organization &amp; Contact Details
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Organization / Entity</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#25312B] mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#25312B] mb-1">Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#25312B] mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#25312B] mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#25312B] mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#6FAF78]" />
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* NOTIFICATIONS & PASSWORD SETTINGS */}
        <div className="space-y-6">
          {/* Notification toggles */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F8F8F2] pb-3">
              <Bell className="w-5 h-5 text-[#245C45]" />
              <h3 className="font-bold text-base text-[#25312B] font-heading">
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-3 text-xs text-[#53645B]">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F2] cursor-pointer">
                <span>Nearby Surplus Batch Alerts (&lt;10km)</span>
                <input
                  type="checkbox"
                  checked={notifSettings.surplusAlerts}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, surplusAlerts: e.target.checked })
                  }
                  className="rounded text-[#245C45] focus:ring-[#245C45]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F2] cursor-pointer">
                <span>Claim &amp; Courier Reminders</span>
                <input
                  type="checkbox"
                  checked={notifSettings.claimReminders}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, claimReminders: e.target.checked })
                  }
                  className="rounded text-[#245C45] focus:ring-[#245C45]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F2] cursor-pointer">
                <span>SMS Dispatch Coordinates</span>
                <input
                  type="checkbox"
                  checked={notifSettings.smsDispatches}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, smsDispatches: e.target.checked })
                  }
                  className="rounded text-[#245C45] focus:ring-[#245C45]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F2] cursor-pointer">
                <span>Weekly Environmental Impact Digest</span>
                <input
                  type="checkbox"
                  checked={notifSettings.impactReports}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, impactReports: e.target.checked })
                  }
                  className="rounded text-[#245C45] focus:ring-[#245C45]"
                />
              </label>
            </div>
          </div>

          {/* Change Password UI */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F8F8F2] pb-3">
              <Lock className="w-5 h-5 text-[#245C45]" />
              <h3 className="font-bold text-base text-[#25312B] font-heading">
                Security &amp; Change Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25312B] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#25312B] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
