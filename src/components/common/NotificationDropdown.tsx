import React from 'react';
import { Bell, CheckCheck, Trash2, X, AlertCircle, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDonation?: (donationId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onSelectDonation,
}) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  } = useData();

  if (!isOpen) return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <Package className="w-4 h-4 text-[#245C45]" />;
      case 'claim':
        return <AlertCircle className="w-4 h-4 text-[#D97706]" />;
      case 'pickup':
        return <Truck className="w-4 h-4 text-[#2563EB]" />;
      case 'delivery':
        return <CheckCircle2 className="w-4 h-4 text-[#059669]" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#53645B]" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5EAE7] z-50 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#F8F8F2] border-b border-[#E5EAE7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#25312B]">Notifications</h4>
            {unreadNotificationCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#245C45] text-white">
                {unreadNotificationCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-[#53645B] hover:text-[#245C45] hover:bg-white text-xs transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                title="Clear all notifications"
                className="p-1.5 rounded-lg text-[#53645B] hover:text-red-600 hover:bg-white text-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E9F96] hover:text-[#25312B] hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#F8F8F2]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EBF5ED] text-[#245C45] flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-sm font-semibold text-[#25312B]">All caught up!</p>
              <p className="text-xs text-[#8E9F96] mt-0.5">No notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.donationId && onSelectDonation) {
                    onSelectDonation(notif.donationId);
                    onClose();
                  }
                }}
                className={`p-3.5 hover:bg-[#F8F8F2] transition-colors cursor-pointer flex items-start gap-3 ${
                  !notif.read ? 'bg-[#EBF5ED]/30' : ''
                }`}
              >
                <div className="p-2 rounded-xl bg-white border border-[#E5EAE7] shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs font-bold leading-tight ${!notif.read ? 'text-[#245C45]' : 'text-[#25312B]'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-[#8E9F96] shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#53645B] line-clamp-2 leading-relaxed">{notif.message}</p>
                  {notif.donationId && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-[#245C45] hover:underline">
                      View Listing #{notif.donationId} →
                    </span>
                  )}
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#245C45] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
