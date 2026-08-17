import { useEffect } from "react";
import { useRouter } from "next/router";
import { Jelly } from "@uiball/loaders";
import supabase from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finishSignIn = async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code);
      router.replace("/");
    };

    finishSignIn();
  }, [router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center" aria-label="Signing in">
      <Jelly size={50} color="#7c3aed" />
    </main>
  );
}
