"use client";

import { FormEvent, useEffect, useState } from "react";
import AccountShell from "@/components/AccountShell";
import { supabase } from "@/lib/supabase/client";
import { Anuncio } from "@/lib/marketplace";

type Avaliacao = {
  id: string;
  ad_id: string;
  nota: number;
  comentario: string;
  created_at: string;
};

export default function AvaliacoesPage() {
  const [userId, setUserId] = useState("");
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [adId, setAdId] = useState("");
  const [nota, setNota] = useState("5");
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        setErro("Avaliações indisponíveis: integração Supabase não configurada.");
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
      const [ads, ownReviews] = await Promise.all([
        supabase.from("anuncios").select("id,vendedor_id,titulo,preco,categoria,estado,cidade,descricao,ativo,created_at,updated_at").eq("ativo", true).order("created_at", { ascending: false }),
        supabase.from("avaliacoes").select("id,ad_id,nota,comentario,created_at").eq("avaliador_id", id).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (ads.error || ownReviews.error) setErro("Não foi possível carregar anúncios e avaliações.");
      else {
        setAnuncios(ads.data ?? []);
        setAvaliacoes(ownReviews.data ?? []);
      }
      setCarregando(false);
    }
    carregar().catch(() => {
      if (active) {
        setErro("Não foi possível carregar suas avaliações.");
        setCarregando(false);
      }
    });
    return () => { active = false; };
  }, []);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    const anuncio = anuncios.find((item) => item.id === adId);
    if (!supabase || !userId || !anuncio || !comentario.trim() || !Number.isInteger(Number(nota)) || Number(nota) < 1 || Number(nota) > 5) {
      setErro("Selecione um anúncio ativo e informe uma nota de 1 a 5 com comentário.");
      return;
    }
    const { data, error } = await supabase.from("avaliacoes")
      .insert({ ad_id: anuncio.id, avaliador_id: userId, vendedor_id: anuncio.vendedor_id, nota: Number(nota), comentario: comentario.trim() })
      .select("id,ad_id,nota,comentario,created_at")
      .single();
    if (error || !data) {
      setErro(error?.code === "23505" ? "Você já avaliou este anúncio." : "Não foi possível publicar a avaliação.");
      return;
    }
    setAvaliacoes((current) => [data, ...current]);
    setComentario("");
    setAdId("");
    setMensagem("Avaliação publicada.");
  }

  const titles = new Map(anuncios.map((item) => [item.id, item.titulo]));

  return (
    <AccountShell title="Avaliações">
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
      {mensagem && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{mensagem}</p>}
      <form onSubmit={enviar} className="max-w-xl space-y-3 rounded-xl border p-4">
        <h2 className="font-bold text-slate-900">Avaliar um anúncio</h2>
        <label className="block text-sm font-medium">Anúncio<select required value={adId} onChange={(event) => setAdId(event.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecione</option>{anuncios.filter((item) => item.vendedor_id !== userId).map((item) => <option key={item.id} value={item.id}>{item.titulo} · {item.cidade}</option>)}</select></label>
        <label className="block text-sm font-medium">Nota<select value={nota} onChange={(event) => setNota(event.target.value)} className="mt-1 w-full rounded-lg border p-3">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} de 5</option>)}</select></label>
        <label className="block text-sm font-medium">Comentário<textarea required maxLength={2000} value={comentario} onChange={(event) => setComentario(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border p-3" /></label>
        <button disabled={carregando} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white disabled:opacity-50">Publicar avaliação</button>
      </form>
      <h2 className="mb-3 mt-7 font-bold text-slate-900">Suas avaliações</h2>
      {carregando && <p className="text-slate-600">Carregando avaliações...</p>}
      {!carregando && avaliacoes.length === 0 && <p className="text-slate-600">Você ainda não publicou avaliações.</p>}
      <ul className="space-y-3">{avaliacoes.map((item) => <li key={item.id} className="rounded-xl border p-4"><p className="font-bold">{titles.get(item.ad_id) ?? "Anúncio indisponível"} · {item.nota}/5</p><p className="mt-2 whitespace-pre-wrap text-slate-700">{item.comentario}</p></li>)}</ul>
    </AccountShell>
  );
}
