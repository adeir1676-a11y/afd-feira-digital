"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AccountShell from "@/components/AccountShell";
import { supabase } from "@/lib/supabase/client";
import { Anuncio } from "@/lib/marketplace";

export default function FavoritosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        setErro("Favoritos indisponíveis: integração Supabase não configurada.");
        setCarregando(false);
        return;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setErro("Sua sessão expirou. Entre novamente.");
        setCarregando(false);
        return;
      }
      const { data: saved, error: savedError } = await supabase.from("favoritos")
        .select("ad_id")
        .eq("usuario_id", sessionData.session.user.id);
      if (savedError) {
        setErro("Não foi possível carregar seus favoritos.");
        setCarregando(false);
        return;
      }
      const ids = (saved ?? []).map((item) => item.ad_id);
      if (ids.length) {
        const { data, error } = await supabase.from("anuncios")
          .select("id,vendedor_id,titulo,preco,categoria,estado,cidade,descricao,ativo,created_at,updated_at")
          .in("id", ids)
          .eq("ativo", true);
        if (error) setErro("Não foi possível carregar os anúncios salvos.");
        else if (active) setAnuncios(data ?? []);
      }
      if (active) setCarregando(false);
    }
    carregar().catch(() => {
      if (active) {
        setErro("Não foi possível carregar seus favoritos.");
        setCarregando(false);
      }
    });
    return () => { active = false; };
  }, []);

  async function remover(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("favoritos").delete().eq("ad_id", id);
    if (error) setErro("Não foi possível remover este favorito.");
    else setAnuncios((current) => current.filter((item) => item.id !== id));
  }

  return (
    <AccountShell title="Favoritos">
      {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
      {carregando && <p className="text-slate-600">Carregando favoritos...</p>}
      {!carregando && !erro && anuncios.length === 0 && <p className="text-slate-600">Você ainda não adicionou anúncios ativos aos favoritos.</p>}
      <ul className="space-y-3">
        {anuncios.map((anuncio) => (
          <li key={anuncio.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <Link href={`/anuncios/${anuncio.id}`} className="font-bold text-blue-950 hover:underline">{anuncio.titulo}</Link>
              <p className="text-sm text-slate-600">{anuncio.cidade} - {anuncio.estado}</p>
            </div>
            <button type="button" onClick={() => remover(anuncio.id)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Remover</button>
          </li>
        ))}
      </ul>
    </AccountShell>
  );
}
