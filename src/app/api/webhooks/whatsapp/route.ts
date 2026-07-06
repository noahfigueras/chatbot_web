import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { whatsappHandler } from "@/lib/channels/whatsapp";

const AI_WORKER_URL = process.env.AI_WORKER_URL || "http://localhost:4000";

// Meta verification challenge: GET /api/webhooks/whatsapp
// ?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=yyy
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expected || token !== expected) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

// Incoming messages: POST /api/webhooks/whatsapp
export async function POST(req: Request) {
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const body = await req.json();

  // Extract message from WhatsApp payload
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const messages = value?.messages;
  const phoneNumberId = value?.metadata?.phone_number_id;

  if (!messages || !phoneNumberId) {
    // Not a message update (e.g. status callback) — ack
    return NextResponse.json({ ok: true });
  }

  const msg = messages[0];
  if (msg?.type !== "text") {
    return NextResponse.json({ ok: true });
  }

  const chatId = msg.from;
  const text = msg.text.body;

  // Look up which chatbot owns this phone number
  const { data: channels } = await adminClient
    .from("channels")
    .select("*, chatbot_id")
    .eq("channel_type", "whatsapp")
    .eq("enabled", true);

  const channel = channels?.find(
    (c) => (c.config as Record<string, unknown>).phoneNumberId === phoneNumberId
  );

  if (!channel) {
    return NextResponse.json({ error: "No matching channel" }, { status: 404 });
  }

  const sessionId = `whatsapp-${chatId}`;

  try {
    // Save user message
    await adminClient.from("messages").insert({
      chatbot_id: channel.chatbot_id,
      session_id: sessionId,
      role: "user",
      content: text,
    });

    // Call AI worker
    const workerRes = await fetch(`${AI_WORKER_URL}/agent/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatbotId: channel.chatbot_id,
        sessionId,
        question: text,
      }),
    });

    if (!workerRes.ok) {
      const err = await workerRes.text();
      await whatsappHandler
        .sendMessage(channel.config, chatId, `I encountered an error: ${err}`)
        .catch(() => {});
      return NextResponse.json({ ok: true });
    }

    // Read SSE stream
    const reader = workerRes.body?.getReader();
    let fullResponse = "";
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "token") fullResponse += data.content;
            } catch {}
          }
        }
      }
    }

    // Save assistant response
    if (fullResponse) {
      await adminClient.from("messages").insert({
        chatbot_id: channel.chatbot_id,
        session_id: sessionId,
        role: "assistant",
        content: fullResponse,
      });

      // Send via WhatsApp
      await whatsappHandler
        .sendMessage(channel.config, chatId, fullResponse)
        .catch(() => {});
    }
  } catch (err: any) {
    await whatsappHandler
      .sendMessage(channel.config, chatId, "Sorry, an unexpected error occurred.")
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
