"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AccountShell from "@/components/AccountShell";
import { supabase } from "@/lib/supabase/client";
import { Anuncio } from "@/lib/marketplace";

function DenunciasConteudo() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");
  const [anuncios, setAnuncios] = useState<Pick<Anuncio, "id" | "titulo" | "cidade">[]>([]);
  const [adId, setAdId] = useState(() => searchParams.get("ad_id") ?? "");
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        setErro("A denúncia não pode ser enviada porque a integração não está configurada.");
        return;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setErro("Faça login para enviar uma denúncia.");
        return;
      }
      const { data, error: adsError } = await supabase.from("anuncios").select("id,titulo,cidade").eq("ativo", true).order("created_at", { ascending: false });
      if (!active) return;
      setUserId(sessionData.session.user.id);
      if (adsError) setErro("Não foi possível carregar os anúncios para denúncia.");
      else setAnuncios(data ?? []);
    }
    carregar().catch(() => setErro("Não foi possível carregar os anúncios para denúncia."));
    return () => { active = false; };
  }, []);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    if (!motivo.trim() || !anuncios.some((item) => item.id === adId)) {
      setErro("Selecione o anúncio e informe o motivo da denúncia.");
      return;
    }
    if (!supabase || !userId) {
      setErro("Faça login para enviar uma denúncia.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from("denuncias").insert({
      motivo: motivo.trim(),
      autor_id: userId,
      ad_id: adId,
    });
    setEnviando(false);
    if (error) setErro("Não foi possível enviar a denúncia. Confirme se as migrations do Supabase foram aplicadas.");
    else {
      setMotivo("");
      setMensagem("Denúncia associada ao anúncio e enviada para análise.");
    }
  }

  return (
    <AccountShell title="Denúncias">
      <form onSubmit={enviar} className="max-w-xl space-y-4">
        <label className="block text-sm font-medium">Anúncio
          <select required value={adId} onChange={(event) => setAdId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3">
            <option value="">Selecione o anúncio</option>
            {anuncios.map((item) => <option key={item.id} value={item.id}>{item.titulo} · {item.cidade}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Motivo<textarea required maxLength={5000} value={motivo} onChange={(event) => setMotivo(event.target.value)} className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 p-3" /></label>
        {erro && <div role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{erro}</div>}
        {mensagem && <div role="status" className="rounded-lg bg-green-50 p-3 text-green-800">{mensagem}</div>}
        <button type="submit" disabled={enviando} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white disabled:opacity-50">{enviando ? "Enviando..." : "Enviar denúncia"}</button>
      </form>
    </AccountShell>
  );
}

export default function DenunciasPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-slate-600">Carregando formulário...</main>}>
      <DenunciasConteudo />
    </Suspense>
  );
}
