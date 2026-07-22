"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);

    try {
      const res = await fetch(`/api/chatbots/${params.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId }),
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error || "Failed to get response"}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to connect. Make sure the AI worker is running." },
      ]);
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-cyan">
        <Link
          href={`/dashboard/chatbots/${params.id}`}
          className="text-sm text-text-muted hover:text-neon-cyan transition-colors"
        >
          &larr; Back to chatbot
        </Link>
        <span className="text-xs text-text-dim font-mono">session: {sessionId.slice(0, 8)}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-text-muted text-sm">Ask a question to test your chatbot.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                msg.role === "user"
                  ? "bg-neon-cyan/10 border border-neon-cyan/20 rounded-br-sm"
                  : "bg-surface-2 border border-border-cyan rounded-bl-sm"
              }`}
            >
              <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-surface-2 border border-border-cyan rounded-2xl rounded-bl-sm px-5 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-cyan px-6 py-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-5 py-3 rounded-xl bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
