"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Anuncio, categorias, estados } from "@/lib/marketplace";

export default function ComprarClient() {
  const searchParams = useSearchParams();
  const pageSize = 24;
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState(searchParams.get("categoria") ?? "");
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(Boolean(supabase));

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        if (active) {
          setErro("Busca indisponível: integração Supabase pendente.");
          setCarregando(false);
        }
        return;
      }
      setCarregando(true);
      setErro("");
      const { data, error } = await supabase.rpc("buscar_anuncios", {
        p_busca: busca.trim(),
        p_estado: estado || null,
        p_categoria: categoria || null,
        p_limite: pageSize,
        p_deslocamento: pagina * pageSize,
      });
      if (!active) return;
      if (error) setErro("Os anúncios ainda não estão disponíveis. Confirme se as migrations foram aplicadas.");
      else {
        setAnuncios(data ?? []);
        setTotal(Number(data?.[0]?.total_count ?? 0));
      }
      setCarregando(false);
    }
    const timer = window.setTimeout(() => {
      carregar().catch(() => {
        if (active) {
          setErro("Não foi possível carregar os anúncios.");
          setCarregando(false);
        }
      });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [busca, estado, categoria, pagina]);

  function alterarCategoria(value: string) {
    setCategoria(value);
    setPagina(0);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("categoria", value);
    else params.delete("categoria");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/comprar?${query}` : "/comprar");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-blue-800">← Início</Link>
          <Link href="/vender" className="rounded-xl bg-yellow-400 px-4 py-3 font-black text-blue-950">Anunciar</Link>
        </div>
        <h1 className="mt-6 text-3xl font-black text-blue-950">Comprar</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <input value={busca} onChange={(event) => { setBusca(event.target.value); setPagina(0); }} placeholder="Buscar anúncios" className="rounded-xl border bg-white p-3" />
          <select value={estado} onChange={(event) => { setEstado(event.target.value); setPagina(0); }} className="rounded-xl border bg-white p-3">
            <option value="">Todos os estados</option>
            {estados.map((uf) => <option key={uf}>{uf}</option>)}
          </select>
          <select aria-label="Filtrar categoria" value={categoria} onChange={(event) => alterarCategoria(event.target.value)} className="rounded-xl border bg-white p-3">
            <option value="">Todas as categorias</option>
            {categorias.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        {carregando && <p className="mt-8 text-slate-500">Carregando anúncios...</p>}
        {erro && <p role="alert" className="mt-8 rounded-xl bg-white p-5 text-red-800">{erro}</p>}
        {!carregando && !erro && anuncios.length === 0 && <p className="mt-8 rounded-xl bg-white p-8 text-center text-slate-500">Nenhum anúncio publicado encontrado.</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {anuncios.map((item) => (
            <Link key={item.id} href={`/anuncios/${item.id}`} className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="font-bold text-slate-800">{item.titulo}</h2>
              <p className="mt-2 text-xl font-black text-blue-950">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.preco)}</p>
              <p className="mt-2 text-sm text-slate-500">{item.cidade} - {item.estado}</p>
            </Link>
          ))}
        </div>
        {total > pageSize && <nav aria-label="Paginação dos anúncios" className="mt-8 flex items-center justify-center gap-4">
          <button type="button" disabled={pagina === 0 || carregando} onClick={() => setPagina((current) => current - 1)} className="rounded-lg border bg-white px-4 py-2 font-semibold disabled:opacity-50">Anterior</button>
          <span className="text-sm text-slate-600">Página {pagina + 1} de {Math.ceil(total / pageSize)}</span>
          <button type="button" disabled={(pagina + 1) * pageSize >= total || carregando} onClick={() => setPagina((current) => current + 1)} className="rounded-lg border bg-white px-4 py-2 font-semibold disabled:opacity-50">Próxima</button>
        </nav>}
      </div>
    </main>
  );
}
