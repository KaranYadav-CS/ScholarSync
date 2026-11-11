import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      const res = await api.get(`/scholarships/${id}`);
      if (res.success) {
        setScholarship(res.data);
        if (user && user.role === 'STUDENT') {
          checkStudentEligibility();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkStudentEligibility = async () => {
    setCheckingEligibility(true);
    try {
      const res = await api.get(`/scholarships/${id}/eligibility`);
      if (res.success) setEligibility(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading scholarship details...</p>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Scholarship not found.</p>
        <Link to="/scholarships" className="text-brand-600 font-semibold text-sm mt-4 inline-block">
          &larr; Back to all scholarships
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-200">
              {scholarship.category}
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              {scholarship.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            Deadline: {new Date(scholarship.deadline_at).toLocaleDateString()}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
          {scholarship.title}
        </h1>
        <p className="text-sm font-semibold text-brand-600 mt-2 flex items-center gap-1.5">
          <Building className="w-4 h-4" /> {scholarship.provider}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Grant Amount
            </span>
            <p className="text-3xl font-extrabold text-emerald-700">
              ₹{Number(scholarship.award_amount).toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1.5">{scholarship.currency}</span>
            </p>
          </div>

          {user && user.role === 'STUDENT' ? (
            <Link
              to={`/student/applications/new/${scholarship.scholarship_id}`}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-500/20 flex items-center gap-2 transition"
            >
              Start Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : !user ? (
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md transition"
            >
              Sign In to Apply
            </Link>
          ) : null}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Program Overview</h2>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
          {scholarship.description}
        </p>
      </div>

      {/* Explainable Eligibility Criteria Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              Eligibility Criteria
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated deterministically against student academic profile
            </p>
          </div>
        </div>

        {/* Explainability Feedback Banner for Student */}
        {eligibility && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              eligibility.is_eligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : eligibility.has_missing_data
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {eligibility.is_eligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : eligibility.has_missing_data ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">{eligibility.summary}</p>
              {eligibility.has_missing_data && (
                <Link
                  to="/student/profile"
                  className="text-xs font-bold text-amber-800 underline mt-1 inline-block"
                >
                  Click here to complete your student profile &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {scholarship.criteria && scholarship.criteria.length > 0 ? (
            scholarship.criteria.map((c) => {
              const evalResult = eligibility?.criteria_results?.find(
                (r) => r.criterion_id === c.criterion_id
              );

              return (
                <div
                  key={c.criterion_id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{c.display_reason}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {c.field_key} {c.operator} {c.expected_value}
                        {c.upper_value ? ` to ${c.upper_value}` : ''}
                      </span>
                      {c.is_mandatory && (
                        <span className="text-rose-600 font-medium">Mandatory</span>
                      )}
                    </div>
                  </div>

                  {evalResult && (
                    <div className="shrink-0">
                      {evalResult.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
                        </span>
                      ) : evalResult.status === 'MISSING_DATA' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing Data
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Ineligible
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 italic">No specific eligibility criteria specified.</p>
          )}
        </div>
      </div>
    </div>
  );
}
