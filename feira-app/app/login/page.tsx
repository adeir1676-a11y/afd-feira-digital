
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!supabase || !supabaseConfigured) {
      setErro("Sistema de autenticação não configurado.");
      return;
    }

    setCarregando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro("E-mail ou senha incorretos. Tente novamente.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-blue-950">
          AFD
        </h1>

        <p className="mt-2 text-center text-slate-600">
          A Feira Digital
        </p>

        <h2 className="mt-8 text-xl font-bold text-blue-950">
          Entrar na sua conta
        </h2>

        <form onSubmit={entrar} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-700"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-700"
              placeholder="Sua senha"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-blue-900 p-3 font-bold text-white hover:bg-blue-950 disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-bold text-blue-800"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
