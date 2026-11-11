import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
} from 'lucide-react';

export default function EligibleScholarshipsPage() {
  const { student } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const scholRes = await api.get('/scholarships');
      if (scholRes.success) {
        const evalPromises = scholRes.data.map(async (s) => {
          try {
            const evalRes = await api.get(`/scholarships/${s.scholarship_id}/eligibility`);
            return {
              scholarship: s,
              evaluation: evalRes.data,
            };
          } catch (err) {
            return {
              scholarship: s,
              evaluation: null,
            };
          }
        });

        const results = await Promise.all(evalPromises);
        setEvaluations(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const eligibleList = evaluations.filter((item) => item.evaluation?.is_eligible);
  const ineligibleList = evaluations.filter(
    (item) => item.evaluation && !item.evaluation.is_eligible && !item.evaluation.has_missing_data
  );
  const missingDataList = evaluations.filter((item) => item.evaluation?.has_missing_data);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-brand-600" />
          Explainable Eligibility Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Our deterministic engine verifies your academic and financial criteria against each scholarship and gives transparent explanations.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Evaluating scholarship rules against your profile...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Eligible Scholarships */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Eligible Opportunities ({eligibleList.length})
            </h2>

            {eligibleList.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                No scholarships currently meet all your profile criteria. Check missing data or alternative listings.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eligibleList.map(({ scholarship, evaluation }) => (
                  <div
                    key={scholarship.scholarship_id}
                    className="bg-white rounded-2xl border-2 border-emerald-200 p-6 flex flex-col justify-between shadow-sm hover:shadow transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Eligible
                        </span>
                        <span className="text-slate-500 font-medium">
                          Deadline: {new Date(scholarship.deadline_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{scholarship.title}</h3>
                      <p className="text-xs text-brand-600 font-medium mt-0.5">{scholarship.provider}</p>
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2">{scholarship.description}</p>

                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl space-y-1">
                        <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                          Verified Criteria:
                        </p>
                        {evaluation.criteria_results?.map((cr) => (
                          <p key={cr.criterion_id} className="text-xs text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{cr.display_reason}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Grant</span>
                        <p className="text-lg font-bold text-emerald-700">
                          ₹{Number(scholarship.award_amount).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        to={`/student/applications/new/${scholarship.scholarship_id}`}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                      >
                        Apply Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Missing Profile Information */}
          {missingDataList.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                Missing Profile Data ({missingDataList.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missingDataList.map(({ scholarship, evaluation }) => (
                  <div
                    key={scholarship.scholarship_id}
                    className="bg-white rounded-2xl border border-amber-200 p-6 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Profile Incomplete
                        </span>
                        <span className="text-slate-500">
                          Deadline: {new Date(scholarship.deadline_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{scholarship.title}</h3>

                      <div className="mt-3 p-3 bg-amber-50 rounded-xl space-y-1">
                        <p className="text-xs font-semibold text-amber-900">
                          Missing required profile fields:
                        </p>
                        <p className="text-xs text-amber-800 font-mono">
                          {evaluation.missing_fields?.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to="/student/profile"
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                      >
                        Update Profile to Check Eligibility &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Ineligible with explainable reasons */}
          {ineligibleList.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                Not Eligible with Current Profile ({ineligibleList.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ineligibleList.map(({ scholarship, evaluation }) => (
                  <div
                    key={scholarship.scholarship_id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between opacity-85 hover:opacity-100 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Ineligible
                        </span>
                        <span className="text-slate-500">
                          Deadline: {new Date(scholarship.deadline_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{scholarship.title}</h3>

                      <div className="mt-3 p-3 bg-rose-50/60 rounded-xl space-y-1">
                        <p className="text-xs font-semibold text-rose-900">Unmet Criteria:</p>
                        {evaluation.criteria_results
                          ?.filter((cr) => !cr.passed)
                          .map((cr) => (
                            <p key={cr.criterion_id} className="text-xs text-rose-800 flex items-start gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{cr.reason}</span>
                            </p>
                          ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                      <Link
                        to={`/scholarships/${scholarship.scholarship_id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        View Rule Details &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
