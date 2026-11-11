import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  FileCheck,
  BarChart3,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/scholarships')
      .then((res) => {
        if (res.success) setScholarships(res.data.slice(0, 3));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Unified Academic Scholarship Lifecycle
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Scholarships, simplified. <br />
              <span className="text-brand-600">Decisions, traceable.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              ScholarSync unifies scholarship discovery, explainable rule-based eligibility,
              secure private document uploads, faculty verification, and administrative audit trails
              in one role-protected academic portal.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/scholarships"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-500/20 flex items-center gap-2 transition"
              >
                Browse Scholarships
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm transition"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Complete Scholarship Lifecycle in One Platform
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            From eligibility verification to documented administrative decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 1</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Discover & Check</h3>
            <p className="text-sm text-slate-600 mt-2">
              Explore available opportunities and run our rule-based evaluator to see exactly why you qualify.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 2</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Apply & Upload</h3>
            <p className="text-sm text-slate-600 mt-2">
              Submit draft applications with encrypted, private document storage (PDF/PNG/JPEG).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 3</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Faculty Review</h3>
            <p className="text-sm text-slate-600 mt-2">
              Assigned verifiers authenticate certificates, request clarifications, and submit recommendations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 4</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Audited Decision</h3>
            <p className="text-sm text-slate-600 mt-2">
              Scholarship admin commits final approval/rejection with mandatory reasons and immutable timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Scholarships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
            <p className="text-sm text-slate-500 mt-1">
              Currently open for eligible student applications
            </p>
          </div>
          <Link
            to="/scholarships"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all ({scholarships.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <div
                key={s.scholarship_id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                      {s.category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(s.deadline_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{s.title}</h3>
                  <p className="text-xs font-medium text-brand-600 mt-1">{s.provider}</p>
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3">{s.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Award</span>
                    <p className="text-base font-bold text-emerald-700">
                      ₹{Number(s.award_amount).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/scholarships/${s.scholarship_id}`}
                    className="px-3.5 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
