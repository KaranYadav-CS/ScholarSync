import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Building,
  RotateCcw,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clarificationMsg, setClarificationMsg] = useState('');
  const [submittingClarification, setSubmittingClarification] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.success) setApplication(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClarificationResponse = async (e) => {
    e.preventDefault();
    if (!clarificationMsg.trim()) return;

    setSubmittingClarification(true);
    setFeedbackMsg('');

    try {
      const res = await api.post(`/applications/${id}/clarification-response`, {
        message: clarificationMsg.trim(),
      });
      if (res.success) {
        setClarificationMsg('');
        setFeedbackMsg('Your clarification response has been submitted to the reviewer.');
        fetchApplication();
      }
    } catch (err) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setSubmittingClarification(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading application details and timeline...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Application not found.</p>
        <Link to="/student/applications" className="text-brand-600 font-semibold text-xs mt-3 inline-block">
          &larr; Back to My Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <StatusBadge status={application.status} />
          <span className="text-xs text-slate-400 font-mono">
            Application ID: {application.application_id}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {application.scholarship?.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
          <Building className="w-3.5 h-3.5 text-brand-600" />
          {application.scholarship?.provider} | Grant Amount: ₹
          {Number(application.scholarship?.award_amount).toLocaleString()}
        </p>

        {/* Final Decision Alert if Approved or Rejected */}
        {application.decision_reason && (
          <div
            className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
              application.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {application.status === 'APPROVED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Official Decision Recorded: {application.status}
              </h4>
              <p className="text-sm mt-1">{application.decision_reason}</p>
              {application.decision_at && (
                <p className="text-[11px] opacity-75 mt-1">
                  Decided on: {new Date(application.decision_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Clarification Action Box for Student */}
      {application.status === 'CLARIFICATION_REQUESTED' && (
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Action Required: Faculty Verifier Requested Clarification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Please submit the requested details or explanation below to resume verification.
              </p>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-3 bg-white/80 rounded-xl text-xs font-semibold text-slate-800">
              {feedbackMsg}
            </div>
          )}

          <form onSubmit={handleClarificationResponse} className="space-y-3">
            <textarea
              rows={3}
              required
              value={clarificationMsg}
              onChange={(e) => setClarificationMsg(e.target.value)}
              placeholder="Type your clarification or certificate details here..."
              className="w-full p-3 text-xs border border-amber-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={submittingClarification}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submittingClarification ? 'Submitting...' : 'Submit Response'}
            </button>
          </form>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          Supporting Documents ({application.documents?.length || 0})
        </h2>

        {application.documents?.length === 0 ? (
          <p className="text-xs text-slate-400">No documents attached.</p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {application.documents.map((doc) => (
              <div key={doc.document_id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{doc.document_type}</p>
                  <p className="text-[11px] text-slate-400">{doc.original_file_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      doc.verification_status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {doc.verification_status}
                  </span>
                  <a
                    href={`/api/documents/${doc.document_id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Status History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          Lifecycle & Decision Timeline
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {application.statusHistory?.map((h) => (
            <div key={h.history_id} className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white" />
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {h.old_status} &rarr; <span className="text-brand-700">{h.new_status}</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(h.changed_at).toLocaleString()}
                  </span>
                </div>
                {h.change_reason && (
                  <p className="text-xs text-slate-600 mt-1">{h.change_reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
