import React from 'react';
import {
  FileText,
  Clock,
  Search,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: FileText,
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Search,
  },
  CLARIFICATION_REQUESTED: {
    label: 'Clarification Needed',
    bg: 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse',
    icon: AlertCircle,
  },
  RESUBMITTED: {
    label: 'Clarification Resubmitted',
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: RotateCcw,
  },
  VERIFIED: {
    label: 'Documents Verified',
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: CheckCircle2,
  },
  RECOMMENDED_FOR_APPROVAL: {
    label: 'Recommended: Approval',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    icon: ThumbsUp,
  },
  RECOMMENDED_FOR_REJECTION: {
    label: 'Recommended: Rejection',
    bg: 'bg-rose-50 text-rose-700 border-rose-300',
    icon: ThumbsDown,
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-green-100 text-green-800 border-green-300 font-semibold',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
