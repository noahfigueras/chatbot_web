import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AI_WORKER_URL = process.env.AI_WORKER_URL || "http://localhost:4000";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: chatbot, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !chatbot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  chatbot.provider = "openai";
  chatbot.model = "gpt-5.4-nano";

  // Check if knowledge files exist
  const { count } = await supabase
    .from("knowledge_files")
    .select("*", { count: "exact", head: true })
    .eq("chatbot_id", id);

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "Upload knowledge files before deploying" },
      { status: 400 }
    );
  }

  // Call AI worker to initialize the agent
  const workerUrl = `${AI_WORKER_URL}/agent/initialize`;

  const workerRes = await fetch(workerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatbotId: id,
      provider: chatbot.provider,
      model: chatbot.model,
    }),
  });

  if (!workerRes.ok) {
    const err = await workerRes.text();
    return NextResponse.json(
      { error: `AI worker initialization failed: ${err}` },
      { status: 502 }
    );
  }

  // Persist active status to database
  await supabase.from("chatbots").update({ status: "active" }).eq("id", id);

  return NextResponse.json({ ok: true, status: "active" });
}
