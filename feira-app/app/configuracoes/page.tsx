"use client";

import { FormEvent, useEffect, useState } from "react";
import AccountShell from "@/components/AccountShell";
import { supabase } from "@/lib/supabase/client";
import { estados } from "@/lib/marketplace";

type Perfil = {
  id: string;
  nome_completo: string | null;
  telefone: string | null;
  tipo_conta: "pf" | "pj" | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  estado: string | null;
  cidade: string | null;
};

export default function ConfiguracoesPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let active = true;
    async function carregar() {
      if (!supabase) {
        setErro("Configurações indisponíveis: integração Supabase não configurada.");
        setCarregando(false);
        return;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setErro("Sua sessão expirou. Entre novamente.");
        setCarregando(false);
        return;
      }
      const { data, error } = await supabase.from("perfis")
        .select("id,nome_completo,telefone,tipo_conta,razao_social,nome_fantasia,estado,cidade")
        .eq("id", sessionData.session.user.id)
        .maybeSingle();
      if (!active) return;
      if (error || !data) setErro("Não foi possível carregar seu perfil.");
      else setPerfil(data);
      setCarregando(false);
    }
    carregar().catch(() => {
      if (active) {
        setErro("Não foi possível carregar seu perfil.");
        setCarregando(false);
      }
    });
    return () => { active = false; };
  }, []);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    if (!supabase || !perfil || !perfil.nome_completo?.trim() || !perfil.telefone?.trim() || !perfil.cidade?.trim() || !perfil.estado) {
      setErro("Preencha nome, telefone, estado e cidade.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from("perfis").update({
      nome_completo: perfil.nome_completo.trim(),
      telefone: perfil.telefone.trim(),
      razao_social: perfil.razao_social?.trim() || null,
      nome_fantasia: perfil.nome_fantasia?.trim() || null,
      estado: perfil.estado,
      cidade: perfil.cidade.trim(),
    }).eq("id", perfil.id);
    setSalvando(false);
    if (error) setErro("Não foi possível salvar as configurações.");
    else setMensagem("Perfil atualizado.");
  }

  return (
    <AccountShell title="Configurações">
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
      {mensagem && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{mensagem}</p>}
      {carregando && <p className="text-slate-600">Carregando perfil...</p>}
      {!carregando && perfil && (
        <form onSubmit={salvar} className="max-w-xl space-y-4">
          <label className="block text-sm font-medium">Nome<input required maxLength={160} value={perfil.nome_completo ?? ""} onChange={(event) => setPerfil({ ...perfil, nome_completo: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="block text-sm font-medium">Telefone<input required maxLength={20} value={perfil.telefone ?? ""} onChange={(event) => setPerfil({ ...perfil, telefone: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
          {perfil.tipo_conta === "pj" && <>
            <label className="block text-sm font-medium">Razão social<input value={perfil.razao_social ?? ""} onChange={(event) => setPerfil({ ...perfil, razao_social: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
            <label className="block text-sm font-medium">Nome fantasia<input value={perfil.nome_fantasia ?? ""} onChange={(event) => setPerfil({ ...perfil, nome_fantasia: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
          </>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">Estado<select required value={perfil.estado ?? ""} onChange={(event) => setPerfil({ ...perfil, estado: event.target.value })} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecione</option>{estados.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block text-sm font-medium">Cidade<input required value={perfil.cidade ?? ""} onChange={(event) => setPerfil({ ...perfil, cidade: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
          </div>
          <p className="text-sm text-slate-500">CPF/CNPJ e e-mail não são exibidos nem alterados nesta tela.</p>
          <button disabled={salvando} className="rounded-xl bg-blue-950 px-5 py-3 font-bold text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar alterações"}</button>
        </form>
      )}
    </AccountShell>
  );
}
