"use client";

import { useState } from "react";
import { signInWithEmail } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {      const [isLoading, setIsLoading] = useState(false);
      const [showPassword, setShowPassword] = useState(false);

      return (
    <form
      action={async (formData) => {
        setIsLoading(true);
        await signInWithEmail(formData);
        setIsLoading(false);
      }}
      className="space-y-4"
    >
      {/* Email or Username */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email atau Username
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Email atau Username"
            required
            className="pl-10 h-11 rounded-xl border-blue-200 bg-blue-50/50 focus-visible:border-blue-500 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="pl-10 h-11 rounded-xl border-blue-200 bg-blue-50/50 focus-visible:border-blue-500 focus-visible:ring-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Memproses...
          </span>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}
