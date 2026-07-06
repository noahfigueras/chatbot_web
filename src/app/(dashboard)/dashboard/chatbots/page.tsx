"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Chatbot {
  id: string;
  name: string;
  provider: string;
  model: string;
  status: string;
  created_at: string;
}

export default function ChatbotsPage() {
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

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Chatbots</h1>
          <p className="text-text-muted mt-1">Manage all your chatbots.</p>
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
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No chatbots yet</h2>
          <p className="text-sm text-text-muted mb-6">Create your first AI chatbot.</p>
          <Link
            href="/dashboard/chatbots/new"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300"
          >
            Create Chatbot
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {chatbots.map((bot) => (
            <Link
              key={bot.id}
              href={`/dashboard/chatbots/${bot.id}`}
              className="glass-card rounded-xl p-5 flex items-center justify-between hover:border-neon-cyan/25 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-neon-cyan transition-colors">{bot.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted capitalize">{bot.provider}</span>
                    <span className="text-xs text-text-dim">&middot;</span>
                    <span className="text-xs font-mono text-neon-cyan">{bot.model}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 text-xs ${
                  bot.status === "active" ? "text-neon-green" : bot.status === "paused" ? "text-yellow-400" : "text-amber-500"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    bot.status === "active" ? "bg-neon-green" : bot.status === "paused" ? "bg-yellow-400" : "bg-amber-500"
                  }`} />
                  {bot.status}
                </span>
                <svg className="w-5 h-5 text-text-dim group-hover:text-neon-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
