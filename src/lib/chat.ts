"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserChats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }

  return data || [];
}

export async function getChatMessages(chatId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

export async function createNewChat(title: string = "Percakapan Baru") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: user.id, title })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  revalidatePath("/chat");
  return data;
}

export async function saveMessageAction(chatId: string, role: "user" | "model", content: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content });

  if (error) {
    console.error("Error saving message:", error);
  }
}

export async function updateChatTitle(chatId: string, title: string) {
  const supabase = await createClient();
  await supabase
    .from("chats")
    .update({ title: title.slice(0, 50) })
    .eq("id", chatId);
  revalidatePath("/chat");
}

export async function deleteChatAction(chatId: string) {
  const supabase = await createClient();
  await supabase.from("chats").delete().eq("id", chatId);
  revalidatePath("/chat");
}
