"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GuideCard from "@/components/GuideCard";

export default function NewChatbotPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemFile, setSystemFile] = useState<File | null>(null);
  const [systemText, setSystemText] = useState("");
  const [systemMode, setSystemMode] = useState<"upload" | "write">("write");
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState("");
  const [knowledgeMode, setKnowledgeMode] = useState<"upload" | "write">("upload");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleAddKnowledge = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setKnowledgeFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeKnowledgeFile = (index: number) => {
    setKnowledgeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const chatbotId = data.chatbot.id;

      // Upload system prompt
      if (systemFile) {
        const sysForm = new FormData();
        sysForm.append("file", systemFile);
        sysForm.append("chatbotId", chatbotId);
        sysForm.append("fileType", "system_prompt");

        const sysRes = await fetch("/api/upload", {
          method: "POST",
          body: sysForm,
        });
        if (!sysRes.ok) {
          const err = await sysRes.json();
          throw new Error(`System prompt upload failed: ${err.error}`);
        }
      } else if (systemText.trim()) {
        const sysRes = await fetch(`/api/chatbots/${chatbotId}/knowledge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: "system_prompt", content: systemText.trim(), fileName: "system_prompt.md" }),
        });
        if (!sysRes.ok) {
          const err = await sysRes.json();
          throw new Error(`System prompt creation failed: ${err.error}`);
        }
      }

      // Upload knowledge files
      for (const file of knowledgeFiles) {
        const knForm = new FormData();
        knForm.append("file", file);
        knForm.append("chatbotId", chatbotId);
        knForm.append("fileType", "knowledge");

        const knRes = await fetch("/api/upload", {
          method: "POST",
          body: knForm,
        });
        if (!knRes.ok) {
          const err = await knRes.json();
          throw new Error(`Knowledge file upload failed: ${err.error}`);
        }
      }

      // Upload typed knowledge
      if (knowledgeText.trim()) {
        const knRes = await fetch(`/api/chatbots/${chatbotId}/knowledge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: "knowledge", content: knowledgeText.trim(), fileName: "knowledge.md" }),
        });
        if (!knRes.ok) {
          const err = await knRes.json();
          throw new Error(`Knowledge creation failed: ${err.error}`);
        }
      }

      router.push(`/dashboard/chatbots/${chatbotId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCreating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-text-muted hover:text-neon-cyan transition-colors mb-6 inline-block"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create New Chatbot</h1>
      <p className="text-text-muted mb-8">Configure your AI chatbot in 3 steps.</p>

      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                step >= s
                  ? "bg-gradient-to-br from-neon-cyan to-neon-purple text-white"
                  : "bg-surface-2 text-text-dim border border-border-cyan"
              }`}
            >
              {s}
            </div>
            <span className={`text-xs ${step >= s ? "text-text-primary" : "text-text-dim"}`}>
              {s === 1 ? "Config" : s === 2 ? "Knowledge" : "Review"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-border-cyan mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="glass-card rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">Chatbot Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Support Bot"
              className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this chatbot do?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 rounded-lg border border-border-cyan">
            <svg className="w-5 h-5 text-neon-cyan shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-text-primary">Powered by <span className="font-mono text-neon-cyan">GPT-5.4-nano</span></span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 disabled:opacity-50"
            >
              Next: Knowledge
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">
              System Prompt <span className="text-neon-cyan">*</span>
            </label>

            <div className="mb-3">
              <GuideCard title="What is a system prompt?">
                <p>
                  The system prompt is the core instruction that defines your chatbot&apos;s personality,
                  behavior, and knowledge boundaries. It&apos;s sent to the AI with every conversation.
                </p>
                <p className="font-medium text-neon-cyan/80">Best practices:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Start with <span className="text-white/70">&quot;You are a...&quot;</span> to define the role</li>
                  <li>Set the tone: professional, friendly, concise, etc.</li>
                  <li>Include response format rules (e.g. &quot;Always greet the user&quot;)</li>
                  <li>Define boundaries — what it should <span className="text-white/70">not</span> do</li>
                </ul>
                <p className="font-medium text-neon-cyan/80">Example:</p>
                <pre className="bg-surface-2 rounded p-2 text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap font-mono">
{`You are a customer support agent for Acme Corp.
Be friendly, professional, and concise.
Always introduce yourself.
If you don't know something, say so — never invent answers.
For refunds, ask for the order number.`}
                </pre>
              </GuideCard>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => { setSystemMode("write"); setSystemFile(null); }}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${systemMode === "write" ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" : "text-text-muted border-border-cyan hover:text-text-primary"}`}
              >
                Write
              </button>
              <button
                onClick={() => { setSystemMode("upload"); setSystemText(""); }}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${systemMode === "upload" ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" : "text-text-muted border-border-cyan hover:text-text-primary"}`}
              >
                Upload .md / .txt
              </button>
            </div>

            {systemMode === "write" ? (
              <textarea
                value={systemText}
                onChange={(e) => setSystemText(e.target.value)}
                placeholder="You are a helpful customer support assistant for Acme Corp. You speak professionally and concisely..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none font-mono"
              />
            ) : systemFile ? (
              <div className="flex items-center justify-between bg-surface-2 rounded-lg px-4 py-3 border border-border-cyan">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-text-primary">{systemFile.name}</span>
                  <span className="text-xs text-text-dim">{(systemFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <button onClick={() => setSystemFile(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border-cyan rounded-lg p-8 cursor-pointer hover:border-neon-cyan/30 transition-colors">
                <svg className="w-8 h-8 text-text-dim mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-text-muted">Click to upload system_prompt.md or .txt</p>
                <input type="file" accept=".md,.txt" onChange={(e) => setSystemFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">
              Knowledge Files <span className="text-text-dim">(optional)</span>
            </label>

            <div className="mb-3">
              <GuideCard title="What are knowledge files?">
                <p>
                  Knowledge files give your chatbot reference information to draw from. The AI reads
                  these files when answering questions — like giving it a manual to look things up.
                </p>
                <p className="font-medium text-neon-cyan/80">Tips:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Use markdown headings (<span className="text-white/70">##</span>, <span className="text-white/70">###</span>) to organize topics</li>
                  <li>One topic per file — the AI searches across all files</li>
                  <li>Keep information factual and structured</li>
                  <li>Accepted formats: <span className="text-white/70">.md</span> (Markdown) and <span className="text-white/70">.txt</span> (plain text)</li>
                </ul>
                <p className="font-medium text-neon-cyan/80">Example structure in a .md file:</p>
                <pre className="bg-surface-2 rounded p-2 text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap font-mono">
{`## Products

- ChatBot Pro: €20/month, 15 chatbots
- Knowledge storage: 100 MB

## Shipping

- All plans are digital delivery — instant access
- No physical shipping`}
                </pre>
              </GuideCard>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => { setKnowledgeMode("write"); setKnowledgeFiles([]); }}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${knowledgeMode === "write" ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" : "text-text-muted border-border-cyan hover:text-text-primary"}`}
              >
                Write
              </button>
              <button
                onClick={() => { setKnowledgeMode("upload"); setKnowledgeText(""); }}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${knowledgeMode === "upload" ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" : "text-text-muted border-border-cyan hover:text-text-primary"}`}
              >
                Upload .md / .txt files
              </button>
            </div>

            {knowledgeMode === "write" ? (
              <textarea
                value={knowledgeText}
                onChange={(e) => setKnowledgeText(e.target.value)}
                placeholder="## Product Information\n\nOur flagship product is ChatBot Pro, an AI-powered customer support platform...\n\n## Pricing\n\n- Free: 1 chatbot, 500 messages/mo\n- Pro: €50/mo, 3 chatbots, 5000 messages/mo"
                rows={8}
                className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border-cyan text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none font-mono"
              />
            ) : (
              <>
                {knowledgeFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {knowledgeFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-surface-2 rounded-lg px-4 py-3 border border-border-cyan">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-text-primary">{file.name}</span>
                          <span className="text-xs text-text-dim">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button onClick={() => removeKnowledgeFile(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border-cyan rounded-lg p-6 cursor-pointer hover:border-neon-cyan/30 transition-colors">
                  <svg className="w-6 h-6 text-text-dim mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm text-text-muted">Add knowledge files</p>
                  <input type="file" accept=".md,.txt" multiple onChange={handleAddKnowledge} className="hidden" />
                </label>
              </>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="text-sm text-text-muted hover:text-white transition-colors">
              &larr; Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!systemFile && !systemText.trim()}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 disabled:opacity-50"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white">Review Your Chatbot</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-border-cyan">
              <span className="text-sm text-text-muted">Name</span>
              <span className="text-sm text-white font-medium">{name}</span>
            </div>
            {description && (
              <div className="flex justify-between py-3 border-b border-border-cyan">
                <span className="text-sm text-text-muted">Description</span>
                <span className="text-sm text-white max-w-xs text-right">{description}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-b border-border-cyan">
              <span className="text-sm text-text-muted">Model</span>
              <span className="text-sm text-neon-cyan font-mono">GPT-5.4-nano</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border-cyan">
              <span className="text-sm text-text-muted">System Prompt</span>
              <span className="text-sm text-white max-w-xs text-right truncate">
                {systemFile ? systemFile.name : systemText ? `${systemText.slice(0, 50)}...` : ""}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-text-muted">Knowledge</span>
              <span className="text-sm text-white max-w-xs text-right truncate">
                {knowledgeText ? `${knowledgeText.slice(0, 50)}...` : `${knowledgeFiles.length} file${knowledgeFiles.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="text-sm text-text-muted hover:text-white transition-colors">
              &larr; Back
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Chatbot"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
