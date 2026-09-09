import { Metadata } from "next";
import ChatBox from "@/components/chat/chat-box";
import Navbar from "@/components/ui/navigationMenu";
import { createClient } from "@/lib/supabase/server";
import { getUserChats } from "@/lib/chat";

export const metadata: Metadata = {
  title: "Chatbot - SMK Telekomunikasi Tunas Harapan",
  description:
    "Asisten virtual SMK Telekomunikasi Tunas Harapan. Tanyakan informasi seputar sekolah, jurusan, penerimaan siswa baru, dan lainnya.",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userProfile = user
    ? {
        email: user.email,
        full_name: user.user_metadata?.full_name,
      }
    : null;

  const chats = user ? await getUserChats() : [];

  return (
    <div className="flex flex-col h-screen bg-blue-50 dark:bg-zinc-950 overflow-hidden">
      <Navbar user={userProfile} />

      {/* Chat Area — fills remaining space */}
      <main className="flex-1 min-h-0">
        <ChatBox initialChats={chats} userId={user?.id} />
      </main>
    </div>
  );
}
