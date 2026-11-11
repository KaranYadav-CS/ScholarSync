import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { FileText, ArrowRight, Clock, Plus } from 'lucide-react';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/applications')
      .then((res) => {
        if (res.success) setApplications(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, uploaded documents, verifier review comments, and final decisions.
          </p>
        </div>

        <Link
          to="/student/eligible-scholarships"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> New Application
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-500">
            You have not applied for any scholarships yet. Explore available opportunities!
          </p>
          <Link
            to="/student/eligible-scholarships"
            className="inline-block px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg"
          >
            Check Eligibility
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Scholarship</th>
                  <th className="px-6 py-3.5">Award Amount</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.scholarship_title}</p>
                      <p className="text-xs text-slate-400">Ref: {app.application_id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₹{Number(app.scholarship_award).toLocaleString()}
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition"
                      >
                        Timeline & Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
