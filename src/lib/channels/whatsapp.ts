import type { ChannelHandler } from "./types";

const WHATSAPP_API = "https://graph.facebook.com/v22.0";

export const whatsappHandler: ChannelHandler = {
  validateConfig(config) {
    const token = config.accessToken;
    const phoneId = config.phoneNumberId;
    if (!token || typeof token !== "string") return "accessToken is required";
    if (!phoneId || typeof phoneId !== "string") return "phoneNumberId is required";
    return null;
  },

  async registerWebhook(_channelId, _config) {
    // Webhook is set up once in Meta Developer Portal at
    // /api/webhooks/whatsapp with the platform's shared verify token.
    return null;
  },

  async unregisterWebhook(_config) {
    // Manual removal in Meta Developer Portal
    return null;
  },

  async sendMessage(config, to, text) {
    const token = config.accessToken as string;
    const phoneId = config.phoneNumberId as string;
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "WhatsApp API error");
    }
  },
};
