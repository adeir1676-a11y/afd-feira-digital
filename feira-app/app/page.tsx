

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const campanhas = [
  {
    etiqueta: "AFD • A FEIRA DIGITAL",
    titulo: "O Brasil inteiro em uma só feira digital!",
    descricao: "Descubra produtos, serviços e oportunidades perto de você ou em qualquer lugar do Brasil.",
    botao: "EXPLORAR ANÚNCIOS",
    emoji: "🛍️",
    fundo: "from-blue-950 via-blue-800 to-indigo-700",
  },
  {
    etiqueta: "ANUNCIE GRATUITAMENTE",
    titulo: "Seu próximo cliente pode estar aqui!",
    descricao: "Cadastre seu anúncio grátis e apresente seus produtos para todo o Brasil.",
    botao: "ANUNCIAR GRÁTIS",
    emoji: "🚀",
    fundo: "from-violet-950 via-purple-800 to-fuchsia-700",
  },
  {
    etiqueta: "PARA LOJAS E EMPREENDEDORES",
    titulo: "Sua loja merece mais visibilidade!",
    descricao: "Conheça os espaços de divulgação e os planos profissionais da AFD.",
    botao: "CONHECER PLANOS",
    emoji: "🏪",
    fundo: "from-emerald-950 via-teal-800 to-cyan-700",
  },
];

const estados = [
  "Todos os estados",
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia",
  "Ceará", "Distrito Federal", "Espírito Santo", "Goiás",
  "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná",
  "Pernambuco", "Piauí", "Rio de Janeiro",
  "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina",
  "São Paulo", "Sergipe", "Tocantins",
];

const categorias = [
  ["👗", "Moda e roupas"],
  ["📱", "Eletrônicos"],
  ["🛋️", "Casa e decoração"],
  ["🚗", "Veículos"],
  ["💄", "Beleza"],
  ["🐶", "Pets"],
  ["🧰", "Serviços"],
  ["🎮", "Games"],
  ["⚽", "Esportes"],
  ["🧸", "Brinquedos"],
  ["💍", "Acessórios"],
  ["📦", "Outros"],
];

