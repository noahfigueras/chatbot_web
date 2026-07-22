"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/supabase/user";
import { Link } from "@/i18n/navigation";

interface Chatbot {
  id: string;
  name: string;
  provider: string;
  model: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { profile, user } = useUser();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chatbots")
      .then((res) => res.json())
      .then((data) => {
        if (data.chatbots) setChatbots(data.chatbots);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeBots = chatbots.filter((b) => b.status === "active");
  const draftBots = chatbots.filter((b) => b.status !== "active");

  const stats = [
    {
      label: "Total Chatbots",
      value: chatbots.length.toString(),
      change: `${activeBots.length} active, ${draftBots.length} draft`,
      gradient: "from-neon-cyan to-blue-500",
    },
    {
      label: "Active Chatbots",
      value: activeBots.length.toString(),
      change: `${draftBots.length} still in draft`,
      gradient: "from-neon-purple to-pink-500",
    },
    {
      label: "Model",
      value: "GPT-5.4-nano",
      change: "all chatbots",
      gradient: "from-green-400 to-neon-cyan",
    },
    {
      label: "Latest Bot",
      value: chatbots.length > 0
        ? chatbots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].name
        : "—",
      change: "most recently created",
      gradient: "from-amber-400 to-neon-pink",
    },
  ];

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back, {profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there"}
        </h1>
        <p className="text-text-muted mt-1">Here&apos;s what&apos;s happening with your chatbots.</p>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm mb-8">Loading stats...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${stat.gradient}`} />
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.change}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Chatbots</h2>
            <p className="text-xs text-text-muted mt-0.5">Manage your chatbot fleet</p>
          </div>
          <Link
            href="/dashboard/chatbots/new"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300"
          >
            + New Chatbot
          </Link>
        </div>

        {loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm mb-4">No chatbots yet. Create your first one!</p>
            <Link
              href="/dashboard/chatbots/new"
              className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300"
            >
              Create Chatbot
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-cyan">
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Status</th>
                  <th className="text-right py-3 px-3 text-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chatbots.map((bot) => (
                  <tr key={bot.id} className="border-b border-border-cyan/50 hover:bg-surface-2/50 transition-colors">
                    <td className="py-4 px-3">
                      <span className="text-white font-medium">{bot.name}</span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${
                        bot.status === "active" ? "text-neon-green" : bot.status === "paused" ? "text-yellow-400" : "text-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          bot.status === "active" ? "bg-neon-green" : bot.status === "paused" ? "bg-yellow-400" : "bg-amber-500"
                        }`} />
                        {bot.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <Link
                        href={`/dashboard/chatbots/${bot.id}`}
                        className="text-xs text-text-muted hover:text-neon-cyan transition-colors px-3 py-1.5 rounded border border-border-cyan hover:border-neon-cyan/40"
                      >
                        Manage
                      </Link>
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
