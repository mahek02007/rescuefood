import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NotificationDropdown } from './NotificationDropdown';
import { LocationPicker } from '../map/LocationPicker';
import {
  Leaf,
  Bell,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  HeartHandshake,
  PackagePlus,
  Search,
  Bike,
  Info,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onSelectDonation?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectDonation }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { unreadNotificationCount } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/', icon: Leaf },
    { label: 'Find Food', path: '/find-food', icon: Search, badge: 'NGO' },
    { label: 'Donate Food', path: '/donate', icon: PackagePlus, badge: 'Donor' },
    { label: 'Volunteer', path: '/volunteer', icon: Bike, badge: 'Courier' },
    { label: 'About & Impact', path: '/about', icon: Info },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ label: 'Admin Hub', path: '/admin', icon: BarChart3, badge: 'Admin' });
  }

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5EAE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#245C45] flex items-center justify-center text-white shadow-md shadow-[#245C45]/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-[#6FAF78]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#25312B] tracking-tight font-heading">
                  Food<span className="text-[#245C45]">Rescue</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4A261]" />
              </div>
              <p className="text-[10px] text-[#53645B] tracking-wide font-medium hidden sm:block">
                Share More. Waste Less.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#EBF5ED] text-[#245C45]'
                      : 'text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2]'
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-[#245C45]' : 'text-[#8E9F96]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compact Location Pill */}
            <div className="hidden lg:block">
              <LocationPicker compact={true} showRadiusSelector={false} />
            </div>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-xl text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] border border-transparent hover:border-[#E5EAE7] transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                onSelectDonation={onSelectDonation}
              />
            </div>

            {/* User Profile Menu */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-[#F8F8F2] border border-transparent hover:border-[#E5EAE7] transition-all"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#6FAF78]/30"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-[#25312B] leading-none max-w-[100px] truncate">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] text-[#245C45] font-semibold capitalize inline-block mt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8E9F96] hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <div className="absolute right-0 top-12 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5EAE7] p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="p-3 border-b border-[#F8F8F2]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#245C45]/20"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#25312B] truncate">{currentUser.name}</p>
                            <p className="text-xs text-[#8E9F96] truncate">{currentUser.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="px-2 py-0.5 rounded-md bg-[#EBF5ED] text-[#245C45] text-[10px] font-bold uppercase tracking-wider">
                                {currentUser.role}
                              </span>
                              {currentUser.isVerified && (
                                <span className="flex items-center text-[10px] text-emerald-600 font-semibold gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-[#8E9F96]" />
                          Profile & Settings
                        </Link>
                        {currentUser.role === 'donor' && (
                          <Link
                            to="/donate"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
                          >
                            <PackagePlus className="w-4 h-4 text-[#8E9F96]" />
                            Donor Dashboard
                          </Link>
                        )}
                        {currentUser.role === 'ngo' && (
                          <Link
                            to="/find-food"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
                          >
                            <HeartHandshake className="w-4 h-4 text-[#8E9F96]" />
                            NGO Kitchen Portal
                          </Link>
                        )}
                        {currentUser.role === 'volunteer' && (
                          <Link
                            to="/volunteer"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
                          >
                            <Bike className="w-4 h-4 text-[#8E9F96]" />
                            Courier Tasks
                          </Link>
                        )}
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#53645B] hover:text-[#25312B] hover:bg-[#F8F8F2] rounded-xl transition-colors"
                        >
                          <Shield className="w-4 h-4 text-[#8E9F96]" />
                          Admin Console
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-[#F8F8F2]">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-xl bg-[#245C45] hover:bg-[#1B4534] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                Sign In / Register
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#53645B] hover:bg-[#F8F8F2] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5EAE7] bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4">
          <div className="mb-3">
            <LocationPicker compact={true} showRadiusSelector={true} />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-[#EBF5ED] text-[#245C45]' : 'text-[#53645B] hover:bg-[#F8F8F2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#F8F8F2] text-[#53645B]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {isAuthenticated && (
            <div className="pt-3 border-t border-[#F8F8F2] flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#245C45] flex items-center gap-1.5"
              >
                <User className="w-4 h-4" /> View My Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs font-semibold text-red-600 flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
