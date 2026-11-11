import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Sparkles,
  FileText,
  CheckSquare,
  BarChart3,
  Shield,
  Users,
  Award,
  History,
  FileCheck,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/profile', label: 'My Profile', icon: User },
          { to: '/student/eligible-scholarships', label: 'Eligibility Check', icon: Sparkles },
          { to: '/student/applications', label: 'My Applications', icon: FileText },
        ];
      case 'VERIFIER':
        return [
          { to: '/verifier/dashboard', label: 'Assigned Queue', icon: CheckSquare },
        ];
      case 'SCHOLARSHIP_ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/scholarships', label: 'Manage Scholarships', icon: Award },
          { to: '/admin/applications', label: 'Applications & Review', icon: FileCheck },
          { to: '/admin/analytics', label: 'Analytics & KPIs', icon: BarChart3 },
          { to: '/admin/audit-logs', label: 'Audit Trail', icon: History },
        ];
      case 'SYSTEM_ADMIN':
        return [
          { to: '/system/users', label: 'User Governance', icon: Users },
          { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
          { to: '/admin/audit-logs', label: 'Security Logs', icon: Shield },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
          Current Role
        </p>
        <p className="text-sm font-bold text-brand-700 capitalize mt-0.5">
          {user.role.replace('_', ' ')}
        </p>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold border-l-4 border-brand-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
