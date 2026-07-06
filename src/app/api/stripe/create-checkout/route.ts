import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, createCheckoutSession, PRO_PRICE_ID } from "@/lib/stripe/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, plan_tier")
    .eq("profile_id", user.id)
    .single();

  if (sub?.plan_tier === "pro") {
    return NextResponse.json({ error: "Already on Pro plan" }, { status: 400 });
  }

  let customerId = sub?.stripe_customer_id;

  if (!customerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.name || undefined,
      metadata: { profile_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("profile_id", user.id);
  }

  const session = await createCheckoutSession({
    customerId,
    priceId: PRO_PRICE_ID,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`,
    metadata: { profile_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