const produtos = [
  {
    id: "fone-bluetooth",
    nome: "Fone Bluetooth",
    preco: "129,90",
    cidade: "São Paulo",
    estado: "São Paulo",
    bairro: "Centro",
    foto: "photo-1505740420928-5e560c06d30e",
    selo: "Destaque",
  },
  {
    id: "relogio-moderno",
    nome: "Relógio moderno",
    preco: "189,90",
    cidade: "Rio de Janeiro",
    estado: "Rio de Janeiro",
    bairro: "Copacabana",
    foto: "photo-1523275335684-37898b6baf30",
    selo: "Novo anúncio",
  },
  {
    id: "poltrona-decorativa",
    nome: "Poltrona decorativa",
    preco: "450,00",
    cidade: "Curitiba",
    estado: "Paraná",
    bairro: "Centro",
    foto: "photo-1567538096630-e0c55bd6374c",
    selo: "Destaque",
  },
  {
    id: "tenis-esportivo",
    nome: "Tênis esportivo",
    preco: "219,90",
    cidade: "Salvador",
    estado: "Bahia",
    bairro: "Barra",
    foto: "photo-1542291026-7eec264c27ff",
    selo: "Novo anúncio",
  },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState("Todos os estados");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");

  useEffect(() => {
    const temporizador = setInterval(() => {
      setSlide((atual) => (atual + 1) % campanhas.length);
    }, 6000);

    return () => clearInterval(temporizador);
  }, []);

  const campanha = campanhas[slide];

  const anunciosFiltrados = produtos.filter((produto) => {
    const termo = busca.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(termo) &&
      (estado === "Todos os estados" || produto.estado === estado) &&
      (!cidade || produto.cidade.toLowerCase().includes(cidade.toLowerCase())) &&
      (!bairro || produto.bairro.toLowerCase().includes(bairro.toLowerCase()))
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-10">

      {/* CABEÇALHO */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">

          <div className="flex items-center justify-between gap-3">
            <a href="#inicio" className="flex items-center gap-2">
              <span className="bg-blue-950 text-yellow-400 font-black text-2xl px-3 py-2 rounded-xl">
                AFD
              </span>
              <span>
                <strong className="block text-blue-950 text-lg">
                  A Feira Digital
                </strong>
                <small className="text-slate-500">
                  O Brasil em um só lugar
                </small>
              </span>
            </a>

            <nav className="hidden lg:flex gap-5 text-sm font-bold">
              <a href="/comprar" className="hover:text-blue-700">Comprar</a>
              <a href="/vender" className="hover:text-blue-700">Vender</a>
              <a href="#categorias" className="hover:text-blue-700">Categorias</a>
              <a href="#anuncios" className="hover:text-blue-700">Anúncios</a>
              <a href="#planos" className="hover:text-blue-700">Planos</a>
              <a href="/login" className="hover:text-blue-700">Entrar</a>
            </nav>

            <a
              href="/cadastro"
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-blue-950"
            >
              + Anunciar grátis
            </a>
          </div>

          {/* BUSCA */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="🔎 O que você procura?"
              className="rounded-xl bg-slate-100 p-3 outline-none text-sm"
            />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="rounded-xl bg-slate-100 p-3 text-sm outline-none"
            >
              {estados.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="🏙️ Digite a cidade"
              className="rounded-xl bg-slate-100 p-3 text-sm outline-none"
            />

            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="📍 Digite o bairro"
              className="rounded-xl bg-slate-100 p-3 text-sm outline-none"
            />
          </div>

        </div>
      </header>

      {/* CAPA E CARROSSEL */}
      <section id="inicio" className="max-w-7xl mx-auto px-4 pt-6">

        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${campanha.fundo} text-white min-h-[350px] flex items-center transition-all duration-700`}>

          <div className="absolute right-5 sm:right-16 top-10 text-[110px] sm:text-[190px] opacity-20">
            {campanha.emoji}
          </div>

          <div className="relative z-10 p-7 sm:p-12 max-w-2xl">

            <span className="inline-block rounded-full bg-white/15 px-4 py-2 text-xs font-bold tracking-widest">
              {campanha.etiqueta}
            </span>

            <h1 className="mt-5 text-3xl sm:text-5xl font-black leading-tight">
              {campanha.titulo}
            </h1>

            <p className="mt-4 text-blue-100 text-base sm:text-lg">
              {campanha.descricao}
            </p>

            <a
              href={slide === 1 ? "/comprar" : slide === 2 ? "/vender" : "/cadastro"}
              className="inline-block mt-7 rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black text-blue-950 shadow-lg hover:bg-yellow-300"
            >
              {campanha.botao} →
            </a>
          </div>

          <button
            onClick={() => setSlide((slide + campanhas.length - 1) % campanhas.length)}
            aria-label="Banner anterior"
            className="absolute left-2 top-1/2 rounded-full bg-white/20 px-4 py-2 text-2xl"
          >
            ‹
          </button>

          <button
            onClick={() => setSlide((slide + 1) % campanhas.length)}
            aria-label="Próximo banner"
            className="absolute right-2 top-1/2 rounded-full bg-white/20 px-4 py-2 text-2xl"
          >
            ›
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {campanhas.map((item, i) => (
            <button
              key={item.etiqueta}
              onClick={() => setSlide(i)}
              aria-label={`Campanha ${i + 1}`}
              className={`h-2 rounded-full ${slide === i ? "w-9 bg-blue-950" : "w-2 bg-slate-300"}`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-2">
          Campanhas demonstrativas com troca automática de banners.
        </p>
      </section>

      {/* ANUNCIAR GRÁTIS */}
      <section id="anunciar" className="max-w-7xl mx-auto px-4 mt-9">
        <div className="rounded-2xl bg-yellow-400 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-blue-950">
              Seu anúncio começa grátis!
            </h2>
            <p className="mt-2 text-blue-950">
              Publique seus produtos e serviços e encontre compradores.
            </p>
          </div>

          <a
            href="/vender"
            className="rounded-xl bg-blue-950 px-7 py-4 font-black text-white whitespace-nowrap"
          >
            + CRIAR ANÚNCIO
          </a>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section id="categorias" className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-black text-blue-950">
          Explore por categorias
        </h2>
        <p className="text-slate-500 mt-1">
          Encontre o que procura em todo o Brasil.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-5">
          {categorias.map(([emoji, nome]) => (
            <a
              href={`/comprar?categoria=${encodeURIComponent(nome)}`}
              key={nome}
              className="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm hover:shadow-md hover:border-blue-300"
            >
              <span className="text-3xl">{emoji}</span>
              <strong className="block mt-2 text-sm">{nome}</strong>
            </a>
          ))}
        </div>
      </section>

      {/* VITRINE DE ANÚNCIOS */}
      <section id="anuncios" className="max-w-7xl mx-auto px-4 mt-12">

        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-blue-950">
              Oportunidades em destaque
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Anúncios de demonstração de diferentes regiões.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

          {anunciosFiltrados.map((produto) => (
            <article
              key={produto.nome}
              className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100"
            >
              <div className="relative">
                <Image
                  src={`https://images.unsplash.com/${produto.foto}?auto=format&fit=crop&w=600&q=80`}
                  alt={produto.nome}
                  width={600}
                  height={450}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                  className="w-full h-36 sm:h-48 object-cover"
                />

                <span className="absolute top-2 left-2 rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-black text-blue-950">
                  {produto.selo}
                </span>
              </div>

              <div className="p-3">
                <h3 className="font-bold">{produto.nome}</h3>
                <p className="text-xl font-black text-blue-950 mt-2">
                  R$ {produto.preco}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  📍 {produto.bairro}, {produto.cidade} - {produto.estado}
                </p>

                <a
                  href="/comprar"
                  className="block text-center rounded-lg bg-blue-950 text-white text-xs font-bold p-3 mt-3"
                >
                  Ver anúncio
                </a>
              </div>
            </article>
          ))}

        </div>

        {anunciosFiltrados.length === 0 && (
          <p className="text-center text-slate-500 bg-white rounded-xl p-8 mt-5">
            Nenhum anúncio demonstrativo encontrado com esses filtros.
          </p>
        )}

        <p className="text-xs text-slate-400 mt-3">
          Produtos, locais e preços são exemplos. Os anúncios reais serão publicados pelos vendedores.
        </p>
      </section>

      {/* CAMPANHAS */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="rounded-3xl bg-rose-950 text-white p-7 sm:p-10">

          <span className="text-yellow-300 text-sm font-bold">
            ⏳ CAMPANHAS COM PRAZO
          </span>

          <h2 className="text-3xl font-black mt-3">
            Não perca oportunidades!
          </h2>

          <p className="text-rose-100 mt-3 max-w-xl">
            Confira anúncios com ofertas e prazos informados pelos vendedores.
            A urgência será exibida somente quando for verdadeira.
          </p>

          <a
            href="#anuncios"
            className="inline-block bg-yellow-400 text-blue-950 rounded-xl px-6 py-3 mt-6 font-black"
          >
            CONFERIR OPORTUNIDADES →
          </a>
        </div>
      </section>

      {/* PLANOS AFD */}
      <section id="planos" className="max-w-7xl mx-auto px-4 mt-16 mb-16">
        <div className="rounded-3xl bg-blue-950 text-white text-center p-8 md:p-12">
          <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm">
            Cresça com a AFD
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3">
            Seu próximo passo para vender mais começa aqui
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mt-4">
            Conheça as opções para anunciar seus produtos e serviços.
            Comece gratuitamente ou escolha mais espaço para sua operação crescer.
          </p>
          <a href="/planos"
            className="inline-block bg-yellow-400 text-blue-950 rounded-xl px-8 py-4 mt-7 font-black hover:bg-yellow-300 transition">
            CONHECER TODOS OS PLANOS →
          </a>
        </div>
      </section>

      {/* CADASTRO */}
      <section id="cadastro" className="max-w-7xl mx-auto px-4 mt-12">
        <div className="rounded-3xl bg-blue-950 text-white text-center p-8">

          <h2 className="text-3xl font-black">
            A sua oportunidade começa aqui!
          </h2>

          <p className="mt-3 text-blue-100">
            AFD — conectando compradores e vendedores em todo o Brasil.
          </p>

          <a
            href="#inicio"
            className="inline-block mt-6 rounded-xl bg-yellow-400 text-blue-950 px-7 py-4 font-black"
          >
            VOLTAR AO INÍCIO
          </a>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="text-center text-sm text-slate-500 py-8 px-4">
        <strong className="text-blue-950">AFD — A Feira Digital</strong>
        <p className="mt-2">Conectando oportunidades em todo o Brasil.</p>
        <p className="mt-2">© 2026 AFD. Todos os direitos reservados.</p>
      </footer>

    </main>
  );
}
