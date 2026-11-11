import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import {
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ArrowLeft,
  Building,
} from 'lucide-react';

export default function VerifierReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verification comment
  const [verifyComment, setVerifyComment] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Clarification request
  const [clarificationReason, setClarificationReason] = useState('');
  const [requestingClarification, setRequestingClarification] = useState(false);

  // Recommendation
  const [recommendationType, setRecommendationType] = useState('RECOMMEND_APPROVAL');
  const [recommendationComment, setRecommendationComment] = useState('');
  const [submittingRec, setSubmittingRec] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.success) setApp(res.data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocuments = async () => {
    setVerifying(true);
    setMessage('');
    setErrorMsg('');
    try {
      const res = await api.post(`/verifier/applications/${id}/verifications`, {
        action: 'DOCUMENTS_VERIFIED',
        comments: verifyComment || 'Certificates and eligibility documents authenticated.',
      });
      if (res.success) {
        setMessage('Document verification recorded successfully.');
        setVerifyComment('');
        fetchApplication();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestClarification = async (e) => {
    e.preventDefault();
    if (!clarificationReason.trim()) return;

    setRequestingClarification(true);
    setMessage('');
    setErrorMsg('');
    try {
      const res = await api.post(`/verifier/applications/${id}/clarification-requests`, {
        reason: clarificationReason.trim(),
      });
      if (res.success) {
        setMessage('Clarification request sent to the student.');
        setClarificationReason('');
        fetchApplication();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRequestingClarification(false);
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    setSubmittingRec(true);
    setMessage('');
    setErrorMsg('');
    try {
      const res = await api.post(`/verifier/applications/${id}/recommendation`, {
        recommendation: recommendationType,
        comments: recommendationComment || `Faculty verifier recorded ${recommendationType}.`,
      });
      if (res.success) {
        setMessage('Recommendation successfully forwarded to Scholarship Admin decision queue!');
        fetchApplication();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingRec(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading application case details...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Application not found or unauthorized.</p>
        <Link to="/verifier/dashboard" className="text-brand-600 font-semibold text-xs mt-3 inline-block">
          &larr; Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/verifier/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Verification Queue
        </Link>
        <StatusBadge status={app.status} />
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Case Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600">
          Verification Review Case
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{app.scholarship?.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Provider: {app.scholarship?.provider} | Award: ₹
          {Number(app.scholarship?.award_amount).toLocaleString()}
        </p>

        {/* Student Profile Snapshot */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Applicant Student</span>
            <span className="font-bold text-slate-900">{app.student?.full_name}</span>
            <span className="text-[11px] text-slate-500 block">{app.student?.email}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Department & Program</span>
            <span className="font-bold text-slate-900">{app.student?.department}</span>
            <span className="text-[11px] text-slate-500 block">
              {app.student?.program} (Year {app.student?.study_year})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Cumulative CGPA</span>
            <span className="text-base font-extrabold text-brand-700">{app.student?.cgpa} / 10.0</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Annual Family Income</span>
            <span className="text-base font-extrabold text-slate-800">
              ₹{Number(app.student?.annual_family_income).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Documents Verification Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          Supporting Certificates & Documents ({app.documents?.length || 0})
        </h2>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {app.documents?.map((doc) => (
            <div key={doc.document_id} className="p-4 flex items-center justify-between text-xs bg-white">
              <div>
                <p className="font-bold text-slate-900">{doc.document_type}</p>
                <p className="text-[11px] text-slate-400">
                  {doc.original_file_name} ({(doc.size_bytes / 1024).toFixed(1)} KB)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {doc.verification_status}
                </span>
                <a
                  href={`/api/documents/${doc.document_id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-semibold flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download & Inspect
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between gap-4">
          <input
            type="text"
            value={verifyComment}
            onChange={(e) => setVerifyComment(e.target.value)}
            placeholder="Add verification notes (e.g., 'Marksheets cross-checked with registry')..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg bg-white"
          />
          <button
            onClick={handleVerifyDocuments}
            disabled={verifying}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 shrink-0"
          >
            {verifying ? 'Recording...' : 'Mark Documents Verified'}
          </button>
        </div>
      </div>

      {/* Action Tabs: Request Clarification OR Recommend Outcome */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Clarification Request */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Request Student Clarification
          </h3>
          <p className="text-xs text-slate-500">
            If certificates are blurry or details mismatch, request clarification from the applicant.
          </p>

          <form onSubmit={handleRequestClarification} className="space-y-3">
            <textarea
              rows={3}
              required
              value={clarificationReason}
              onChange={(e) => setClarificationReason(e.target.value)}
              placeholder="State exactly what certificate or clarification is required..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={requestingClarification}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {requestingClarification ? 'Sending...' : 'Request Clarification'}
            </button>
          </form>
        </div>

        {/* Panel 2: Verifier Recommendation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            Faculty Recommendation
          </h3>
          <p className="text-xs text-slate-500">
            Submit your recommendation to the Scholarship Admin queue for final grant approval.
          </p>

          <form onSubmit={handleSubmitRecommendation} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecommendationType('RECOMMEND_APPROVAL')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  recommendationType === 'RECOMMEND_APPROVAL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Recommend Approval
              </button>
              <button
                type="button"
                onClick={() => setRecommendationType('RECOMMEND_REJECTION')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  recommendationType === 'RECOMMEND_REJECTION'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Recommend Rejection
              </button>
            </div>

            <textarea
              rows={2}
              value={recommendationComment}
              onChange={(e) => setRecommendationComment(e.target.value)}
              placeholder="Faculty justification comments..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />

            <button
              type="submit"
              disabled={submittingRec}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submittingRec ? 'Submitting...' : 'Submit Recommendation to Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
