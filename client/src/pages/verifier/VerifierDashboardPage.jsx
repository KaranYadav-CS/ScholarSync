import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { CheckSquare, Clock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VerifierDashboardPage() {
  const [assignedApps, setAssignedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssigned();
  }, []);

  const fetchAssigned = async () => {
    try {
      const res = await api.get('/applications');
      if (res.success) setAssignedApps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingReview = assignedApps.filter((a) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'RESUBMITTED'].includes(a.status)
  ).length;
  const awaitingClarification = assignedApps.filter(
    (a) => a.status === 'CLARIFICATION_REQUESTED'
  ).length;
  const recommendedCount = assignedApps.filter((a) =>
    ['RECOMMENDED_FOR_APPROVAL', 'RECOMMENDED_FOR_REJECTION', 'APPROVED', 'REJECTED'].includes(
      a.status
    )
  ).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-brand-600" />
          Faculty Verification Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review assigned student scholarship applications, verify supporting certificates, and submit recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Awaiting Review"
          value={pendingReview}
          subtitle="Ready for document check"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Clarification Pending"
          value={awaitingClarification}
          subtitle="Awaiting student response"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Recommendations Completed"
          value={recommendedCount}
          subtitle="Sent to admin queue"
          icon={ShieldCheck}
          color="green"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Assigned Applications Queue</h2>
          <span className="text-xs font-semibold text-slate-500">
            {assignedApps.length} Total Assigned
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading queue...</div>
        ) : assignedApps.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No applications are currently assigned to your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Scholarship</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedApps.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.student_name}</p>
                      <p className="text-xs text-slate-400">CGPA: {app.cgpa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{app.scholarship_title}</p>
                      <span className="text-xs text-emerald-700 font-bold">
                        ₹{Number(app.scholarship_award).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{app.department}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/verifier/applications/${app.application_id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition"
                      >
                        Review Case <ArrowRight className="w-3.5 h-3.5" />
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
