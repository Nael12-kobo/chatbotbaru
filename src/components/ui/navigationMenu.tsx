"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { signOut } from "@/lib/auth/actions";
import ThemeToggle from "@/components/ui/theme-toggle";
import {
  Menu,
  MessageCircle,
  LogOut,
  LogIn,
} from "lucide-react";

interface NavbarProps {
  user?: {
    email?: string;
    full_name?: string;
  } | null;
}

const NAV_ITEMS = [
  { label: "Chat Baru", href: "/chat", icon: MessageCircle },
];



export default function Navbar({ user }: NavbarProps) {
  const displayName =
    user?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="shrink-0 bg-white dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="md:hidden">
              <Menu className="size-5 text-gray-600 dark:text-zinc-300" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-white dark:bg-zinc-900 dark:text-zinc-100 border-r dark:border-zinc-800">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="bg-blue-700 text-white rounded-lg p-1.5">
                  <Image
                    src="/Chatbot.png"
                    alt="Logo"
                    width={16}
                    height={16}
                    className="rounded-full bg-blue-300 ring-3 ring-blue-400 shadow-lg"
                  />
                </div>
                <span className="font-bold text-sm text-gray-800 dark:text-zinc-100">
                  Chatbot Nara
                </span>
              </Link>
              <Separator className="mb-3 dark:bg-zinc-800" />

              {/* User Info */}
              {user && (
                <>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 dark:bg-zinc-800 rounded-lg mb-3">
                    <div className="size-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-zinc-100 truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Separator className="mb-3 dark:bg-zinc-800" />
                </>
              )}

              {/* Main Nav */}
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      item.href === "/chat"
                        ? "bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-400"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <Separator className="my-3 dark:bg-zinc-800" />


              <Separator className="my-3 dark:bg-zinc-800" />

              {/* Auth buttons */}
              <Separator className="my-3 dark:bg-zinc-800" />
              {user ? (
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Keluar
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <LogIn className="size-4" />
                  Masuk
                </Link>
              )}

              <div className="text-[11px] text-gray-400 dark:text-zinc-500 px-3 mt-3">
                © 2025 SMK Telekomunikasi Tunas Harapan
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/"  className="flex items-center gap-2.5">
            <Image
              src="/Chatbot.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-full bg-blue-300 shadow-lg"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm text-gray-800 dark:text-zinc-100 leading-tight">
                Chatbot Nara
              </h1>
              <p className="text-[11px] text-blue-500 font-semibold">
                Asisten Virtual SMK TTH
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="font-bold text-xs text-gray-800 dark:text-zinc-100">
                Chatbot Nara
              </h1>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink href={item.href}>
                    <span className="flex items-center gap-1.5">
                      <item.icon className="size-3.5" />
                      {item.label}
                    </span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

             
            </NavigationMenuList>
          </NavigationMenu>

          {/* User section & Theme Toggle */}
          <ThemeToggle />
          {user ? (
            <>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {initial}
                </div>
                <span className="text-xs text-gray-600 max-w-[100px] truncate">
                  {displayName}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
            >
              <LogIn className="size-3.5" />
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
