"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authorized" | "redirecting">(
    supabase ? "loading" : "redirecting"
  );

  useEffect(() => {
    if (!supabase) {
      router.replace("/login");
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setStatus("authorized");
      } else {
        setStatus("redirecting");
        router.replace("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (status === "loading") {
    return <main className="grid min-h-[60vh] place-items-center text-slate-600">Validando sessão...</main>;
  }
  if (status !== "authorized") return null;
  return <>{children}</>;
}
