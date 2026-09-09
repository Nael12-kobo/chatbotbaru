"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect(data.url);
}

export async function signInWithEmail(formData: FormData) {
  const emailOrUsername = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  let email = emailOrUsername;

  if (!emailOrUsername.includes("@")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", emailOrUsername)
      .single();

    if (profile) {
      email = profile.email;
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/chat");
}

export async function signUpWithEmail(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      username,
      email,
    });
  }

  redirect("/chat");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/chat");
}
