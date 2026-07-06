import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: chatbot, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !chatbot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const { data: knowledgeFiles } = await supabase
    .from("knowledge_files")
    .select("id, file_name, file_type, storage_path, created_at")
    .eq("chatbot_id", id);

  return NextResponse.json({ chatbot, knowledgeFiles });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status } = body;

  if (!status || !["active", "paused", "draft"].includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: active, paused, draft" },
      { status: 400 }
    );
  }

  const { data: chatbot, error } = await supabase
    .from("chatbots")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chatbot });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch knowledge files to clean up storage
  const { data: knowledgeFiles } = await supabase
    .from("knowledge_files")
    .select("storage_path")
    .eq("chatbot_id", id);

  // Delete files from Supabase Storage
  if (knowledgeFiles && knowledgeFiles.length > 0 && adminClient) {
    const paths = knowledgeFiles.map((f) => f.storage_path);
    await adminClient.storage.from("knowledge").remove(paths);
  }

  // Delete the chatbot (cascades to knowledge_files and messages)
  const { error } = await supabase.from("chatbots").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
