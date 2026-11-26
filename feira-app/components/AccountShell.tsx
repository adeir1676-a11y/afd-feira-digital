"use client";

import AuthGate from "@/components/AuthGate";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const links = [
  ["/minha-conta", "Minha conta"],
  ["/meus-anuncios", "Meus anúncios"],
  ["/favoritos", "Favoritos"],
  ["/mensagens", "Mensagens"],
  ["/avaliacoes", "Avaliações"],
  ["/denuncias", "Denúncias"],
  ["/configuracoes", "Configurações"],
];

export default function AccountShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setLogoutError("");
    if (!supabase) {
      setLogoutError("Não foi possível encerrar a sessão.");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutError("Não foi possível encerrar a sessão. Tente novamente.");
      return;
    }
    router.replace("/");
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-100">
        <header className="bg-blue-950 px-4 py-4 text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="text-xl font-black text-yellow-400">AFD</Link>
            <button type="button" onClick={logout} className="rounded-lg border border-white/40 px-3 py-2 text-sm font-bold">Sair</button>
          </div>
          {logoutError && <p role="alert" className="mx-auto mt-3 max-w-6xl text-sm text-red-200">{logoutError}</p>}
        </header>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
          <nav className="h-fit rounded-xl bg-white p-3 shadow-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900">{label}</Link>
            ))}
            <Link href="/ajuda" className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900">Ajuda e suporte</Link>
          </nav>
          <section className="rounded-xl bg-white p-5 shadow-sm sm:p-8">
            <h1 className="text-2xl font-black text-blue-950">{title}</h1>
            <div className="mt-5">{children}</div>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
