import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { telegramHandler } from "@/lib/channels/telegram";

const AI_WORKER_URL = process.env.AI_WORKER_URL || "http://localhost:4000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const supabase = adminClient;

  // Look up channel
  const { data: channel } = await supabase
    .from("channels")
    .select("*, chatbot_id")
    .eq("id", channelId)
    .eq("channel_type", "telegram")
    .eq("enabled", true)
    .single();

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const update = await req.json();

  // Only handle text messages
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (!message || !chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  // Ignore bot commands
  if (text.startsWith("/")) {
    return NextResponse.json({ ok: true });
  }

  const sessionId = `telegram-${chatId}`;

  try {
    // Save user message
    await supabase.from("messages").insert({
      chatbot_id: channel.chatbot_id,
      session_id: sessionId,
      role: "user",
      content: text,
    });

    // Call AI worker
    const workerUrl = `${AI_WORKER_URL}/agent/message`;
    const workerRes = await fetch(workerUrl, {
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
      await telegramHandler.sendMessage(
        channel.config,
        String(chatId),
        `Sorry, I encountered an error: ${err}`
      );
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
    }

    // Save assistant response
    if (fullResponse) {
      await supabase.from("messages").insert({
        chatbot_id: channel.chatbot_id,
        session_id: sessionId,
        role: "assistant",
        content: fullResponse,
      });

      // Send to Telegram
      await telegramHandler.sendMessage(channel.config, String(chatId), fullResponse);
    }
  } catch (err: any) {
    await telegramHandler
      .sendMessage(channel.config, String(chatId), "Sorry, an unexpected error occurred.")
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
