
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase/client";

type Tipo = "pf" | "pj";

type Plano = "gratuito" | "plus" | "pro" | "premium";
const planosPermitidos: Plano[] = ["gratuito", "plus", "pro", "premium"];

function validarCPF(cpf: string) {
  const numero = cpf.replace(/\D/g, "");
  if (numero.length !== 11 || /^(\d)\1+$/.test(numero)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(numero[i]) * (10 - i);
  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  if (digito !== Number(numero[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(numero[i]) * (11 - i);
  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  return digito === Number(numero[10]);
}

function validarCNPJ(cnpj: string) {
  const numero = cnpj.replace(/\D/g, "");
  if (numero.length !== 14 || /^(\d)\1+$/.test(numero)) return false;
  const calcular = (base: string, pesos: number[]) => {
    const soma = base.split("").reduce((total, digito, i) => total + Number(digito) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const primeiro = calcular(numero.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const segundo = calcular(numero.slice(0, 12) + primeiro, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return primeiro === Number(numero[12]) && segundo === Number(numero[13]);
}

function maskCPF(value: string) {
  return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCNPJ(value: string) {
  return value.replace(/\D/g, "").slice(0, 14).replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export default function CadastroPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("pf");
  const [nome, setNome] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [cidades, setCidades] = useState<string[]>([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [erroCidades, setErroCidades] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano>("gratuito");

  useEffect(() => {
    const plano = new URLSearchParams(window.location.search).get("plano");
    if (plano && planosPermitidos.includes(plano as Plano)) {
      setPlanoSelecionado(plano as Plano);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/minha-conta");
    });
  }, [router]);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      setCidade("");
      return;
    }

    let ativo = true;
    setCidade("");
    setCarregandoCidades(true);
    setErroCidades("");

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Falha ao carregar cidades");
        return resposta.json();
      })
      .then((lista: { nome: string }[]) => {
        if (ativo) setCidades(lista.map((municipio) => municipio.nome));
      })
      .catch(() => {
        if (ativo) {
          setCidades([]);
          setErroCidades("Não foi possível carregar as cidades. Tente novamente.");
        }
      })
      .finally(() => {
        if (ativo) setCarregandoCidades(false);
      });

    return () => {
      ativo = false;
    };
  }, [estado]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    const documentoNumerico = documento.replace(/\D/g, "");
    const telefoneNumerico = telefone.replace(/\D/g, "");

    if (!supabaseConfigured || !supabase) {
      setErro("O cadastro está temporariamente indisponível: configuração do Supabase pendente.");
      return;
    }
    if (!nome.trim() || !email.trim() || telefoneNumerico.length < 10 || !cidade.trim() || !estado.trim()) {
      setErro("Preencha nome, e-mail, telefone, estado e cidade.");
      return;
    }
    if (tipo === "pf" && !validarCPF(documentoNumerico)) {
      setErro("CPF inválido. Confira os números.");
      return;
    }
    if (tipo === "pj" && (!validarCNPJ(documentoNumerico) || !razaoSocial.trim())) {
      setErro("Informe um CNPJ válido e a razão social.");
      return;
    }
    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            plano_solicitado: planoSelecionado,
            nome_completo: nome.trim(),
            razao_social: tipo === "pj" ? razaoSocial.trim() : null,
            nome_fantasia: tipo === "pj" ? nomeFantasia.trim() : null,
            telefone: telefoneNumerico,
            tipo_conta: tipo,
            tipo_documento: tipo === "pf" ? "CPF" : "CNPJ",
            documento: documentoNumerico,
            estado,
            cidade: cidade.trim(),
          },
        },
      });
      if (error) throw error;

      if (data.session) {
        setMensagem("Conta criada com sucesso. Entrando no painel...");
        window.setTimeout(() => router.replace("/minha-conta"), 500);
      } else {
        setMensagem("Cadastro realizado. Confira seu e-mail e confirme a conta para continuar.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/already|registered|exists|already been/i.test(message)) {
        setErro("Este e-mail já possui uma conta. Use a página de login.");
      } else {
        setErro(message ? `Não foi possível concluir o cadastro: ${message}` : "Não foi possível concluir o cadastro.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link href="/" className="text-sm font-bold text-blue-800">← Voltar ao início</Link>
        <div className="mb-8 mt-4 text-center">
          <h1 className="text-3xl font-black text-blue-800">AFD</h1>
          <h2 className="mt-2 text-xl font-bold text-slate-800">Crie sua conta</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset>
            <legend className="mb-2 block font-semibold text-slate-700">Como deseja se cadastrar?</legend>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setTipo("pf"); setDocumento(""); }} className={`rounded-xl border p-4 font-semibold ${tipo === "pf" ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-300 text-slate-600"}`}>
                Pessoa física<span className="block text-sm font-normal">CPF</span>
              </button>
              <button type="button" onClick={() => { setTipo("pj"); setDocumento(""); }} className={`rounded-xl border p-4 font-semibold ${tipo === "pj" ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-300 text-slate-600"}`}>
                Empresa / Loja<span className="block text-sm font-normal">CNPJ</span>
              </button>
            </div>
          </fieldset>

          {tipo === "pj" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Razão social<input required value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
              <label className="text-sm font-medium text-slate-700">Nome fantasia<input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">{tipo === "pf" ? "Nome completo" : "Nome do responsável"}<input required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
          <label className="block text-sm font-medium text-slate-700">E-mail<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
          <label className="block text-sm font-medium text-slate-700">Telefone / WhatsApp<input required type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 p-3" placeholder="(00) 00000-0000" /></label>
          <label className="block text-sm font-medium text-slate-700">{tipo === "pf" ? "CPF" : "CNPJ"}<input required inputMode="numeric" value={documento} onChange={(e) => setDocumento(tipo === "pf" ? maskCPF(e.target.value) : maskCNPJ(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 p-3" placeholder={tipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Estado<select required value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3"><option value="">Selecione</option>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => <option key={uf}>{uf}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">Cidade
              <select required value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={!estado || carregandoCidades || cidades.length === 0} className="mt-1 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100">
                <option value="">{!estado ? "Selecione primeiro o estado" : carregandoCidades ? "Carregando cidades..." : "Selecione a cidade"}</option>
                {cidades.map((nomeCidade) => <option key={nomeCidade} value={nomeCidade}>{nomeCidade}</option>)}
              </select>
              {erroCidades && <span className="mt-1 block text-sm text-red-700">{erroCidades}</span>}
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">Criar senha<input required type="password" minLength={8} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" placeholder="Mínimo de 8 caracteres" /></label>
          <label className="block text-sm font-medium text-slate-700">Confirmar senha<input required type="password" autoComplete="new-password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>

          {erro && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{erro}</div>}
          {mensagem && <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{mensagem}</div>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-800 p-4 font-bold text-white hover:bg-blue-900 disabled:opacity-50">
            {loading ? "Criando conta..." : "Criar minha conta"}
          </button>
          <p className="text-center text-sm text-slate-600">Já tem conta? <a href="/login" className="font-bold text-blue-800">Entrar</a></p>
        </form>
      </div>
    </main>
  );
}
