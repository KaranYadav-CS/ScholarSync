import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Search, Filter, Clock, ArrowRight, Award } from 'lucide-react';

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchScholarships();
  }, [categoryFilter]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      let endpoint = `/scholarships?search=${encodeURIComponent(search)}`;
      if (categoryFilter !== 'All') {
        endpoint += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      const res = await api.get(endpoint);
      if (res.success) setScholarships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  const categories = ['All', 'Merit-cum-Means', 'Merit-based', 'Need-based'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Published Scholarships
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore institutional and foundation funding opportunities. Check requirements and submit applications.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, provider, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scholarships Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No scholarships found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search query or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-lg font-bold text-emerald-700">
                    ₹{Number(s.award_amount).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/scholarships/${s.scholarship_id}`}
                  className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                >
                  Apply & Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
