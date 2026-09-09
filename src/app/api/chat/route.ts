import { NextRequest, NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@/lib/supabase/server";

// Load all knowledge files from the knowledge directory
function loadKnowledge(): string {
  const knowledgeDir = join(process.cwd(), "knowledge");
  const files = readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));
  let knowledge = "";
  for (const file of files) {
    const content = readFileSync(join(knowledgeDir, file), "utf-8");
    knowledge += `\n\n--- ${file} ---\n${content}`;
  }
  return knowledge;
}

const KNOWLEDGE = loadKnowledge();

const SYSTEM_INSTRUCTION = `Anda adalah Nara, asisten virtual resmi dari SMK Telekomunikasi Tunas Harapan. 
Tugas Anda adalah membantu calon siswa, orang tua, dan masyarakat umum dengan informasi tentang sekolah ini.

### ATURAN MERESPON:
1. Selalu gunakan bahasa Indonesia yang sopan, ramah, dan mudah dipahami.
2. Sapa pengguna dengan hangat dan profesional.
3. Jawab pertanyaan HANYA berdasarkan informasi yang tersedia dalam pengetahuan (knowledge) yang diberikan di bawah.
4. Jika informasi yang diminta tidak ada dalam pengetahuan, katakan dengan jujur: "Mohon maaf, informasi tersebut belum tersedia. Silakan hubungi pihak sekolah untuk informasi lebih lanjut."
5. Gunakan format Markdown yang rapi dalam respons:
   - Gunakan ### untuk sub-judul/heading
   - Gunakan **teks** untuk teks penting/bold
   - Gunakan - item untuk daftar poin
   - Gunakan 1. item untuk daftar bernomor
   - Gunakan --- untuk garis pemisah
   - Gunakan > kutipan untuk penekanan
   - Pisahkan paragraf dengan baris kosong
   - Jangan gunakan tabel Markdown, gunakan daftar poin sebagai pengganti
6. Jika ditanya tentang hal di luar konteks sekolah (misal: cuaca, berita umum, resep masakan), arahkan kembali ke topik sekolah dengan sopan.
7. Promosikan sekolah dengan positif namun tetap jujur dan realistis.
8. Akhiri respons dengan penawaran bantuan lanjutan jika relevan.
9. dilarang menjawab pertanyaan yang bersifat pribadi, sensitif, atau ilegal. Jika ditanya hal tersebut, jawab dengan sopan bahwa Anda tidak dapat memberikan informasi tersebut.
10. dilarang menjawab pertanyaan untuk tugas sekolah, ujian, atau pekerjaan rumah. Jika ditanya hal tersebut, jawab dengan sopan bahwa Anda tidak dapat memberikan jawaban langsung untuk tugas sekolah.


### BAHASA GAYA MERESPON:
- Gunakan kata ganti "kami" untuk merujuk pada sekolah.
- Gunakan kata "Anda" untuk merujuk pada pengguna.
- Berikan semangat dan antusiasme tentang sekolah.

### KETIKA INFORMASI TIDAK TERSEDIA:
Jika pertanyaan pengguna tidak dapat dijawab dengan informasi yang tersedia, gunakan salah satu respons berikut:
- "Mohon maaf, informasi tersebut belum tersedia. Silakan hubungi pihak sekolah untuk informasi lebih lanjut."
- "Kami belum memiliki informasi tersebut saat ini. Silakan kunjungi situs resmi kami atau hubungi pihak sekolah untuk detail lebih lanjut."

### PENGETAHUAN SEKOLAH:
${KNOWLEDGE}`;

interface GeminiMessage {
  role: string;
  parts: { text: string }[];
}

interface ChatRequest {
  messages: { role: "user" | "model"; content: string }[];
  chatId?: string;
}

async function generateChatTitle(userMessage: string, apiKey: string, modelName: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Buatkan judul singkat (maksimal 4 kata) yang merangkum topik berikut dalam bahasa Indonesia. Jawab HANYA dengan judulnya saja tanpa tanda kutip, tanpa titik di akhir, dan tanpa penjelasan lain. Topik: "${userMessage}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 20,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (title) {
        return title.replace(/['"]+/g, "").slice(0, 40);
      }
    }
  } catch (error) {
    console.error("Error generating title with Gemini:", error);
  }

  return userMessage.slice(0, 35);
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di environment variables." },
        { status: 500 }
      );
    }

    // Check user login status
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userName = "";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      userName =
        profile?.username ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Pengguna";
    }

    const userInstruction = user
      ? `\n\n### STATUS PENGGUNA:\nPengguna sedang LOGIN dengan nama/panggilannya adalah "${userName}". Sapa dan panggil mereka dengan nama tersebut secara ramah dalam percakapan.`
      : `\n\n### STATUS PENGGUNA:\nPengguna belum login (sebagai tamu). Jangan panggil atau sebut nama spesifik, cukup sapa secara umum tanpa menyebut nama.`;

    const dynamicSystemInstruction = SYSTEM_INSTRUCTION + userInstruction;

    // Build conversation history for Gemini
    const contents: GeminiMessage[] = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: dynamicSystemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Gagal menghubungi Gemini API. Silakan coba lagi." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "Tidak ada respons dari Gemini API." },
        { status: 500 }
      );
    }

    // Save to database if user is logged in and chatId is provided
    if (user && body.chatId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === "user") {
        // Save user message
        await supabase.from("messages").insert({
          chat_id: body.chatId,
          role: "user",
          content: lastUserMsg.content,
        });

        // Save model reply
        await supabase.from("messages").insert({
          chat_id: body.chatId,
          role: "model",
          content: text,
        });

        // Check if chat has title "Percakapan Baru" and update with first user message
        const { data: chatData } = await supabase
          .from("chats")
          .select("title")
          .eq("id", body.chatId)
          .single();

        if (chatData && chatData.title === "Percakapan Baru") {
          const smartTitle = await generateChatTitle(lastUserMsg.content, apiKey, modelName);
          await supabase
            .from("chats")
            .update({ title: smartTitle })
            .eq("id", body.chatId);
        }
      }
    }

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
