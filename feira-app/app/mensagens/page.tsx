"use client";

import { FormEvent, useEffect, useState } from "react";
import AccountShell from "@/components/AccountShell";
import { supabase } from "@/lib/supabase/client";

type Mensagem = {
  id: string;
  ad_id: string;
  remetente_id: string;
  destinatario_id: string;
  corpo: string;
  created_at: string;
};

export default function MensagensPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [titulos, setTitulos] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState("");
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        setErro("Mensagens indisponíveis: integração Supabase não configurada.");
        setCarregando(false);
        return;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setErro("Sua sessão expirou. Entre novamente.");
        setCarregando(false);
        return;
      }
      const id = sessionData.session.user.id;
      setUserId(id);
      const [sent, received] = await Promise.all([
        supabase.from("mensagens").select("id,ad_id,remetente_id,destinatario_id,corpo,created_at").eq("remetente_id", id),
        supabase.from("mensagens").select("id,ad_id,remetente_id,destinatario_id,corpo,created_at").eq("destinatario_id", id),
      ]);
      if (sent.error || received.error) {
        setErro("Não foi possível carregar suas mensagens.");
        setCarregando(false);
        return;
      }
      const all = [...(sent.data ?? []), ...(received.data ?? [])]
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      const adIds = [...new Set(all.map((item) => item.ad_id))];
      if (adIds.length) {
        const { data: ads, error: adError } = await supabase.from("anuncios").select("id,titulo").in("id", adIds);
        if (adError) setErro("Não foi possível carregar os anúncios das conversas.");
        else if (active) setTitulos(Object.fromEntries((ads ?? []).map((item) => [item.id, item.titulo])));
      }
      if (active) {
        setMensagens(all);
        setCarregando(false);
      }
    }
    carregar().catch(() => {
      if (active) {
        setErro("Não foi possível carregar suas mensagens.");
        setCarregando(false);
      }
    });
    return () => { active = false; };
  }, []);

  async function responder(event: FormEvent<HTMLFormElement>, mensagem: Mensagem) {
    event.preventDefault();
    if (!supabase) return;
    const body = respostas[mensagem.id]?.trim();
    if (!body) {
      setErro("Digite uma mensagem antes de responder.");
      return;
    }
    const destinatario = mensagem.remetente_id === userId ? mensagem.destinatario_id : mensagem.remetente_id;
    const { data, error: insertError } = await supabase.from("mensagens")
      .insert({ ad_id: mensagem.ad_id, remetente_id: userId, destinatario_id: destinatario, corpo: body })
      .select("id,ad_id,remetente_id,destinatario_id,corpo,created_at")
      .single();
    if (insertError) {
      setErro("Não foi possível enviar a resposta. A conversa pode não estar mais disponível.");
      return;
    }
    setErro("");
    setMensagens((current) => [data, ...current]);
    setRespostas((current) => ({ ...current, [mensagem.id]: "" }));
  }

  return (
    <AccountShell title="Mensagens">
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
      {carregando && <p className="text-slate-600">Carregando conversas...</p>}
      {!carregando && !erro && mensagens.length === 0 && <p className="text-slate-600">Nenhuma conversa disponível.</p>}
      <div className="space-y-4">
        {mensagens.map((mensagem) => (
          <article key={mensagem.id} className="rounded-xl border p-4">
            <h2 className="font-bold text-blue-950">{titulos[mensagem.ad_id] ?? "Anúncio indisponível"}</h2>
            <p className="mt-1 text-xs text-slate-500">{mensagem.remetente_id === userId ? "Você enviou" : "Recebida"} · {new Date(mensagem.created_at).toLocaleString("pt-BR")}</p>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">{mensagem.corpo}</p>
            <form onSubmit={(event) => responder(event, mensagem)} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input maxLength={5000} required value={respostas[mensagem.id] ?? ""} onChange={(event) => setRespostas((current) => ({ ...current, [mensagem.id]: event.target.value }))} placeholder="Responder nesta conversa" className="min-w-0 flex-1 rounded-lg border p-3" />
              <button className="rounded-lg bg-blue-950 px-4 py-3 font-bold text-white">Responder</button>
            </form>
          </article>
        ))}
      </div>
    </AccountShell>
  );
}
