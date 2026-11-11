import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, student, refreshUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appsRes, scholRes] = await Promise.all([
        api.get('/applications'),
        api.get('/scholarships'),
      ]);
      if (appsRes.success) setApplications(appsRes.data);
      if (scholRes.success) setScholarships(scholRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completeness
  const profileFields = [
    student?.department,
    student?.cgpa,
    student?.study_year,
    student?.annual_family_income,
    student?.domicile_state,
    student?.category,
  ];
  const filledCount = profileFields.filter((f) => f !== undefined && f !== null && f !== '').length;
  const completeness = Math.round((filledCount / profileFields.length) * 100);

  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const inReviewCount = applications.filter((a) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'CLARIFICATION_REQUESTED', 'RESUBMITTED', 'VERIFIED'].includes(a.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your scholarship applications, complete requirements, and monitor faculty reviews.
          </p>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 w-full md:w-72 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-brand-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Profile Completeness
            </span>
            <span className="text-brand-700">{completeness}%</span>
          </div>
          <div className="w-full bg-brand-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <Link
              to="/student/profile"
              className="text-[11px] font-bold text-brand-700 hover:text-brand-800 underline mt-2 block text-right"
            >
              Complete profile &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={applications.length}
          subtitle="Submitted or draft"
          icon={FileText}
          color="brand"
        />
        <StatCard
          title="Under Review"
          value={inReviewCount}
          subtitle="Assigned to faculty"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Scholarships"
          value={approvedCount}
          subtitle="Final grants secured"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Open Opportunities"
          value={scholarships.length}
          subtitle="Available to apply"
          icon={Sparkles}
          color="indigo"
        />
      </div>

      {/* Clarification Alert if any */}
      {applications.some((a) => a.status === 'CLARIFICATION_REQUESTED') && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Clarification Requested by Verifier</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                One or more of your applications requires additional information or replacement certificates.
              </p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm shrink-0"
          >
            Review & Respond
          </Link>
        </div>
      )}

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Status and tracking timeline</p>
          </div>
          <Link
            to="/student/applications"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">You haven't submitted any applications yet.</p>
            <Link
              to="/student/eligible-scholarships"
              className="mt-3 inline-block px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
            >
              Check Eligible Scholarships
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Scholarship</th>
                  <th className="px-6 py-3">Submitted At</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.scholarship_title}</p>
                      <span className="text-xs text-emerald-700 font-medium">
                        ₹{Number(app.scholarship_award).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Draft'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/student/applications/${app.application_id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                      >
                        Details &rarr;
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
