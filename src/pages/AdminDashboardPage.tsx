import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Donation } from '../types';
import { DonationDetailModal } from '../components/donations/DonationDetailModal';
import { api } from '../services/api';
import {
  Users,
  CheckCircle2,
  ShieldCheck,
  Search,
  RefreshCw,
  Activity,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    donations,
    verificationRequests,
    reportedIssues,
    impactMetrics,
    approveVerification,
    rejectVerification,
    resolveIssue,
    refreshData,
    isLoading,
  } = useData();

  const [activeTab, setActiveTab] = useState<'analytics' | 'verifications' | 'donations' | 'issues'>('analytics');
  const [donationSearch, setDonationSearch] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(4);

  // Fetch real platform stats from backend
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const statsRes = await api.admin.stats();
        if (statsRes.success && statsRes.data?.stats?.totalUsers !== undefined) {
          setTotalUsersCount(statsRes.data.stats.totalUsers);
        } else {
          const usersRes = await api.admin.users();
          if (usersRes.success && usersRes.data?.users) {
            setTotalUsersCount(usersRes.data.users.length);
          }
        }
      } catch {
        // use fallback count
      }
    };
    fetchPlatformStats();
  }, []);

  // Compute dynamic Recharts data from real database donations
  const monthlyTrendsData = useMemo(() => {
    if (donations.length === 0) {
      return [{ month: 'Current', mealsRescued: 0, donations: 0 }];
    }

    const monthMap: Record<string, { mealsRescued: number; donations: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const d of donations) {
      const date = new Date(d.createdAt);
      const mName = monthNames[date.getMonth()] || 'Recent';
      if (!monthMap[mName]) {
        monthMap[mName] = { mealsRescued: 0, donations: 0 };
      }
      monthMap[mName].donations += 1;
      monthMap[mName].mealsRescued += d.estimatedPeopleServed || d.quantityValue || 0;
    }

    return Object.entries(monthMap).map(([month, data]) => ({
      month,
      mealsRescued: data.mealsRescued,
      donations: data.donations,
    }));
  }, [donations]);

  const categoryDistributionData = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const d of donations) {
      const cat = d.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (d.estimatedPeopleServed || d.quantityValue || 0);
    }

    const colors = ['#245C45', '#6FAF78', '#F4A261', '#E76F51', '#3B82F6', '#8B5CF6'];
    const entries = Object.entries(catMap);

    if (entries.length === 0) {
      return [{ name: 'No Data Yet', meals: 0, fill: '#8E9F96' }];
    }

    return entries.map(([name, meals], i) => ({
      name,
      meals,
      fill: colors[i % colors.length],
    }));
  }, [donations]);

  const locationDistributionData = useMemo(() => {
    const locMap: Record<string, number> = {};
    for (const d of donations) {
      const loc = d.area || d.city || 'Downtown';
      locMap[loc] = (locMap[loc] || 0) + 1;
    }

    const colors = ['#245C45', '#6FAF78', '#F4A261', '#3B82F6', '#EC4899'];
    const entries = Object.entries(locMap);

    if (entries.length === 0) {
      return [{ name: 'No Data', value: 1, color: '#E5EAE7' }];
    }

    return entries.map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [donations]);

  const filteredDonations = donations.filter((d) => {
    if (!donationSearch) return true;
    const q = donationSearch.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.donorName.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#245C45] text-white text-xs font-bold uppercase tracking-wider">
              Super Admin Console
            </span>
            <span className="text-xs text-[#53645B]">
              Director: {currentUser?.name || 'Platform Administrator'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
            FoodRescue Platform Governance &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#53645B] mt-1">
            Monitor real-time food diversion pipelines, stakeholder verifications, and incident resolution.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="p-2.5 bg-[#F8F8F2] hover:bg-[#E5EAE7] rounded-2xl text-[#53645B] transition-colors border border-[#E5EAE7]"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center bg-[#F8F8F2] border border-[#E5EAE7] rounded-2xl p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#245C45] text-white shadow-xs'
                  : 'text-[#53645B] hover:text-[#25312B]'
              }`}
            >
              Analytics &amp; Charts
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'verifications'
                  ? 'bg-[#245C45] text-white shadow-xs'
                  : 'text-[#53645B] hover:text-[#25312B]'
              }`}
            >
              <span>Verifications</span>
              {verificationRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'donations'
                  ? 'bg-[#245C45] text-white shadow-xs'
                  : 'text-[#53645B] hover:text-[#25312B]'
              }`}
            >
              Donations Feed
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'issues'
                  ? 'bg-[#245C45] text-white shadow-xs'
                  : 'text-[#53645B] hover:text-[#25312B]'
              }`}
            >
              Incidents ({reportedIssues.length})
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards - Calculated from verified DB records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={totalUsersCount}
          subtitle="Donors, NGOs, couriers"
          icon={Users}
          accentColor="primary"
        />
        <StatCard
          label="Lifetime Meals Rescued"
          value={impactMetrics.totalMealsRescued}
          subtitle="Saved from methane decomposition"
          icon={Flame}
          accentColor="secondary"
        />
        <StatCard
          label="Pending Verifications"
          value={verificationRequests.filter((r) => r.status === 'pending').length}
          subtitle="Awaiting admin review"
          icon={ShieldCheck}
          accentColor="accent"
        />
        <StatCard
          label="Estimated CO2 Diverted"
          value={`${impactMetrics.co2DivertedKg.toLocaleString()} kg`}
          subtitle="Carbon equivalent saved"
          icon={Activity}
          accentColor="blue"
        />
      </div>

      {/* 1. ANALYTICS & CHARTS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Meals Rescued over time */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE7] shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#25312B] font-heading">
                  Surplus Meals Rescued Over Time
                </h3>
                <p className="text-xs text-[#53645B]">Real-time aggregation from live database records</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendsData}>
                    <defs>
                      <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#245C45" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#245C45" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EB" />
                    <XAxis dataKey="month" stroke="#8E9F96" fontSize={12} />
                    <YAxis stroke="#8E9F96" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5EAE7',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mealsRescued"
                      stroke="#245C45"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMeals)"
                      name="Meals Rescued"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE7] shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#25312B] font-heading">
                  Meals Rescued by Food Category
                </h3>
                <p className="text-xs text-[#53645B]">Distribution across food inventory types</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EB" />
                    <XAxis dataKey="name" stroke="#8E9F96" fontSize={11} interval={0} />
                    <YAxis stroke="#8E9F96" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5EAE7',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="meals" radius={[8, 8, 0, 0]} name="Meals Rescued">
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Geographic Distribution Pie */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE7] shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#25312B] font-heading">
                  Donations by Urban Zone
                </h3>
                <p className="text-xs text-[#53645B]">Geographic density of surplus donation dispatches</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={4}
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {locationDistributionData.map((entry, index) => (
                        <Cell key={`slice-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFICATIONS TAB */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#25312B] font-heading">
              Organization Verification Queue ({verificationRequests.length})
            </h3>
          </div>

          {verificationRequests.length === 0 ? (
            <div className="p-8 text-center border border-[#E5EAE7] rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-70" />
              <h4 className="font-bold text-sm text-[#25312B]">Verification Queue Clear</h4>
              <p className="text-xs text-[#53645B] mt-1">No organizations currently awaiting accreditation review.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F8F8F2] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#8E9F96] font-bold uppercase tracking-wider border-b border-[#E5EAE7]">
                    <th className="pb-3">Organization</th>
                    <th className="pb-3">Representative</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Submitted</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F8F2]">
                  {verificationRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#F8F8F2]/60">
                      <td className="py-4 font-bold text-[#25312B]">{req.organizationName}</td>
                      <td className="py-4 text-[#53645B]">{req.user?.name || 'Applicant'}</td>
                      <td className="py-4 text-[#53645B]">{req.user?.city || 'Metropolis'}</td>
                      <td className="py-4 text-[#8E9F96]">{req.submittedAt?.slice(0, 10)}</td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            req.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveVerification(req.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectVerification(req.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. DONATIONS FEED TAB */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-[#25312B] font-heading">
              Platform Donations Master Feed ({filteredDonations.length})
            </h3>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-[#8E9F96] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                placeholder="Search donations by title, ID, donor..."
                className="w-full pl-9 pr-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#8E9F96] font-bold uppercase tracking-wider border-b border-[#E5EAE7]">
                  <th className="pb-3">Title &amp; ID</th>
                  <th className="pb-3">Donor</th>
                  <th className="pb-3">Recipient NGO</th>
                  <th className="pb-3">Courier</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F8F2]">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F8F8F2]/60">
                    <td className="py-4">
                      <div className="font-bold text-[#25312B]">{d.title}</div>
                      <div className="text-[10px] text-[#8E9F96] font-mono">#{d.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-4 text-[#53645B]">{d.donorName}</td>
                    <td className="py-4 text-[#53645B]">{d.claimedByNgoName || '—'}</td>
                    <td className="py-4 text-[#53645B]">{d.assignedVolunteerName || '—'}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDonation(d);
                          setIsDetailOpen(true);
                        }}
                        className="px-3 py-1 bg-[#F8F8F2] hover:bg-[#E5EAE7] text-[#25312B] font-bold rounded-lg"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. INCIDENTS TAB */}
      {activeTab === 'issues' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#25312B] font-heading">
              Reported Incidents &amp; Quality Feedback ({reportedIssues.length})
            </h3>
          </div>

          {reportedIssues.length === 0 ? (
            <div className="p-8 text-center border border-[#E5EAE7] rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-70" />
              <h4 className="font-bold text-sm text-[#25312B]">Zero Open Incidents</h4>
              <p className="text-xs text-[#53645B] mt-1">All quality reports and donor feedback are resolved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl border border-[#E5EAE7] bg-[#F8F8F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        {issue.issueType}
                      </span>
                      <span className="text-[10px] text-[#8E9F96]">#{issue.id.slice(0, 8)}</span>
                      <span className="text-[10px] font-bold capitalize text-[#53645B]">
                        Status: {issue.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#25312B]">{issue.description}</p>
                    <p className="text-[10px] text-[#8E9F96]">
                      Reported by {issue.user?.name || 'User'} on {issue.createdAt?.slice(0, 10)}
                    </p>
                  </div>

                  {issue.status !== 'resolved' && (
                    <button
                      onClick={() => resolveIssue(issue.id)}
                      className="px-3.5 py-1.5 bg-[#245C45] hover:bg-[#1B4534] text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
