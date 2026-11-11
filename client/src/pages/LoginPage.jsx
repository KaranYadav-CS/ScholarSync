import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'VERIFIER') navigate('/verifier/dashboard');
      else if (user.role === 'SCHOLARSHIP_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'SYSTEM_ADMIN') navigate('/system/users');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to ScholarSync</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your scholarship workspace, applications, and decisions
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Fill Pill Buttons */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Demo Fast Fill:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('student@scholarsync.edu')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-left border border-slate-200 transition"
            >
              <span className="font-semibold text-slate-800 block">Student</span>
              <span className="text-[10px] text-slate-500">Aarav Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('verifier@scholarsync.edu')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-left border border-slate-200 transition"
            >
              <span className="font-semibold text-slate-800 block">Faculty Verifier</span>
              <span className="text-[10px] text-slate-500">Prof. Jenkins</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@scholarsync.edu')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-left border border-slate-200 transition"
            >
              <span className="font-semibold text-slate-800 block">Scholarship Admin</span>
              <span className="text-[10px] text-slate-500">Dr. Mitchell</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('sysadmin@scholarsync.edu')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-left border border-slate-200 transition"
            >
              <span className="font-semibold text-slate-800 block">System Admin</span>
              <span className="text-[10px] text-slate-500">Alex Chen</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New student?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
