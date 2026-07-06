import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canSendMessage } from "@/lib/tiers";
import { incrementUsage } from "@/lib/usage";

const AI_WORKER_URL = process.env.AI_WORKER_URL || "http://localhost:4000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, sessionId } = await req.json();

  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // Check chatbot is active
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("status")
    .eq("id", id)
    .single();

  if (!chatbot || chatbot.status !== "active") {
    return NextResponse.json(
      { error: "Chatbot is not active. Deploy it first." },
      { status: 400 }
    );
  }

  // Check message limit
  const cap = await canSendMessage(id);
  if (!cap.allowed) {
    return NextResponse.json({ error: cap.reason }, { status: 403 });
  }

  const sid = sessionId || crypto.randomUUID();

  // Save user message
  await supabase.from("messages").insert({
    chatbot_id: id,
    session_id: sid,
    role: "user",
    content: question,
  });

  // Call AI worker and stream response
  const workerUrl = `${AI_WORKER_URL}/agent/message`;

  const workerRes = await fetch(workerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatbotId: id,
      sessionId: sid,
      question,
    }),
  });

  if (!workerRes.ok) {
    const err = await workerRes.text();
    return NextResponse.json(
      { error: `AI worker error: ${err}` },
      { status: 502 }
    );
  }

  // Read the SSE stream from the worker and collect the response
  const reader = workerRes.body?.getReader();
  if (!reader) {
    return NextResponse.json({ error: "No response stream" }, { status: 502 });
  }

  let fullResponse = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "token") {
            fullResponse += data.content;
          }
        } catch {}
      }
    }
  }

  // Save assistant response
  if (fullResponse) {
    await supabase.from("messages").insert({
      chatbot_id: id,
      session_id: sid,
      role: "assistant",
      content: fullResponse,
    });
  }

  // Track usage
  await incrementUsage(id);

  return NextResponse.json({
    response: fullResponse,
    sessionId: sid,
  });
}
