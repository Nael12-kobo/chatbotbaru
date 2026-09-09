import { Metadata } from "next";
import Link from "next/link";
import { User2 } from "lucide-react";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Daftar - Chatbot Nara",
  description: "Buat akun Chatbot Nara SMK Telekomunikasi Tunas Harapan",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full p-4 shadow-lg mb-4">
            <User2 className="size-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Buat Akun</h1>
          <p className="text-sm text-gray-400 mt-1">
            untuk menggunakan Chatbot Nara
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <SignupForm />

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 mt-6">
          © 2025 SMK Telekomunikasi Tunas Harapan
        </p>
      </div>
    </div>
  );
}
