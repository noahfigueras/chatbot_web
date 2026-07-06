import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (!adminClient) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const profileId = session.metadata?.profile_id;
      const subscriptionId = session.subscription as string;

      if (profileId && subscriptionId) {
        const subRes = await stripe.subscriptions.retrieve(subscriptionId);
        const subData = subRes as any;

        await adminClient
          .from("subscriptions")
          .update({
            stripe_subscription_id: subscriptionId,
            plan_tier: "pro",
            status: "active",
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          })
          .eq("profile_id", profileId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subData = event.data.object as any;
      const customerId = subData.customer as string;

      const { data: sub } = await adminClient
        .from("subscriptions")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub) {
        const isActive = subData.status === "active" || subData.status === "trialing";
        await adminClient
          .from("subscriptions")
          .update({
            plan_tier: isActive ? "pro" : "free",
            status: subData.status,
            stripe_subscription_id: isActive ? subData.id : null,
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          })
          .eq("id", sub.id);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const updatedSub = await stripe.subscriptions.retrieve(subscriptionId);
        const subData = updatedSub as any;

        await adminClient
          .from("subscriptions")
          .update({
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
            status: "active",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
