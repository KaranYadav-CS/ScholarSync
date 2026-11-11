import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  FileCheck2,
  UserCheck,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Eye,
} from 'lucide-react';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVerifierId, setSelectedVerifierId] = useState('');
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('APPROVED');
  const [decisionReason, setDecisionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchVerifiers();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'All' ? `/applications?status=${statusFilter}` : '/applications';
      const res = await api.get(endpoint);
      if (res.success) setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiers = async () => {
    try {
      // In demo mode or production, query users with role VERIFIER
      const res = await api.get('/admin/users');
      if (res.success) {
        setVerifiers(res.data.filter((u) => u.role === 'VERIFIER' && u.account_status === 'ACTIVE'));
      }
    } catch (err) {
      // fallback
      setVerifiers([
        { user_id: '33333333-3333-3333-3333-333333333333', full_name: 'Prof. Robert Jenkins' },
      ]);
    }
  };

  const handleOpenAssign = (app) => {
    setSelectedApp(app);
    setSelectedVerifierId(app.assigned_verifier_user_id || verifiers[0]?.user_id || '');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp || !selectedVerifierId) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/applications/${selectedApp.application_id}/assign-verifier`, {
        verifier_user_id: selectedVerifierId,
      });
      if (res.success) {
        setNotification(`Verifier assigned to ${selectedApp.student_name}'s application.`);
        setAssignModalOpen(false);
        fetchApplications();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDecision = (app) => {
    setSelectedApp(app);
    setDecisionType(app.status === 'RECOMMENDED_FOR_REJECTION' ? 'REJECTED' : 'APPROVED');
    setDecisionReason('');
    setDecisionModalOpen(true);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp || !decisionReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/applications/${selectedApp.application_id}/decision`, {
        status: decisionType,
        reason: decisionReason.trim(),
      });
      if (res.success) {
        setNotification(`Application for ${selectedApp.student_name} marked as ${decisionType}.`);
        setDecisionModalOpen(false);
        fetchApplications();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const statuses = [
    'All',
    'SUBMITTED',
    'UNDER_REVIEW',
    'CLARIFICATION_REQUESTED',
    'RECOMMENDED_FOR_APPROVAL',
    'RECOMMENDED_FOR_REJECTION',
    'APPROVED',
    'REJECTED',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-7 h-7 text-brand-600" />
            Applications & Final Decision Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign applications to faculty verifiers and execute official grant approval/rejection decisions.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          {notification}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Scholarship</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Assigned Verifier</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No applications match the selected status filter.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{app.student_name}</p>
                      <p className="text-xs text-slate-400">CGPA: {app.cgpa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.scholarship_title}</p>
                      <span className="text-xs text-emerald-700 font-bold">
                        ₹{Number(app.scholarship_award).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{app.department}</td>
                    <td className="px-6 py-4 text-xs">
                      {app.verifier_name ? (
                        <span className="font-semibold text-slate-800">{app.verifier_name}</span>
                      ) : (
                        <button
                          onClick={() => handleOpenAssign(app)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-semibold"
                        >
                          + Assign Verifier
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAssign(app)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-semibold bg-slate-100 rounded-lg"
                      >
                        Reassign
                      </button>

                      {!['APPROVED', 'REJECTED'].includes(app.status) && (
                        <button
                          onClick={() => handleOpenDecision(app)}
                          className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          Final Decision
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Verifier Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Faculty Verifier"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Assigning application for <strong>{selectedApp?.student_name}</strong> (
            {selectedApp?.scholarship_title}) to a qualified faculty reviewer.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Verifier
            </label>
            <select
              value={selectedVerifierId}
              onChange={(e) => setSelectedVerifierId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
            >
              {verifiers.map((v) => (
                <option key={v.user_id} value={v.user_id}>
                  {v.full_name} ({v.email || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Final Decision Modal */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title="Execute Final Scholarship Decision"
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Applicant: <strong>{selectedApp?.student_name}</strong> | Current Status:{' '}
            <span className="font-semibold text-brand-700">{selectedApp?.status}</span>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Decision Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecisionType('APPROVED')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  decisionType === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Grant
              </button>
              <button
                type="button"
                onClick={() => setDecisionType('REJECTED')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  decisionType === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <XCircle className="w-4 h-4" /> Reject Application
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Decision Justification
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="Provide exact institutional reason (e.g., 'Met all merit thresholds; certificates validated')..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDecisionModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !decisionReason.trim()}
              className={`px-4 py-1.5 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 ${
                decisionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionLoading ? 'Recording...' : `Commit ${decisionType}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
