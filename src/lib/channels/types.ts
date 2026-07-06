export type ChannelType = "telegram" | "whatsapp";

export interface Channel {
  id: string;
  chatbot_id: string;
  channel_type: ChannelType;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChannelHandler {
  validateConfig(config: Record<string, unknown>): string | null;
  registerWebhook(channelId: string, config: Record<string, unknown>): Promise<string | null>;
  unregisterWebhook(config: Record<string, unknown>): Promise<string | null>;
  sendMessage(config: Record<string, unknown>, chatId: string, text: string): Promise<void>;
}
