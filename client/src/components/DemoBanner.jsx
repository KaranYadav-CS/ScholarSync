import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, UserCheck, ShieldCheck, User } from 'lucide-react';

export default function DemoBanner() {
  const { login, user } = useAuth();

  const handleQuickSwitch = async (email) => {
    try {
      await login(email, 'Password123!');
    } catch (err) {
      console.error('Quick switch error:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white text-xs py-2 px-4 shadow-sm border-b border-indigo-700/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="font-semibold tracking-wide uppercase text-teal-300">
            DEMO MODE — Academic Sample Data
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline">
            Azure SQL & Blob adapters prepared for cloud deployment
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 mr-1 hidden lg:inline">Quick Test Accounts:</span>
          <button
            onClick={() => handleQuickSwitch('student@scholarsync.edu')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'STUDENT'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Switch to Student: Aarav Sharma"
          >
            Student
          </button>
          <button
            onClick={() => handleQuickSwitch('verifier@scholarsync.edu')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'VERIFIER'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Switch to Verifier: Prof. Robert Jenkins"
          >
            Verifier
          </button>
          <button
            onClick={() => handleQuickSwitch('admin@scholarsync.edu')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'SCHOLARSHIP_ADMIN'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Switch to Admin: Dr. Sarah Mitchell"
          >
            Scholarship Admin
          </button>
          <button
            onClick={() => handleQuickSwitch('sysadmin@scholarsync.edu')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'SYSTEM_ADMIN'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Switch to System Admin: Alex Chen"
          >
            System Admin
          </button>
        </div>
      </div>
    </div>
  );
}
