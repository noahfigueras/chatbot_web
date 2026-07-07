import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { canUploadFile, getStorageUsed } from "@/lib/tiers";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const chatbotId = formData.get("chatbotId") as string | null;
  const fileType = formData.get("fileType") as string | null;

  if (!file || !chatbotId || !fileType) {
    return NextResponse.json(
      { error: "file, chatbotId, and fileType are required" },
      { status: 400 }
    );
  }

  if (fileType !== "system_prompt" && fileType !== "knowledge") {
    return NextResponse.json(
      { error: "fileType must be system_prompt or knowledge" },
      { status: 400 }
    );
  }

  if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
    return NextResponse.json(
      { error: "Only .md and .txt files are supported" },
      { status: 400 }
    );
  }

  // Verify chatbot belongs to user
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", chatbotId)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  if (!adminClient) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  // Check storage limit
  const cap = await canUploadFile(user.id);
  if (!cap.allowed) {
    return NextResponse.json({ error: cap.reason }, { status: 403 });
  }

  // Upload to Supabase Storage
  const storagePath = `${chatbotId}/${file.name}`;
  const { error: uploadError } = await adminClient.storage
    .from("knowledge")
    .upload(storagePath, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Read content for caching
  const content = await file.text();

  // Create knowledge_files record
  const { data: record, error: dbError } = await supabase
    .from("knowledge_files")
    .insert({
      chatbot_id: chatbotId,
      file_type: fileType,
      file_name: file.name,
      storage_path: storagePath,
      content,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ file: record });
}
