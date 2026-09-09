import { Metadata } from "next";
import Link from "next/link";
import { User2 } from "lucide-react";
import LoginForm from "./login-form";
import GoogleLoginButton from "./google-login-button";

export const metadata: Metadata = {
  title: "Login - Chatbot Nara",
  description: "Masuk ke Chatbot Nara SMK Telekomunikasi Tunas Harapan",
};

interface PageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full p-4 shadow-lg mb-4">
            <User2 className="size-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Chatbot Nara</h1>
          <p className="text-sm text-gray-400 mt-1">
            Masuk untuk menggunakan asisten virtual
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          {message && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Atau</span>
            </div>
          </div>

          <GoogleLoginButton />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Daftar
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
