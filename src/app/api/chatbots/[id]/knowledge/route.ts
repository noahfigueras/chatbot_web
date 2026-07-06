import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { canUploadFile } from "@/lib/tiers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileType, content, fileName } = await req.json();

  if (!fileType || !content) {
    return NextResponse.json(
      { error: "fileType and content are required" },
      { status: 400 }
    );
  }

  if (fileType !== "system_prompt" && fileType !== "knowledge") {
    return NextResponse.json(
      { error: "fileType must be system_prompt or knowledge" },
      { status: 400 }
    );
  }

  // Verify chatbot belongs to user
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", id)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // Check storage limit
  const cap = await canUploadFile(user.id);
  if (!cap.allowed) {
    return NextResponse.json({ error: cap.reason }, { status: 403 });
  }

  if (!adminClient) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  // Create the file in Supabase Storage
  const blob = new Blob([content], { type: "text/markdown" });
  const safeFileName = fileName || `${fileType === "system_prompt" ? "system_prompt" : "knowledge"}_${Date.now()}.md`;
  const storagePath = `${id}/${safeFileName}`;

  const { error: uploadError } = await adminClient.storage
    .from("knowledge")
    .upload(storagePath, blob, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Create knowledge_files record
  const { data: record, error: dbError } = await supabase
    .from("knowledge_files")
    .insert({
      chatbot_id: id,
      file_type: fileType,
      file_name: safeFileName,
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
