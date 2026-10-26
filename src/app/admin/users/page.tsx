"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { UserProfile } from "@/lib/db/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async (user: UserProfile) => {
    if (user.role === "admin") {
      alert("Administrator accounts cannot be deactivated from this view.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
      });
      if (res.ok) {
        loadUsers();
      }
    } catch {
      alert("Error changing user status.");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Customer &amp; User Accounts</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Registered university students, customers, and administrator permissions
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-navy shadow-sm">
          {users.length} Registered Accounts
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-card flex items-center gap-3">
        <Search className="w-4 h-4 text-brandText-muted" />
        <input
          type="text"
          placeholder="Search by student name, email, or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-brandText-muted">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-brandText-muted">No accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-surface-border text-brandText-secondary uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-soft/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-navy">{u.name}</p>
                      <p className="text-[11px] text-brandText-muted">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-navy">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-navy text-white"
                            : "bg-surface-alt text-brandText-primary"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brandText-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                            u.is_active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
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
