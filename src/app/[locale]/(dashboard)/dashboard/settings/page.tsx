"use client";

import { useUser } from "@/lib/supabase/user";

export default function SettingsPage() {
  const { profile, user } = useUser();

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-text-muted mt-1">Manage your account settings.</p>
      </div>

      <div className="glass-card rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-2xl font-bold">
              {(profile?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{profile?.name}</p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
        </div>

        <hr className="border-border-cyan" />

        <div>
          <label className="block text-sm text-text-muted mb-2">Display Name</label>
          <input
            type="text"
            defaultValue={profile?.name || ""}
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-2">Email</label>
          <input
            type="email"
            defaultValue={user?.email || ""}
            disabled
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-cyan text-text-dim text-sm cursor-not-allowed"
          />
        </div>

        <div className="pt-2">
          <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
