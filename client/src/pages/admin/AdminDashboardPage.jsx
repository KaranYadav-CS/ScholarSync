import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  Award,
  FileCheck2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Users,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, appsRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/applications'),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (appsRes.success) setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const needingAssignment = applications.filter((a) => a.status === 'SUBMITTED').length;
  const needingDecision = applications.filter((a) =>
    ['RECOMMENDED_FOR_APPROVAL', 'RECOMMENDED_FOR_REJECTION', 'VERIFIED'].includes(a.status)
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Administrative Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional scholarship governance, faculty verification assignments, and final grant decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/scholarships/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            + New Scholarship
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={overview?.totalApplications || 0}
          subtitle={`${overview?.totalDraft || 0} drafts in progress`}
          icon={FileCheck2}
          color="brand"
        />
        <StatCard
          title="Pending Decisions"
          value={needingDecision}
          subtitle="Awaiting final admin review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Grants"
          value={overview?.totalApproved || 0}
          subtitle={`${overview?.totalRejected || 0} rejected`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Total Disbursed"
          value={`₹${Number(overview?.totalDisbursed || 0).toLocaleString()}`}
          subtitle="Cumulative allocated funds"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Action alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-blue-900">
              {needingAssignment} Applications Need Verifier Assignment
            </h4>
            <p className="text-xs text-blue-700 mt-0.5">
              Assign submitted student applications to faculty reviewers.
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
          >
            Assign Verifiers
          </Link>
        </div>

        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              {needingDecision} Applications Ready for Decision
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Faculty verifiers have submitted recommendations.
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition"
          >
            Review Decisions
          </Link>
        </div>
      </div>

      {/* Applications Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Application Review Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status across all departments</p>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            View all ({applications.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading applications...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Scholarship</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Assigned Verifier</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 6).map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.student_name}</p>
                      <p className="text-xs text-slate-400">CGPA: {app.cgpa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{app.scholarship_title}</p>
                      <span className="text-xs text-emerald-700 font-semibold">
                        ₹{Number(app.scholarship_award).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{app.department}</td>
                    <td className="px-6 py-4 text-xs">
                      {app.verifier_name ? (
                        <span className="font-semibold text-slate-800">{app.verifier_name}</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/admin/applications"
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
