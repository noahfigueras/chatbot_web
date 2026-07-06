import type { ChannelHandler } from "./types";

const TELEGRAM_API = "https://api.telegram.org/bot";

function botApi(token: string, method: string) {
  return `${TELEGRAM_API}${token}/${method}`;
}

export const telegramHandler: ChannelHandler = {
  validateConfig(config) {
    const token = config.botToken;
    if (!token || typeof token !== "string") {
      return "botToken is required";
    }
    if (!/^\d+:[\w-]+$/.test(token)) {
      return "Invalid Telegram bot token format";
    }
    return null;
  },

  async registerWebhook(channelId, config) {
    const token = config.botToken as string;
    const baseUrl = (process.env.WEBHOOK_BASE_URL || "").replace(/\/+$/, "");
    if (!baseUrl) {
      return "WEBHOOK_BASE_URL environment variable is not set";
    }
    const webhookUrl = `${baseUrl}/api/webhooks/telegram/${channelId}`;

    const res = await fetch(botApi(token, "setWebhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return data.description || "Failed to set webhook";
    }
    return null;
  },

  async unregisterWebhook(config) {
    const token = config.botToken as string;
    const res = await fetch(botApi(token, "deleteWebhook"), { method: "POST" });
    const data = await res.json();
    if (!data.ok) {
      return data.description || "Failed to delete webhook";
    }
    return null;
  },

  async sendMessage(config, chatId, text) {
    const token = config.botToken as string;
    const res = await fetch(botApi(token, "sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: parseInt(chatId, 10),
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.description || "Failed to send message");
    }
  },
};
