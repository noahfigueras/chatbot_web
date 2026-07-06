import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export const TIERS = {
  free: {
    label: "Free",
    chatbots: 5,
    messagesPerBot: 500,
    storageMB: 10,
  },
  pro: {
    label: "Pro",
    chatbots: 15,
    messagesPerBot: 5000,
    storageMB: 100,
  },
} as const;

export type PlanTier = keyof typeof TIERS;

export const STRIPE_PRICES: Record<PlanTier, string | null> = {
  free: null,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
};

export async function getUserTier(userId: string): Promise<PlanTier> {
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_tier")
    .eq("profile_id", userId)
    .single();
  return (sub?.plan_tier as PlanTier) || "free";
}

export async function getChatbotCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("chatbots")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId);
  return count || 0;
}

export async function getMessageCount(chatbotId: string): Promise<number> {
  if (!adminClient) return 0;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data } = await adminClient
    .from("usage")
    .select("messages_sent")
    .eq("chatbot_id", chatbotId)
    .eq("period_start", startOfMonth.toISOString())
    .single();

  return data?.messages_sent || 0;
}

export async function getStorageUsed(userId: string): Promise<number> {
  if (!adminClient) return 0;
  const supabase = await createClient();
  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("id")
    .eq("profile_id", userId);

  if (!chatbots?.length) return 0;

  const ids = chatbots.map((c) => c.id);
  const { data: files } = await supabase
    .from("knowledge_files")
    .select("storage_path")
    .in("chatbot_id", ids);

  if (!files?.length) return 0;

  let totalBytes = 0;
  for (const file of files) {
    const { data: meta } = await supabase.storage
      .from("knowledge")
      .info(file.storage_path);
    if (meta) totalBytes += meta.metadata?.size || 0;
  }

  return Math.round(totalBytes / (1024 * 1024));
}

export async function canCreateChatbot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getUserTier(userId);
  const count = await getChatbotCount(userId);
  const limit = TIERS[tier].chatbots;

  if (count >= limit) {
    return {
      allowed: false,
      reason: `You've reached the ${tier === "free" ? "free" : "Pro"} plan limit of ${limit} chatbots. Upgrade to Pro to create more.`,
    };
  }
  return { allowed: true };
}

export async function canSendMessage(chatbotId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", chatbotId)
    .single();

  if (!chatbot) return { allowed: false, reason: "Chatbot not found" };

  const tier = await getUserTier(chatbot.profile_id);
  const usage = await getMessageCount(chatbotId);
  const limit = TIERS[tier].messagesPerBot;

  if (usage >= limit) {
    return {
      allowed: false,
      reason: `This chatbot has reached the monthly message limit of ${limit}. Upgrade to Pro for more.`,
    };
  }
  return { allowed: true };
}

export async function canUploadFile(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getUserTier(userId);
  const storageUsed = await getStorageUsed(userId);
  const limit = TIERS[tier].storageMB;

  if (storageUsed >= limit) {
    return {
      allowed: false,
      reason: `You've used ${storageUsed}MB of ${limit}MB storage. Upgrade to Pro for more.`,
    };
  }
  return { allowed: true };
}
