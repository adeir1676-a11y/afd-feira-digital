"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Anuncio } from "@/lib/marketplace";

function AnuncioConteudo() {
  const { id } = useParams<{ id: string }>();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorito, setFavorito] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");
  const [carregando, setCarregando] = useState(Boolean(supabase));
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    async function carregar() {
      const [{ data: ad, error: adError }, { data: sessionData }] = await Promise.all([
        supabase!.from("anuncios")
          .select("id,vendedor_id,titulo,preco,categoria,estado,cidade,descricao,ativo,created_at,updated_at")
          .eq("id", id)
          .eq("ativo", true)
          .maybeSingle(),
        supabase!.auth.getSession(),
      ]);
      if (!active) return;
      if (adError) setErro("Não foi possível carregar este anúncio.");
      else if (!ad) setErro("Este anúncio não existe ou não está mais disponível.");
      else {
        setAnuncio(ad);
        const currentUserId = sessionData.session?.user.id ?? null;
        setUserId(currentUserId);
        if (currentUserId) {
          const { data: saved, error: savedError } = await supabase!
            .from("favoritos")
            .select("ad_id")
            .eq("usuario_id", currentUserId)
            .eq("ad_id", id)
            .maybeSingle();
          if (!active) return;
          if (savedError) setErro("Não foi possível verificar seus favoritos.");
          setFavorito(Boolean(saved));
        }
      }
      setCarregando(false);
    }
    carregar().catch(() => {
      if (active) {
        setErro("Não foi possível carregar este anúncio.");
        setCarregando(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [id]);

  async function alternarFavorito() {
    if (!supabase || !anuncio || !userId) return;
    setErro("");
    const result = favorito
      ? await supabase.from("favoritos").delete().eq("usuario_id", userId).eq("ad_id", anuncio.id)
      : await supabase.from("favoritos").insert({ usuario_id: userId, ad_id: anuncio.id });
    if (result.error) {
      setErro("Não foi possível atualizar seus favoritos.");
      return;
    }
    setFavorito(!favorito);
  }

  async function enviarMensagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setStatus("");
    if (!supabase || !anuncio || !userId) {
      setErro("Entre na sua conta para falar com o vendedor.");
      return;
    }
    if (!mensagem.trim()) {
      setErro("Digite uma mensagem antes de enviar.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from("mensagens").insert({
      ad_id: anuncio.id,
      remetente_id: userId,
      destinatario_id: anuncio.vendedor_id,
      corpo: mensagem.trim(),
    });
    setEnviando(false);
    if (error) setErro("Não foi possível enviar a mensagem. Confirme se o anúncio ainda está ativo.");
    else {
      setMensagem("");
      setStatus("Mensagem enviada. Você pode acompanhar a conversa em Mensagens.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
        <Link href="/comprar" className="text-sm font-bold text-blue-800">← Voltar à busca</Link>
        {carregando && <p className="mt-8 text-slate-600">Carregando anúncio...</p>}
        {!supabase && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">Anúncio indisponível: integração Supabase não configurada.</p>}
        {!carregando && erro && !anuncio && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{erro}</p>}
        {anuncio && (
          <>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-blue-950">{anuncio.titulo}</h1>
                <p className="mt-2 text-sm text-slate-500">{anuncio.categoria} · {anuncio.cidade} - {anuncio.estado}</p>
              </div>
              <p className="text-2xl font-black text-blue-950">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(anuncio.preco)}
              </p>
            </div>
            <p className="mt-6 whitespace-pre-wrap text-slate-700">{anuncio.descricao}</p>
            {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
            {status && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-green-800">{status}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {userId && userId !== anuncio.vendedor_id
                ? <button type="button" onClick={alternarFavorito} className="rounded-xl border border-blue-900 px-4 py-3 font-bold text-blue-950">{favorito ? "Remover dos favoritos" : "Salvar nos favoritos"}</button>
                : !userId && <Link href="/login" className="rounded-xl border border-blue-900 px-4 py-3 font-bold text-blue-950">Entrar para salvar ou contatar</Link>}
              {userId && <Link href={`/denuncias?ad_id=${encodeURIComponent(anuncio.id)}`} className="rounded-xl border border-red-300 px-4 py-3 font-bold text-red-700">Denunciar anúncio</Link>}
            </div>
            {userId && userId !== anuncio.vendedor_id && (
              <form onSubmit={enviarMensagem} className="mt-8 space-y-3 border-t pt-6">
                <label className="block font-semibold text-slate-700">Fale com o vendedor
                  <textarea maxLength={5000} required value={mensagem} onChange={(event) => setMensagem(event.target.value)} className="mt-2 min-h-28 w-full rounded-lg border p-3" />
                </label>
                <button disabled={enviando} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white disabled:opacity-50">{enviando ? "Enviando..." : "Enviar mensagem"}</button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function AnuncioPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-slate-600">Carregando anúncio...</main>}>
      <AnuncioConteudo />
    </Suspense>
  );
}
