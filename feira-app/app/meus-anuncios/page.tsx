"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AccountShell from "@/components/AccountShell";
import { supabase } from "@/lib/supabase/client";
import { Anuncio, categorias, estados } from "@/lib/marketplace";

export default function MeusAnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Anuncio>>({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        setErro("Não foi possível carregar anúncios: integração Supabase não configurada.");
        setCarregando(false);
        return;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        if (active) {
          setErro("Sua sessão expirou. Entre novamente.");
          setCarregando(false);
        }
        return;
      }
      const { data, error } = await supabase.from("anuncios")
        .select("id,vendedor_id,titulo,preco,categoria,estado,cidade,descricao,ativo,created_at,updated_at")
        .eq("vendedor_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setErro("Não foi possível carregar seus anúncios.");
      else setAnuncios(data ?? []);
      setCarregando(false);
    }
    carregar().catch(() => {
      if (active) {
        setErro("Não foi possível carregar seus anúncios.");
        setCarregando(false);
      }
    });
    return () => { active = false; };
  }, []);

  function iniciarEdicao(anuncio: Anuncio) {
    setErro("");
    setEditando(anuncio.id);
    setForm({ ...anuncio });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !editando || !form.titulo?.trim() || !form.cidade?.trim() || !form.descricao?.trim() || !form.categoria || !form.estado || form.preco === undefined || !Number.isFinite(Number(form.preco)) || Number(form.preco) < 0) {
      setErro("Confira os campos obrigatórios e o preço.");
      return;
    }
    const { data, error } = await supabase.from("anuncios").update({
      titulo: form.titulo.trim(),
      preco: Number(form.preco),
      categoria: form.categoria,
      estado: form.estado,
      cidade: form.cidade.trim(),
      descricao: form.descricao.trim(),
    }).eq("id", editando).select("id,vendedor_id,titulo,preco,categoria,estado,cidade,descricao,ativo,created_at,updated_at").maybeSingle();
    if (error || !data) {
      setErro("Não foi possível salvar. Verifique a conexão e se o anúncio ainda pertence à sua conta.");
      return;
    }
    setAnuncios((current) => current.map((item) => item.id === data.id ? data : item));
    setEditando(null);
  }

  async function alternarAtivo(anuncio: Anuncio) {
    if (!supabase) return;
    setErro("");
    const { data, error } = await supabase.from("anuncios").update({ ativo: !anuncio.ativo })
      .eq("id", anuncio.id)
      .select("id,vendedor_id,titulo,preco,categoria,estado,cidade,descricao,ativo,created_at,updated_at")
      .maybeSingle();
    if (error || !data) {
      setErro("Não foi possível atualizar o status do anúncio.");
      return;
    }
    setAnuncios((current) => current.map((item) => item.id === data.id ? data : item));
  }

  return (
    <AccountShell title="Meus anúncios">
      <Link href="/vender" className="inline-block rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Criar anúncio</Link>
      {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
      {carregando && <p className="mt-5 text-slate-600">Carregando seus anúncios...</p>}
      {!carregando && !erro && anuncios.length === 0 && <p className="mt-5 text-slate-600">Você ainda não publicou anúncios.</p>}
      <div className="mt-5 space-y-4">
        {anuncios.map((anuncio) => (
          <article key={anuncio.id} className="rounded-xl border border-slate-200 p-4">
            {editando === anuncio.id ? (
              <form onSubmit={salvar} className="space-y-3">
                <label className="block text-sm font-medium">Título<input required maxLength={160} value={form.titulo ?? ""} onChange={(event) => setForm({ ...form, titulo: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">Preço (R$)<input required type="number" min="0" step="0.01" value={form.preco ?? ""} onChange={(event) => setForm({ ...form, preco: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-3" /></label>
                  <label className="block text-sm font-medium">Categoria<select required value={form.categoria ?? ""} onChange={(event) => setForm({ ...form, categoria: event.target.value })} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecione</option>{categorias.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="block text-sm font-medium">Estado<select required value={form.estado ?? ""} onChange={(event) => setForm({ ...form, estado: event.target.value })} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecione</option>{estados.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="block text-sm font-medium">Cidade<input required value={form.cidade ?? ""} onChange={(event) => setForm({ ...form, cidade: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
                </div>
                <label className="block text-sm font-medium">Descrição<textarea required maxLength={10000} value={form.descricao ?? ""} onChange={(event) => setForm({ ...form, descricao: event.target.value })} className="mt-1 min-h-28 w-full rounded-lg border p-3" /></label>
                <div className="flex gap-3"><button className="rounded-lg bg-blue-950 px-4 py-2 font-bold text-white">Salvar</button><button type="button" onClick={() => setEditando(null)} className="rounded-lg border px-4 py-2 font-bold">Cancelar</button></div>
              </form>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900">{anuncio.titulo}</h2>
                  <p className="mt-1 text-sm text-slate-600">{anuncio.categoria} · {anuncio.cidade} - {anuncio.estado}</p>
                  <p className="mt-1 font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(anuncio.preco)}</p>
                  <p className="mt-1 text-sm font-semibold">{anuncio.ativo ? "Publicado" : "Pausado"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/anuncios/${anuncio.id}`} className="rounded-lg border px-3 py-2 text-sm font-semibold">Visualizar</Link>
                  <button type="button" onClick={() => iniciarEdicao(anuncio)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Editar</button>
                  <button type="button" onClick={() => alternarAtivo(anuncio)} className="rounded-lg border px-3 py-2 text-sm font-semibold">{anuncio.ativo ? "Pausar" : "Reativar"}</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </AccountShell>
  );
}
