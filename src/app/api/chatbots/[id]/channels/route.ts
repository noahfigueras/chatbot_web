import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { telegramHandler } from "@/lib/channels/telegram";
import { whatsappHandler } from "@/lib/channels/whatsapp";
import type { ChannelType } from "@/lib/channels/types";

const handlers: Record<string, typeof telegramHandler> = {
  telegram: telegramHandler,
  whatsapp: whatsappHandler,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("chatbot_id", id)
    .order("created_at");

  return NextResponse.json({ channels: channels || [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify chatbot ownership
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", id)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const body = await req.json();
  const { channelType, config } = body as {
    channelType: ChannelType;
    config: Record<string, unknown>;
  };

  if (!channelType) {
    return NextResponse.json({ error: "channelType is required" }, { status: 400 });
  }

  const handler = handlers[channelType];
  if (!handler) {
    return NextResponse.json({ error: `Unsupported channel type: ${channelType}` }, { status: 400 });
  }

  const validationError = handler.validateConfig(config);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Create channel record (not enabled yet)
  const { data: channel, error } = await supabase
    .from("channels")
    .insert({
      chatbot_id: id,
      channel_type: channelType,
      config,
      enabled: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ channel });
}
