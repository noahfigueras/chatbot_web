import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { telegramHandler } from "@/lib/channels/telegram";
import { whatsappHandler } from "@/lib/channels/whatsapp";
import type { ChannelType } from "@/lib/channels/types";

const handlers: Record<string, typeof telegramHandler> = {
  telegram: telegramHandler,
  whatsapp: whatsappHandler,
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  const { id: chatbotId, channelId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify chatbot ownership
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", chatbotId)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // Get channel
  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .eq("chatbot_id", chatbotId)
    .single();

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const body = await req.json();
  const { enabled, config } = body;

  const handler = handlers[channel.channel_type];
  if (!handler) {
    return NextResponse.json({ error: "Unsupported channel type" }, { status: 400 });
  }

  // Enabling: register webhook, validate config
  if (enabled && !channel.enabled) {
    const effectiveConfig = config || channel.config;
    const webhookError = await handler.registerWebhook(channel.id, effectiveConfig);
    if (webhookError) {
      return NextResponse.json({ error: webhookError }, { status: 502 });
    }
  }

  // Disabling: unregister webhook
  if (enabled === false && channel.enabled) {
    await handler.unregisterWebhook(channel.config);
  }

  // Update channel
  const updates: Record<string, unknown> = {};
  if (enabled !== undefined) updates.enabled = enabled;
  if (config) updates.config = config;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("channels")
    .update(updates)
    .eq("id", channelId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ channel: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  const { id: chatbotId, channelId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify chatbot ownership
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", chatbotId)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // Get channel to unregister webhook
  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .eq("chatbot_id", chatbotId)
    .single();

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  // Unregister webhook if channel was enabled
  if (channel.enabled) {
    const handler = handlers[channel.channel_type];
    if (handler) {
      await handler.unregisterWebhook(channel.config);
    }
  }

  const { error } = await supabase.from("channels").delete().eq("id", channelId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
