import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5EAE7] text-[#53645B] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#245C45] flex items-center justify-center text-white shadow-md shadow-[#245C45]/20">
                <Leaf className="w-5 h-5 text-[#6FAF78]" />
              </div>
              <span className="text-xl font-extrabold text-[#25312B] tracking-tight font-heading">
                Food<span className="text-[#245C45]">Rescue</span>
              </span>
            </Link>
            <p className="text-sm text-[#53645B] leading-relaxed max-w-sm">
              Empowering communities to reduce food waste, support local soup kitchens, and redistribute surplus banquet and grocery provisions to those who need them most.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5ED] text-[#245C45] text-xs font-semibold border border-[#6FAF78]/30">
                <ShieldCheck className="w-4 h-4" />
                Food Safety Certified Protocols
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#25312B] mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/find-food" className="hover:text-[#245C45] transition-colors">
                  Find Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-[#245C45] transition-colors">
                  Donate Surplus Meals
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-[#245C45] transition-colors">
                  Volunteer Courier Hub
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#245C45] transition-colors">
                  Environmental Impact
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#245C45] transition-colors">
                  Admin Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#25312B] mb-4">
              Safety & Standards
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-[#245C45] cursor-pointer">Hygiene Checklist</li>
              <li className="hover:text-[#245C45] cursor-pointer">Cold Chain Storage</li>
              <li className="hover:text-[#245C45] cursor-pointer">Good Samaritan Act</li>
              <li className="hover:text-[#245C45] cursor-pointer">Packaging Guidelines</li>
              <li className="hover:text-[#245C45] cursor-pointer">NGO Verification FAQ</li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#25312B] mb-4">
              Headquarters
            </h4>
            <div className="space-y-2.5 text-xs text-[#53645B]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#245C45] shrink-0 mt-0.5" />
                <span>100 Green Planet Tower, Suite 1800, Metropolis Hub</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#245C45] shrink-0" />
                <span>+1 (800) 555-FOOD (3663)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#245C45] shrink-0" />
                <span>partnerships@foodrescue.org</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#E5EAE7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E9F96]">
          <p>© {new Date().getFullYear()} FoodRescue Initiative. All rights reserved. Simulated Demo Environment.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#25312B] cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-[#25312B] cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-[#25312B] cursor-pointer">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
