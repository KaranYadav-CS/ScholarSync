import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Award, Plus, CheckCircle2, XCircle, Clock, Edit } from 'lucide-react';

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships');
      if (res.success) setScholarships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await api.post(`/scholarships/${id}/publish`);
      if (res.success) {
        setMessage('Scholarship published successfully.');
        fetchScholarships();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleClose = async (id) => {
    try {
      const res = await api.post(`/scholarships/${id}/close`);
      if (res.success) {
        setMessage('Scholarship closed.');
        fetchScholarships();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-brand-600" />
            Scholarship Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create opportunities, configure allowlisted eligibility criteria, publish or close programs.
          </p>
        </div>

        <Link
          to="/admin/scholarships/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Create Scholarship
        </Link>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Title & Provider</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Grant Amount</th>
                <th className="px-6 py-3.5">Deadline</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scholarships.map((s) => (
                <tr key={s.scholarship_id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{s.title}</p>
                    <p className="text-xs text-brand-600">{s.provider}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">{s.category}</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">
                    ₹{Number(s.award_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(s.deadline_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.status === 'CLOSED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {s.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(s.scholarship_id)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                      >
                        Publish
                      </button>
                    )}
                    {s.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleClose(s.scholarship_id)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                      >
                        Close
                      </button>
                    )}
                    <Link
                      to={`/scholarships/${s.scholarship_id}`}
                      className="px-2.5 py-1 text-brand-600 hover:text-brand-800 text-xs font-semibold"
                    >
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
