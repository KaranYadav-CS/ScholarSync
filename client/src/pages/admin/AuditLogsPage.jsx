import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { History, Shield, Search } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(filter.toLowerCase()) ||
      (l.actor_name && l.actor_name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <History className="w-7 h-7 text-brand-600" />
          Security & Operational Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Append-only immutable record of all authentication, state transitions, assignments, and decisions.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by action, actor name, or entity type..."
          className="w-full text-xs border-0 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Entity</th>
                <th className="px-6 py-3.5">Outcome</th>
                <th className="px-6 py-3.5">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 text-slate-500 font-sans">
                      {new Date(log.event_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                      {log.actor_name || 'System'}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {log.actor_email}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-brand-700">{log.action}</td>
                    <td className="px-6 py-3.5 font-sans text-slate-700">
                      {log.entity_type} ({log.entity_id ? log.entity_id.slice(0, 8) : 'N/A'})
                    </td>
                    <td className="px-6 py-3.5 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.outcome === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-[10px]">
                      {log.correlation_id ? log.correlation_id.slice(0, 12) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
