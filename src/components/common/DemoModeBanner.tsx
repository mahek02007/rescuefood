import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { Sparkles, Shield, RotateCcw, ChevronRight, Check } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const { resetDemoData } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: string; desc: string }[] = [
    { role: 'donor', label: 'Food Donor', icon: '🍽️', desc: 'Post surplus buffets, view donor stats & listings' },
    { role: 'ngo', label: 'NGO / Recipient', icon: '🤝', desc: 'Browse available food, claim meals with radius filter' },
    { role: 'volunteer', label: 'Volunteer Courier', icon: '🚲', desc: 'Accept pickup tasks, upload delivery proof' },
    { role: 'admin', label: 'Platform Admin', icon: '⚡', desc: 'Manage verifications, view Recharts platform analytics' },
  ];

  return (
    <div className="bg-[#245C45] text-white border-b border-[#1B4534] text-xs py-1.5 px-4 shadow-xs relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-bold text-[#EBF5ED] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#F4A261]" />
            Demo Mode Active
          </span>
          <span className="hidden sm:inline text-white/80">
            Current Persona: <strong className="text-white capitalize">{currentUser?.role || 'Guest'}</strong> ({currentUser?.name})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              <span>Switch Demo Persona</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 top-8 mt-1 w-72 bg-white text-[#25312B] rounded-2xl shadow-2xl border border-[#E5EAE7] p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#F8F8F2] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8E9F96] uppercase tracking-wider">
                      Instant Persona Switcher
                    </span>
                    <span className="text-[10px] text-[#245C45] font-semibold">1-Click Test</span>
                  </div>

                  <div className="py-1 space-y-1">
                    {roles.map((r) => {
                      const isActive = currentUser?.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-[#EBF5ED] text-[#245C45] font-bold'
                              : 'hover:bg-[#F8F8F2] text-[#25312B]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{r.icon}</span>
                            <div>
                              <div className="text-xs font-semibold leading-tight">{r.label}</div>
                              <div className="text-[10px] text-[#53645B] font-normal line-clamp-1">{r.desc}</div>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-[#245C45] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#F8F8F2] px-1">
                    <button
                      onClick={() => {
                        resetDemoData();
                        setIsOpen(false);
                      }}
                      className="w-full py-1.5 text-center text-[11px] text-[#8E9F96] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Demo Mock Data
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
