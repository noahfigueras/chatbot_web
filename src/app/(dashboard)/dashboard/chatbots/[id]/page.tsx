"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import GuideCard from "@/components/GuideCard";

interface Chatbot {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  status: string;
  created_at: string;
}

interface KnowledgeFile {
  id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  created_at: string;
}

interface Channel {
  id: string;
  chatbot_id: string;
  channel_type: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
}

export default function ChatbotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<"system_prompt" | "knowledge">("knowledge");
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [connectingTelegram, setConnectingTelegram] = useState(false);
  const [connectingWhatsApp, setConnectingWhatsApp] = useState(false);
  const [togglingChannel, setTogglingChannel] = useState<string | null>(null);
  const [disconnectingChannel, setDisconnectingChannel] = useState<string | null>(null);
  const [botToken, setBotToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waAccessToken, setWaAccessToken] = useState("");

  const fetchBot = async () => {
    const res = await fetch(`/api/chatbots/${params.id}`);
    const data = await res.json();
    if (res.ok) {
      setChatbot(data.chatbot);
      setKnowledgeFiles(data.knowledgeFiles || []);
    }
    setLoading(false);
  };

  const fetchChannels = async () => {
    const res = await fetch(`/api/chatbots/${params.id}/channels`);
    const data = await res.json();
    if (res.ok) setChannels(data.channels || []);
  };

  useEffect(() => {
    fetchBot();
    fetchChannels();
  }, [params.id]);

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError("");
    const res = await fetch(`/api/chatbots/${params.id}/deploy`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setDeployError(data.error);
    } else {
      setChatbot((prev) => prev ? { ...prev, status: "active" } : prev);
    }
    setDeploying(false);
  };

  const handleStop = async () => {
    setStopping(true);
    const res = await fetch(`/api/chatbots/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paused" }),
    });
    if (res.ok) {
      setChatbot((prev) => prev ? { ...prev, status: "paused" } : prev);
    }
    setStopping(false);
  };

  const handleDestroy = async () => {
    if (!confirm("Are you sure you want to permanently destroy this chatbot? All knowledge files, messages, and configuration will be deleted. This cannot be undone.")) return;
    setDestroying(true);
    const res = await fetch(`/api/chatbots/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/chatbots");
    setDestroying(false);
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeletingFile(fileId);
    await fetch(`/api/chatbots/${params.id}/knowledge/${fileId}`, { method: "DELETE" });
    setKnowledgeFiles((prev) => prev.filter((f) => f.id !== fileId));
    setDeletingFile(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatbot) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatbotId", chatbot.id);
    formData.append("fileType", uploadFileType);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setKnowledgeFiles((prev) => [...prev, data.file]);
    }

    setUploadingFile(false);
    e.target.value = "";
  };

  const handleConnectTelegram = async () => {
    if (!botToken.trim() || !chatbot) return;
    setConnectingTelegram(true);

    const res = await fetch(`/api/chatbots/${chatbot.id}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelType: "telegram", config: { botToken: botToken.trim() } }),
    });
    const data = await res.json();

    if (!res.ok) {
      setConnectingTelegram(false);
      alert(data.error);
      return;
    }

    // Enable the channel (registers webhook)
    const enableRes = await fetch(`/api/chatbots/${chatbot.id}/channels/${data.channel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    });

    if (!enableRes.ok) {
      const errData = await enableRes.json();
      alert(errData.error);
    }

    setBotToken("");
    setConnectingTelegram(false);
    fetchChannels();
  };

  const handleToggleChannel = async (channel: Channel, enabled: boolean) => {
    setTogglingChannel(channel.id);
    const res = await fetch(`/api/chatbots/${params.id}/channels/${channel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });

    if (res.ok) {
      fetchChannels();
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setTogglingChannel(null);
  };

  const handleConnectWhatsApp = async () => {
    if (!waAccessToken.trim() || !chatbot) return;
    setConnectingWhatsApp(true);

    const res = await fetch(`/api/chatbots/${chatbot.id}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelType: "whatsapp",
        config: {
          phoneNumberId: waPhoneId.trim(),
          accessToken: waAccessToken.trim(),
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) { setConnectingWhatsApp(false); alert(data.error); return; }

    const enableRes = await fetch(`/api/chatbots/${chatbot.id}/channels/${data.channel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    });
    if (!enableRes.ok) {
      const errData = await enableRes.json();
      alert(errData.error);
    }

    setWaAccessToken("");
    setConnectingWhatsApp(false);
    fetchChannels();
  };

  const handleDisconnectChannel = async (channel: Channel) => {
    if (!confirm(`Disconnect this ${channel.channel_type} integration?`)) return;
    setDisconnectingChannel(channel.id);
    const res = await fetch(`/api/chatbots/${params.id}/channels/${channel.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchChannels();
    }
    setDisconnectingChannel(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-neon-green";
      case "paused": return "text-yellow-400";
      default: return "text-amber-500";
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case "active": return "bg-neon-green";
      case "paused": return "bg-yellow-400";
      default: return "bg-amber-500";
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="text-text-muted">Chatbot not found.</p>
        <Link href="/dashboard/chatbots" className="text-neon-cyan hover:underline text-sm mt-2 inline-block">
          &larr; Back to chatbots
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <Link href="/dashboard/chatbots" className="text-sm text-text-muted hover:text-neon-cyan transition-colors mb-6 inline-block">
        &larr; Back to chatbots
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{chatbot.name}</h1>
          {chatbot.description && (
            <p className="text-text-muted mt-1">{chatbot.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {chatbot.status === "active" && (
            <>
              <Link
                href={`/dashboard/chatbots/${chatbot.id}/chat`}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium"
              >
                Open Chat
              </Link>
              <button
                onClick={handleStop}
                disabled={stopping}
                className="px-4 py-2 rounded-lg border border-amber-400/30 text-amber-400 text-sm hover:bg-amber-400/5 transition-colors disabled:opacity-50"
              >
                {stopping ? "Stopping..." : "Stop"}
              </button>
            </>
          )}
          {chatbot.status === "paused" && (
            <span className="px-4 py-2 rounded-lg border border-yellow-400/30 text-yellow-400 text-sm bg-yellow-400/5">
              Paused
            </span>
          )}
          <button
            onClick={handleDestroy}
            disabled={destroying}
            className="px-4 py-2 rounded-lg border border-red-400/30 text-red-400 text-sm hover:bg-red-400/5 transition-colors disabled:opacity-50"
          >
            {destroying ? "Destroying..." : "Destroy"}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <p className="text-xs text-text-muted mb-1">Status</p>
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusColor(chatbot.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(chatbot.status)}`} />
            {chatbot.status}
          </span>
          {chatbot.status === "paused" && (
            <button onClick={handleDeploy} className="block mt-2 text-xs text-neon-cyan hover:underline">
              Resume
            </button>
          )}
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-xs text-text-muted mb-1">Model</p>
          <p className="text-sm font-mono text-neon-cyan">GPT-5.4-nano</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-xs text-text-muted mb-1">Created</p>
          <p className="text-sm text-white">{new Date(chatbot.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Knowledge Files</h2>

        <div className="mb-4">
          <GuideCard title="What are system prompts & knowledge files?">
            <p>
              <span className="text-white/70">System prompt</span> — defines your chatbot&apos;s personality and behavior rules.
              Written once, it guides every conversation.
            </p>
            <p>
              <span className="text-white/70">Knowledge files</span> — reference information the AI reads when answering
              questions. The AI searches across all files automatically.
            </p>
            <p className="font-medium text-neon-cyan/80">Accepted formats:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><span className="text-white/70">.md</span> — Markdown with headings</li>
              <li><span className="text-white/70">.txt</span> — Plain text</li>
            </ul>
          </GuideCard>
        </div>

        {knowledgeFiles.length === 0 ? (
          <p className="text-sm text-text-muted mb-4">No knowledge files uploaded yet.</p>
        ) : (
          <div className="space-y-2 mb-6">
            {knowledgeFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between bg-surface-2 rounded-lg px-4 py-3 border border-border-cyan">
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-5 h-5 text-neon-cyan shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-text-primary truncate">{f.file_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                    f.file_type === "system_prompt"
                      ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                      : "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                  }`}>
                    {f.file_type === "system_prompt" ? "system" : "knowledge"}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteFile(f.id)}
                  disabled={deletingFile === f.id}
                  className="text-xs text-text-muted hover:text-red-400 transition-colors px-2 py-1 rounded border border-transparent hover:border-red-400/30 shrink-0 ml-3 disabled:opacity-50"
                >
                  {deletingFile === f.id ? "..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border-cyan pt-4">
          <h3 className="text-sm font-medium text-white mb-3">Upload New File</h3>
          <div className="flex items-center gap-3">
            <select
              value={uploadFileType}
              onChange={(e) => setUploadFileType(e.target.value as "system_prompt" | "knowledge")}
              className="bg-surface-2 text-sm text-text-primary border border-border-cyan rounded-lg px-3 py-2 focus:outline-none focus:border-neon-cyan/40"
            >
              <option value="knowledge">Knowledge</option>
              <option value="system_prompt">System Prompt</option>
            </select>
            <label className={`px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium ${uploadingFile ? "opacity-50" : ""}`}>
              {uploadingFile ? "Uploading..." : "Choose .md / .txt"}
              <input type="file" accept=".md,.txt" onChange={handleUpload} disabled={uploadingFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Channels</h2>

        {channels.length === 0 ? (
          <p className="text-sm text-text-muted mb-4">No channels connected. Connect a messaging platform below.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {channels.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between bg-surface-2 rounded-lg px-4 py-3 border border-border-cyan">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    ch.channel_type === "telegram"
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      : "bg-neon-green/10 text-neon-green border border-neon-green/20"
                  }`}>
                    {ch.channel_type === "telegram" ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12.048 0C5.46 0 .144 5.316.144 11.904c0 2.112.552 4.176 1.608 5.988L0 24l6.336-1.632c1.764.972 3.756 1.488 5.712 1.488 6.588 0 11.904-5.316 11.904-11.904S18.636 0 12.048 0zm6.096 16.332c-.276.78-1.632 1.488-2.664 1.572-.708.06-1.464.24-4.992-1.068-4.092-1.512-6.48-5.076-6.672-5.316-.204-.252-1.596-2.124-1.596-4.056s1.008-2.88 1.368-3.276c.36-.396.78-.516 1.056-.516.264 0 .528.012.768.012.24 0 .648-.084 1.008.756.36.84 1.224 2.904 1.332 3.108.108.204.18.444.036.72-.144.264-.216.384-.432.612-.216.228-.444.504-.636.672-.216.192-.432.408-.192.804.24.396 1.068 1.764 2.292 2.856 1.584 1.404 2.904 1.848 3.324 2.052.42.204.66.168.9-.096.24-.264 1.032-1.2 1.308-1.62.276-.42.552-.348.924-.204.384.144 2.412 1.188 2.832 1.416.408.216.684.324.78.504.108.18.084.948-.192 1.728z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium capitalize">{ch.channel_type}</p>
                    <p className={`text-xs ${ch.enabled ? "text-neon-green" : "text-text-muted"}`}>
                      {ch.enabled ? "Active" : "Disabled"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleChannel(ch, !ch.enabled)}
                    disabled={togglingChannel === ch.id}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${
                      ch.enabled
                        ? "border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/5"
                        : "border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/5"
                    }`}
                  >
                    {togglingChannel === ch.id ? "..." : (ch.enabled ? "Disable" : "Enable")}
                  </button>
                  <button
                    onClick={() => handleDisconnectChannel(ch)}
                    disabled={disconnectingChannel === ch.id}
                    className="text-xs px-3 py-1.5 rounded border border-red-400/30 text-red-400 hover:bg-red-400/5 transition-colors disabled:opacity-50"
                  >
                    {disconnectingChannel === ch.id ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border-cyan pt-4 mb-4">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-sky-400">
              <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Connect Telegram
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-neon-cyan underline">@BotFather</a> on Telegram, then paste the token below.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="1234567890:ABCdefGHIjklmNOPqrstUVwxyz"
              className="flex-1 bg-surface-2 text-sm text-text-primary border border-border-cyan rounded-lg px-3 py-2 focus:outline-none focus:border-neon-cyan/40 font-mono"
            />
            <button
              onClick={handleConnectTelegram}
              disabled={!botToken.trim() || connectingTelegram}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {connectingTelegram ? "Connecting..." : "Connect"}
            </button>
          </div>
        </div>

        <div className="border-t border-border-cyan pt-4">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-neon-green">
              <path d="M12.048 0C5.46 0 .144 5.316.144 11.904c0 2.112.552 4.176 1.608 5.988L0 24l6.336-1.632c1.764.972 3.756 1.488 5.712 1.488 6.588 0 11.904-5.316 11.904-11.904S18.636 0 12.048 0zm6.096 16.332c-.276.78-1.632 1.488-2.664 1.572-.708.06-1.464.24-4.992-1.068-4.092-1.512-6.48-5.076-6.672-5.316-.204-.252-1.596-2.124-1.596-4.056s1.008-2.88 1.368-3.276c.36-.396.78-.516 1.056-.516.264 0 .528.012.768.012.24 0 .648-.084 1.008.756.36.84 1.224 2.904 1.332 3.108.108.204.18.444.036.72-.144.264-.216.384-.432.612-.216.228-.444.504-.636.672-.216.192-.432.408-.192.804.24.396 1.068 1.764 2.292 2.856 1.584 1.404 2.904 1.848 3.324 2.052.42.204.66.168.9-.096.24-.264 1.032-1.2 1.308-1.62.276-.42.552-.348.924-.204.384.144 2.412 1.188 2.832 1.416.408.216.684.324.78.504.108.18.084.948-.192 1.728z"/>
            </svg>
            Connect WhatsApp
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Enter your WhatsApp Business credentials.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={waPhoneId}
              onChange={(e) => setWaPhoneId(e.target.value)}
              placeholder="Phone Number ID"
              className="w-full bg-surface-2 text-sm text-text-primary border border-border-cyan rounded-lg px-3 py-2 focus:outline-none focus:border-neon-cyan/40 font-mono"
            />
            <input
              type="password"
              value={waAccessToken}
              onChange={(e) => setWaAccessToken(e.target.value)}
              placeholder="Permanent Access Token"
              className="w-full bg-surface-2 text-sm text-text-primary border border-border-cyan rounded-lg px-3 py-2 focus:outline-none focus:border-neon-cyan/40 font-mono"
            />
            <button
              onClick={handleConnectWhatsApp}
              disabled={!waAccessToken.trim() || connectingWhatsApp}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {connectingWhatsApp ? "Connecting..." : "Connect"}
            </button>
          </div>
        </div>
      </div>

      {chatbot.status !== "active" && chatbot.status !== "paused" && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Deploy</h2>
          <p className="text-sm text-text-muted mb-4">
            Initialize the AI agent for this chatbot so it can start responding to questions.
          </p>
          {deployError && (
            <p className="text-sm text-red-400 mb-4 bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3">{deployError}</p>
          )}
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium disabled:opacity-50"
          >
            {deploying ? "Deploying..." : "Deploy Chatbot"}
          </button>
        </div>
      )}
    </div>
  );
}
