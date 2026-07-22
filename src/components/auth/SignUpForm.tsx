"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignUpForm() {
  const t = useTranslations("Auth.signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      setError(t("error"));
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-text-muted text-sm">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-2">{t("nameLabel")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">{t("emailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">{t("passwordLabel")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              required
              className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-cyan" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-3 text-text-muted">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full px-6 py-3 rounded-lg border border-border-cyan text-text-primary text-sm font-medium hover:bg-surface-2 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t("google")}
        </button>

        <p className="text-center text-sm text-text-muted mt-6">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-neon-cyan hover:underline font-medium">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
