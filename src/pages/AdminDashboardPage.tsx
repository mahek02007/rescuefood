import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Donation } from '../types';
import { DonationDetailModal } from '../components/donations/DonationDetailModal';
import {
  Users,
  Building,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  XCircle,
  FileCheck,
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
  Legend,
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
  } = useData();

  const [activeTab, setActiveTab] = useState<'analytics' | 'verifications' | 'donations' | 'issues'>('analytics');
  const [donationSearch, setDonationSearch] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Recharts Chart Data:
  const monthlyTrendsData = [
    { month: 'Apr', mealsRescued: 8200, donations: 42 },
    { month: 'May', mealsRescued: 11400, donations: 64 },
    { month: 'Jun', mealsRescued: 14100, donations: 78 },
    { month: 'Jul', mealsRescued: 16500, donations: 91 },
    { month: 'Aug', mealsRescued: 17200, donations: 98 },
    { month: 'Sep', mealsRescued: impactMetrics.totalMealsRescued, donations: 114 },
  ];

  const categoryDistributionData = [
    { name: 'Cooked Meals', meals: 7800, fill: '#245C45' },
    { name: 'Bakery', meals: 3400, fill: '#6FAF78' },
    { name: 'Fresh Fruits', meals: 2900, fill: '#F4A261' },
    { name: 'Vegetables', meals: 2400, fill: '#E76F51' },
    { name: 'Dairy & Packaged', meals: 1950, fill: '#3B82F6' },
  ];

  const locationDistributionData = [
    { name: 'Downtown Hub', value: 45, color: '#245C45' },
    { name: 'Northside Commercial', value: 25, color: '#6FAF78' },
    { name: 'East Valley Zone', value: 18, color: '#F4A261' },
    { name: 'West Bay University', value: 12, color: '#3B82F6' },
  ];

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
            <span className="text-xs text-[#53645B]">System Director: Elena Rostova</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25312B] font-heading">
            FoodRescue Platform Governance &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#53645B] mt-1">
            Monitor real-time food diversion pipelines, stakeholder verifications, and incident resolution.
          </p>
        </div>

        {/* Tab switcher */}
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
            <span className="w-2 h-2 rounded-full bg-amber-500" />
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value="142"
          subtitle="Donors, NGOs, couriers"
          icon={Users}
          accentColor="primary"
          trend="+14% this month"
        />
        <StatCard
          label="Lifetime Meals Rescued"
          value={impactMetrics.totalMealsRescued}
          subtitle="Saved from methane decomposition"
          icon={Flame}
          accentColor="secondary"
          trend="99.2% success"
        />
        <StatCard
          label="Pending Verifications"
          value={verificationRequests.filter((r) => r.status === 'pending').length}
          subtitle="Awaiting admin sign-off"
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
                  Surplus Meals Rescued Over Time (Monthly)
                </h3>
                <p className="text-xs text-[#53645B]">Consistent upward trend in meal redistribution volume</p>
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
                <p className="text-xs text-[#53645B]">Cooked banquet buffets form the largest redistribution volume</p>
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
                  Donations by Urban Sector
                </h3>
                <p className="text-xs text-[#53645B]">Downtown hotel density drives highest surplus density</p>
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

            {/* Performance KPIs Box */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE7] shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#25312B] font-heading">
                  Fulfillment Reliability &amp; Efficiency
                </h3>
                <p className="text-xs text-[#53645B]">Key logistics benchmarks across platform</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#25312B]">Successful vs Cancelled Ratio</span>
                    <span className="text-emerald-600">96.8% Success</span>
                  </div>
                  <div className="w-full bg-[#F8F8F2] h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#245C45] h-full" style={{ width: '96.8%' }} />
                    <div className="bg-red-400 h-full" style={{ width: '3.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#25312B]">Average Courier Dispatch Time</span>
                    <span className="text-[#245C45]">14.2 mins</span>
                  </div>
                  <div className="w-full bg-[#F8F8F2] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#6FAF78] h-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#25312B]">Cold Chain Safety Compliance</span>
                    <span className="text-[#F4A261]">99.4% Verified</span>
                  </div>
                  <div className="w-full bg-[#F8F8F2] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#F4A261] h-full" style={{ width: '99.4%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFICATIONS TAB */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#25312B] font-heading">
                Pending Entity Verification Requests
              </h3>
              <p className="text-xs text-[#53645B] mt-0.5">
                Review food safety certificates and 501(c)(3) nonprofit licenses for instant approval.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F8F8F2]">
            {verificationRequests.map((req) => (
              <div
                key={req.id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8E9F96]">#{req.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        req.role === 'ngo' ? 'bg-[#EBF5ED] text-[#245C45]' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {req.role}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        req.status === 'verified'
                          ? 'text-emerald-600'
                          : req.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      Status: {req.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#25312B]">{req.organizationName}</h4>
                  <p className="text-xs text-[#53645B]">
                    Applicant: {req.applicantName} ({req.email}) · {req.address}
                  </p>
                  <p className="text-xs font-mono text-[#245C45] bg-[#F8F8F2] px-2 py-1 rounded inline-block">
                    📄 {req.documentType}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => approveVerification(req.id)}
                        className="px-4 py-2 bg-[#245C45] hover:bg-[#1B4534] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#6FAF78]" />
                        Approve Partner
                      </button>
                      <button
                        onClick={() => rejectVerification(req.id)}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-[#8E9F96] bg-[#F8F8F2] px-3 py-1.5 rounded-xl">
                      Decision Recorded ({req.status})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DONATIONS MANAGEMENT TAB */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#25312B] font-heading">
              Platform Surplus Database ({filteredDonations.length})
            </h3>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8E9F96] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                placeholder="Search by ID, title, donor..."
                className="w-full pl-9 pr-3.5 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F2] text-[#8E9F96] uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3">Listing ID</th>
                  <th className="py-3 px-3">Food Title</th>
                  <th className="py-3 px-3">Donor</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Recipient NGO</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F8F2]">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F8F8F2]/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#245C45]">#{d.id}</td>
                    <td className="py-3 px-3 font-semibold text-[#25312B] max-w-[200px] truncate">{d.title}</td>
                    <td className="py-3 px-3 text-[#53645B]">{d.donorOrg || d.donorName}</td>
                    <td className="py-3 px-3 font-semibold text-[#25312B]">{d.quantityValue} {d.quantityUnit}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold px-2 py-0.5 rounded-full text-[10px] bg-[#EBF5ED] text-[#245C45]">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#53645B]">{d.claimedByNgoName || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedDonation(d);
                          setIsDetailOpen(true);
                        }}
                        className="text-[#245C45] font-bold hover:underline"
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

      {/* 4. REPORTED INCIDENTS TAB */}
      {activeTab === 'issues' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE7] shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#25312B] font-heading">
              Reported Operational Incidents
            </h3>
            <p className="text-xs text-[#53645B] mt-0.5">
              Pickup delays, packaging issues, and donor communication tickets.
            </p>
          </div>

          <div className="space-y-4">
            {reportedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5EAE7] flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8E9F96]">#{issue.id}</span>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      Severity: {issue.severity}
                    </span>
                    <span className="text-xs text-[#53645B]">Reported by {issue.reportedBy}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#25312B]">{issue.category} Issue</h4>
                  <p className="text-xs text-[#53645B] leading-relaxed">{issue.description}</p>
                </div>

                <span className="px-3 py-1 bg-white border border-[#E5EAE7] text-xs font-bold rounded-xl text-[#245C45] shrink-0">
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
