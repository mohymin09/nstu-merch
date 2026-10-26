"use client";

import React, { useState, useEffect } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { AuditLog } from "@/lib/db/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy">Administrative Audit Logs</h1>
        <p className="text-xs text-brandText-secondary mt-0.5">
          Chronological immutable history of order changes, payment reviews, and stock updates
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-brandText-muted">No audit logs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-2.5 px-4 text-brandText-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-navy">{log.action}</td>
                    <td className="py-2.5 px-4 uppercase text-[11px] font-semibold text-brandText-secondary">
                      {log.entity}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-primary">{log.actor}</td>
                    <td className="py-2.5 px-4 text-brandText-primary">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
