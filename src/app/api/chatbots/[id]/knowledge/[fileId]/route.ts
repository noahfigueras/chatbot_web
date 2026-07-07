import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id: chatbotId, fileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Verify chatbot ownership
  const { data: file } = await supabase
    .from("knowledge_files")
    .select("storage_path, chatbot_id, file_name")
    .eq("id", fileId)
    .single();

  if (!file) {
    return NextResponse.json({ error: "Knowledge file not found" }, { status: 404 });
  }

  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", chatbotId)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // Update in storage
  if (adminClient) {
    const blob = new Blob([content], { type: "text/markdown" });
    const blobFile = new File([blob], file.file_name, { type: "text/markdown" });
    await adminClient.storage.from("knowledge").upload(file.storage_path, blobFile, { upsert: true });
  }

  // Update database record
  const { data: updated, error } = await supabase
    .from("knowledge_files")
    .update({ content })
    .eq("id", fileId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id: chatbotId, fileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify chatbot belongs to user and get file info
  const { data: file } = await supabase
    .from("knowledge_files")
    .select("storage_path, chatbot_id")
    .eq("id", fileId)
    .single();

  if (!file) {
    return NextResponse.json({ error: "Knowledge file not found" }, { status: 404 });
  }

  // Verify chatbot ownership
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("profile_id")
    .eq("id", chatbotId)
    .single();

  if (!chatbot || chatbot.profile_id !== user.id) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // Delete from storage
  if (adminClient) {
    await adminClient.storage.from("knowledge").remove([file.storage_path]);
  }

  // Delete from database
  const { error } = await supabase.from("knowledge_files").delete().eq("id", fileId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
