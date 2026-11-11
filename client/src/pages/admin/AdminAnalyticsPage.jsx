import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle2, Building, DollarSign } from 'lucide-react';

const COLORS = ['#1b64a8', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [scholData, setScholData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overRes, deptRes, scholRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/by-department'),
        api.get('/admin/analytics/by-scholarship'),
      ]);

      if (overRes.success) setOverview(overRes.data);
      if (deptRes.success) setDeptData(deptRes.data);
      if (scholRes.success) setScholData(scholRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusPieData = overview
    ? [
        { name: 'Approved', value: overview.totalApproved },
        { name: 'Under Review', value: overview.totalPending },
        { name: 'Rejected', value: overview.totalRejected },
        { name: 'Draft', value: overview.totalDraft },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-brand-600" />
          Scholarship Analytics & Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational reporting powered by Azure SQL aggregation views. Excludes private student PII.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={overview?.totalApplications || 0}
          subtitle="All lifecycle stages"
          icon={BarChart3}
          color="brand"
        />
        <StatCard
          title="Total Approved Grants"
          value={overview?.totalApproved || 0}
          subtitle={`${overview?.totalRejected || 0} rejected`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Total Funds Disbursed"
          value={`₹${Number(overview?.totalDisbursed || 0).toLocaleString()}`}
          subtitle="Direct student fee subsidies"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Published Opportunities"
          value={overview?.publishedScholarships || 0}
          subtitle={`Across ${deptData.length} departments`}
          icon={Building}
          color="amber"
        />
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">Loading analytics charts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Department Applications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Application Distribution by Department
              </h3>
              <p className="text-xs text-slate-500">
                Total submissions vs. approved grants across faculties
              </p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Total Applications" fill="#1b64a8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Breakdown Pie */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Application Lifecycle Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Proportion of active cases, approvals, and decisions
              </p>
            </div>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Fund Allocation by Scholarship */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Fund Disbursement per Scholarship Program
              </h3>
              <p className="text-xs text-slate-500">
                Total grant capital awarded based on verified approvals (INR ₹)
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scholData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total_disbursed" name="Funds Disbursed (₹)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
