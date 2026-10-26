"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, Share2 } from "lucide-react";
import { SocialLink } from "@/lib/db/types";

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/social")
      .then((res) => res.json())
      .then((data) => {
        if (data.links) setLinks(data.links);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddLink = () => {
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: "facebook",
      label: "Facebook",
      url: "https://",
      display_order: links.length + 1,
      is_active: true,
    };
    setLinks([...links, newLink]);
  };

  const handleRemove = (index: number) => {
    const copy = [...links];
    copy.splice(index, 1);
    setLinks(copy);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch {
      alert("Failed to save links.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Social Media Links</h1>
          <p className="text-xs text-brandText-secondary mt-0.5">
            Configure header and footer social links (Facebook, Instagram, YouTube, TikTok)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddLink}
            className="px-4 py-2.5 rounded-xl border border-surface-border bg-white text-navy font-bold text-xs hover:bg-surface-soft flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Platform
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs transition shadow flex items-center gap-2"
          >
            {saving ? "Saving..." : savedSuccess ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-4">
        {links.map((link, idx) => (
          <div
            key={link.id || idx}
            className="p-4 rounded-2xl bg-surface-soft border border-surface-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
          >
            <div className="sm:col-span-3">
              <label className="text-[10px] text-brandText-muted block mb-1">Platform</label>
              <select
                value={link.platform}
                onChange={(e) => {
                  const copy = [...links];
                  copy[idx].platform = e.target.value as any;
                  copy[idx].label = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                  setLinks(copy);
                }}
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white font-bold text-navy"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="twitter">Twitter / X</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label className="text-[10px] text-brandText-muted block mb-1">Destination URL</label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const copy = [...links];
                  copy[idx].url = e.target.value;
                  setLinks(copy);
                }}
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-brandText-muted block mb-1">Active</label>
              <input
                type="checkbox"
                checked={link.is_active}
                onChange={(e) => {
                  const copy = [...links];
                  copy[idx].is_active = e.target.checked;
                  setLinks(copy);
                }}
                className="mt-2 rounded text-primary focus:ring-primary w-4 h-4"
              />
            </div>

            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 text-red-500 hover:text-red-700 mt-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
