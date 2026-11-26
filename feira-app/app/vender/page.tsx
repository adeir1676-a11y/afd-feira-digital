"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { supabase } from "@/lib/supabase/client";

export default function VenderPage() {
  const [titulo, setTitulo] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [cidades, setCidades] = useState<string[]>([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarLocalizacao() {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      const perfil = data.session?.user.user_metadata;

      if (perfil?.estado) setEstado(String(perfil.estado));
      if (perfil?.cidade) setCidade(String(perfil.cidade));
    }

    carregarLocalizacao();
  }, []);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      return;
    }

    let ativo = true;
    setCarregandoCidades(true);

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Falha ao carregar cidades");
        return resposta.json();
      })
      .then((lista: { nome: string }[]) => {
        if (ativo) setCidades(lista.map((municipio) => municipio.nome));
      })
      .catch(() => {
        if (ativo) setCidades([]);
      })
      .finally(() => {
        if (ativo) setCarregandoCidades(false);
      });

    return () => {
      ativo = false;
    };
  }, [estado]);

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    if (!supabase) {
      setErro("Publicação indisponível: integração Supabase pendente.");
      return;
    }
    if (!titulo.trim() || !preco || !categoria || !estado || !cidade.trim() || !descricao.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setErro("Sua sessão expirou. Entre novamente.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("anuncios").insert({
      vendedor_id: sessionData.session.user.id,
      titulo: titulo.trim(),
      preco: Number(preco),
      categoria,
      estado,
      cidade: cidade.trim(),
      descricao: descricao.trim(),
      ativo: true,
    });
    setLoading(false);
    if (error) {
      setErro("Não foi possível publicar. Confirme se a tabela de anúncios foi aplicada no Supabase.");
    } else {
      setTitulo("");
      setPreco("");
      setCategoria("");
      setEstado("");
      setCidade("");
      setDescricao("");
      setMensagem("Anúncio publicado com sucesso.");
    }
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <a href="/meus-anuncios" className="text-sm font-bold text-blue-800">← Meus anúncios</a>
          <h1 className="mt-5 text-3xl font-black text-blue-950">Criar anúncio</h1>
          <form onSubmit={publicar} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Título<input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Preço (R$)<input required type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
              <label className="text-sm font-medium">Categoria<select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecione</option>{["Moda e roupas","Eletrônicos","Casa e decoração","Veículos","Beleza","Pets","Serviços","Games","Esportes","Brinquedos","Acessórios","Outros"].map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Estado<select required value={estado} onChange={(e) => { setEstado(e.target.value); setCidade(""); }} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecione</option>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SE","SP","TO"].map((uf) => <option key={uf}>{uf}</option>)}</select></label>
              <label className="text-sm font-medium">Cidade<select required value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={!estado || carregandoCidades} className="mt-1 w-full rounded-lg border p-3 disabled:bg-slate-100"><option value="">{carregandoCidades ? "Carregando cidades..." : "Selecione a cidade"}</option>{cidade && !cidades.includes(cidade) && <option value={cidade}>{cidade}</option>}{cidades.map((nome) => <option key={nome} value={nome}>{nome}</option>)}</select></label>
            </div>
            <label className="block text-sm font-medium">Descrição<textarea required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1 min-h-32 w-full rounded-lg border p-3" /></label>
            {erro && <div role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{erro}</div>}
            {mensagem && <div role="status" className="rounded-lg bg-green-50 p-3 text-green-800">{mensagem}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-950 p-4 font-bold text-white disabled:opacity-50">{loading ? "Publicando..." : "Publicar anúncio"}</button>
          </form>
        </div>
      </main>
    </AuthGate>
  );
}
