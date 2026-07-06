import { adminClient } from "@/lib/supabase/admin";

export async function incrementUsage(chatbotId: string) {
  if (!adminClient) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const periodStart = startOfMonth.toISOString();
  const periodEnd = startOfNextMonth.toISOString();

  const { data: existing } = await adminClient
    .from("usage")
    .select("id, messages_sent")
    .eq("chatbot_id", chatbotId)
    .eq("period_start", periodStart)
    .single();

  if (existing) {
    await adminClient
      .from("usage")
      .update({ messages_sent: existing.messages_sent + 1, updated_at: now.toISOString() })
      .eq("id", existing.id);
  } else {
    await adminClient.from("usage").insert({
      chatbot_id: chatbotId,
      period_start: periodStart,
      period_end: periodEnd,
      messages_sent: 1,
    });
  }
}
