"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Sparkles, SendHorizontal, History, Plus, Trash2, MessageSquare, X } from "lucide-react";
import MarkdownRenderer from "@/components/chat/markdown-renderer";
import TypeWriter from "@/components/ui/typewriter";
import { getChatMessages, createNewChat, deleteChatAction } from "@/lib/chat";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatItem {
  id: string;
  title: string;
  created_at: string;
}

interface ChatBoxProps {
  initialChats?: ChatItem[];
  userId?: string;
}

const QUICK_QUESTIONS = [
  "Apa saja jurusan yang ada?",
  "Bagaimana cara mendaftar?",
  "Apa saja fasilitas sekolah?",
  "Ceritakan tentang profil sekolah",
];

export default function ChatBox({ initialChats = [], userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatItem[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId);
    setIsHistoryOpen(false);
    setIsLoading(true);
    const history = await getChatMessages(chatId);
    setMessages(history.map((m) => ({ role: m.role, content: m.content })));
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setIsHistoryOpen(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    await deleteChatAction(chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    let currentChatId = activeChatId;

    // If logged in and no active chat, create one automatically
    if (userId && !currentChatId) {
      const newChat = await createNewChat(messageText.slice(0, 40));
      if (newChat) {
        setChats((prev) => [newChat, ...prev]);
        currentChatId = newChat.id;
        setActiveChatId(newChat.id);
      }
    }

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          chatId: currentChatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan respons");
      }

      const botMessage: Message = { role: "model", content: data.reply };
      setMessages((prev) => [...prev, botMessage]);

      // Update chat title in sidebar if it was a new chat
      if (currentChatId) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId && c.title === "Percakapan Baru"
              ? { ...c, title: messageText.slice(0, 40) }
              : c
          )
        );
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "model",
        content:
          "Mohon maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat. 🙏",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-blue-50 dark:bg-zinc-950">
      {/* Sidebar Drawer for History (Hidden by default, togglable) */}
      {userId && (
        <>
          {/* Overlay */}
          {isHistoryOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40 transition-opacity"
              onClick={() => setIsHistoryOpen(false)}
            />
          )}

          <div
            className={`absolute inset-y-0 left-0 z-50 w-80 bg-white dark:bg-zinc-900 border-r border-blue-100 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
              isHistoryOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-blue-100 dark:border-zinc-800 flex items-center justify-between bg-blue-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <History className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs text-gray-800 dark:text-zinc-100 uppercase tracking-wider">
                  Riwayat Percakapan
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={handleNewChat}
                  size="sm"
                  className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
                >
                  <Plus className="size-3.5" />
                  Baru
                </Button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {chats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="size-8 text-blue-200 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 dark:text-zinc-400">
                    Belum ada riwayat percakapan. Mulai chat baru untuk menyimpan riwayat!
                  </p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                      activeChatId === chat.id
                        ? "bg-blue-100 dark:bg-zinc-800 text-blue-900 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MessageSquare className="size-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-blue-50 dark:bg-zinc-950">
        {/* Top bar button to open history for logged-in users */}
        {userId && (
          <div className="absolute top-3 left-3 z-10">
            <Button
              onClick={() => setIsHistoryOpen(true)}
              variant="outline"
              size="sm"
              className="h-9 gap-2 bg-white/90 dark:bg-zinc-900 backdrop-blur-sm border-blue-200 dark:border-zinc-800 text-blue-700 dark:text-blue-400 text-xs shadow-sm hover:bg-blue-50 dark:hover:bg-zinc-800"
            >
              <History className="size-4 text-blue-500 dark:text-blue-400" />
              Riwayat Chat
            </Button>
          </div>
        )}

        {/* Scrollable Messages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 pb-28 pt-14"
        >
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Hero Header — shown only before first user message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Image src="/Chatbot.png" alt="Logo" width={128} height={128} className="rounded-full bg-blue-300 ring-3 ring-blue-400 shadow-lg" />
                <h2 className="mt-8 text-4xl font-bold text-gray-800 dark:text-zinc-100 mb-2">
                  <TypeWriter text="Apa yang bisa saya bantu?" speed={50} />
                </h2>
                <p className="text-base text-gray-400 dark:text-zinc-400 max-w-sm">
                  Asisten Virtual AI SMK Telekomunikasi Tunas Harapan. Ada yang bisa saya bantu?
                </p>
                <div className="flex items-center gap-1.5 mt-4">
                  <span className="size-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400 dark:text-zinc-400">Online & siap membantu</span>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`shrink-0 size-7 rounded-full flex items-center justify-center mt-0.5 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="size-3.5" />
                  ) : (
                    <Image src="/Chatbot.png" alt="Logo" width={32} height={32} className="rounded-full bg-blue-300 ring-1 ring-blue-400 shadow-lg" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-md shadow-lg whitespace-pre-wrap"
                      : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 shadow-lg border-2 border-blue-500/20 dark:border-zinc-800 rounded-tl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="shrink-0 size-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Image src="/Chatbot.png" alt="Logo" width={32} height={32} className="rounded-full bg-blue-300 ring-1 ring-blue-400 shadow-lg" />
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-blue-100/80 dark:border-zinc-800 shadow-sm rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <Sparkles className="size-3 text-blue-400 dark:text-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400 dark:text-blue-400">Mengetik</span>
                    <span className="size-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-1 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating bottom area (Quick questions + input) */}
        <div className="absolute bottom-0 left-0 right-0 w-full bg-gradient-to-t from-blue-50 via-blue-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 pt-4 pb-3 px-4">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Questions — only show when no messages yet */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-500 dark:text-blue-400 border border-blue-200/80 dark:border-zinc-800 rounded-full px-3 py-1 transition-colors cursor-pointer shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 items-center bg-white/80 dark:bg-zinc-900 backdrop-blur-md border border-blue-200 dark:border-zinc-800 shadow-lg rounded-2xl p-1.5">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda..."
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent h-10 px-3 text-sm focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-gray-800 dark:text-zinc-100"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white size-10 p-0 cursor-pointer disabled:opacity-50 shadow-md transition-all shrink-0 flex items-center justify-center"
              >
                <SendHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
