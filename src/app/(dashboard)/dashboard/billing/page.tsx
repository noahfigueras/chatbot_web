"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/supabase/user";
import { useSearchParams } from "next/navigation";

interface SubscriptionInfo {
  plan_tier: string;
  status: string;
  current_period_end: string | null;
}

export default function BillingPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("success")) {
      setSuccessMsg("Subscription activated! Welcome to Pro.");
    }

    fetch("/api/stripe/billing-info")
      .then((r) => r.json())
      .then((data) => {
        if (data.subscription) setSub(data.subscription);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Something went wrong");
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    const res = await fetch("/api/stripe/create-portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Something went wrong");
    }
  };

  const isPro = sub?.plan_tier === "pro";

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Billing</h1>
      <p className="text-text-muted mb-8">Manage your subscription and usage.</p>

      {successMsg && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm">
          {successMsg}
        </div>
      )}

      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : (
        <>
          <div className="glass-card rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-2xl font-bold text-white">
                  {isPro ? "Pro" : "Free"}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  {isPro
                    ? `€50/month — ${sub?.current_period_end ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}` : ""}`
                    : "5 chatbots, 500 messages/bot/mo — no card needed"}
                </p>
              </div>
              {isPro ? (
                <button
                  onClick={handleManageSubscription}
                  className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-neon-cyan text-sm hover:bg-neon-cyan/5 transition-colors"
                >
                  Manage
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium disabled:opacity-50"
                >
                  {upgrading ? "Redirecting..." : "Upgrade to Pro — €50/mo"}
                </button>
              )}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Plan Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-cyan">
                    <th className="text-left py-3 px-3 text-text-muted font-medium"></th>
                    <th className={`text-left py-3 px-3 font-medium ${!isPro ? "text-neon-cyan" : "text-text-muted"}`}>Free</th>
                    <th className={`text-left py-3 px-3 font-medium ${isPro ? "text-neon-cyan" : "text-text-muted"}`}>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-cyan/50">
                    <td className="py-3 px-3 text-white">Chatbots</td>
                    <td className="py-3 px-3 text-text-muted">5</td>
                    <td className="py-3 px-3 text-text-muted">15</td>
                  </tr>
                  <tr className="border-b border-border-cyan/50">
                    <td className="py-3 px-3 text-white">Messages per bot / month</td>
                    <td className="py-3 px-3 text-text-muted">500</td>
                    <td className="py-3 px-3 text-text-muted">5,000</td>
                  </tr>
                  <tr className="border-b border-border-cyan/50">
                    <td className="py-3 px-3 text-white">Knowledge storage</td>
                    <td className="py-3 px-3 text-text-muted">10 MB</td>
                    <td className="py-3 px-3 text-text-muted">100 MB</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-white">Channels</td>
                    <td className="py-3 px-3 text-text-muted">WhatsApp + Telegram</td>
                    <td className="py-3 px-3 text-text-muted">WhatsApp + Telegram</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-2">Need more than 5,000 messages?</h2>
            <p className="text-sm text-text-muted mb-4">
              We offer custom plans for higher volume. Email us and we&apos;ll set up a tailored plan for you.
            </p>
            <a
              href="mailto:hello@redfortlabs.xyz?subject=Custom%20plan%20request"
              className="inline-block px-4 py-2 rounded-lg border border-neon-cyan/30 text-neon-cyan text-sm hover:bg-neon-cyan/5 transition-colors"
            >
              Contact us
            </a>
          </div>
        </>
      )}
    </div>
  );
}
