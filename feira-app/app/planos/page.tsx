const planos = [
  {
    id: "gratuito",
    nome: "Gratuito",
    destaque: "Para começar",
    anuncios: "5",
    fotos: "5",
    descricao: "Comece a apresentar seus produtos e serviços na AFD sem precisar contratar um plano pago.",
    indicado: "Para quem está começando ou anuncia ocasionalmente.",
    botao: "COMEÇAR GRÁTIS",
    link: "/cadastro?plano=gratuito",
    estilo: "border-slate-200",
  },
  {
    id: "plus",
    nome: "Plus",
    destaque: "Mais espaço para anunciar",
    anuncios: "30",
    fotos: "10",
    descricao: "Tenha mais espaço para divulgar diferentes produtos e ampliar seu catálogo de anúncios.",
    indicado: "Para vendedores com variedade de produtos.",
    botao: "QUERO CONHECER O PLUS",
    link: "/cadastro?plano=plus",
    estilo: "border-blue-300",
  },
  {
    id: "pro",
    nome: "Pro",
    destaque: "Para vendedores em crescimento",
    anuncios: "100",
    fotos: "15",
    descricao: "Organize um catálogo maior e apresente seus produtos com mais fotos por anúncio.",
    indicado: "Para quem vende com frequência e possui um catálogo amplo.",
    botao: "QUERO CONHECER O PRO",
    link: "/cadastro?plano=pro",
    estilo: "border-yellow-400",
  },
  {
    id: "premium",
    nome: "Premium",
    destaque: "Máximo espaço para anunciar",
    anuncios: "300",
    fotos: "20",
    descricao: "Tenha o maior limite de anúncios e fotos entre os planos disponíveis da AFD.",
    indicado: "Para lojas e operações com grande variedade de produtos.",
    botao: "QUERO CONHECER O PREMIUM",
    link: "/cadastro?plano=premium",
    estilo: "border-blue-900",
  },
];

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <span className="inline-block rounded-full bg-yellow-400 text-blue-950 px-4 py-2 text-xs font-black tracking-wider">
            PLANOS AFD — A FEIRA DIGITAL
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mt-6">
            Seu negócio merece<br className="hidden md:block" /> mais oportunidades
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto mt-6">
            Apresente seus produtos para compradores de todo o Brasil.
            Escolha o espaço ideal para anunciar e faça sua presença crescer na AFD.
          </p>
          <a href="#comparar"
            className="inline-block rounded-xl bg-yellow-400 text-blue-950 px-8 py-4 mt-8 font-black shadow-lg hover:bg-yellow-300 transition">
            ENCONTRE SEU PLANO →
          </a>
          <p className="text-blue-200 text-sm mt-5">
            Você pode começar gratuitamente. Sem obrigação de contratar um plano pago.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-blue-950">
            Escolha como você quer crescer
          </h2>
          <p className="text-slate-600 mt-4">
            Todos os planos foram pensados para diferentes tamanhos de catálogo.
            Compare os limites e escolha o que combina com sua necessidade.
          </p>
        </div>

        <div id="comparar" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
          {planos.map((plano) => (
            <article key={plano.id} id={plano.id}
              className={`bg-white rounded-3xl border-2 ${plano.estilo} p-6 shadow-sm flex flex-col`}>
              <span className="text-xs font-black uppercase tracking-wide text-blue-700">
                {plano.destaque}
              </span>
              <h3 className="text-2xl font-black text-blue-950 mt-3">
                {plano.nome}
              </h3>
              <p className="text-slate-600 text-sm mt-3 min-h-20">
                {plano.descricao}
              </p>

              <div className="border-y border-slate-100 py-5 my-5 space-y-4">
                <div>
                  <p className="text-3xl font-black text-blue-950">{plano.anuncios}</p>
                  <p className="text-sm text-slate-500">anúncios ativos</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-950">{plano.fotos}</p>
                  <p className="text-sm text-slate-500">fotos por anúncio</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                <strong className="text-blue-950">Indicado para:</strong><br />
                {plano.indicado}
              </p>

              <a href={plano.link}
                className="mt-auto block text-center rounded-xl bg-blue-950 text-white px-4 py-4 text-sm font-black hover:bg-blue-800 transition">
                {plano.botao} →
              </a>
            </article>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 mt-12">
          <h2 className="text-2xl font-black text-blue-950 text-center">
            Compare antes de escolher
          </h2>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-950">
                  <th className="py-4 pr-4">Recursos</th>
                  <th className="py-4 px-3">Gratuito</th>
                  <th className="py-4 px-3">Plus</th>
                  <th className="py-4 px-3">Pro</th>
                  <th className="py-4 px-3">Premium</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="py-4 pr-4 font-bold">Anúncios ativos</td>
                  <td className="py-4 px-3">5</td>
                  <td className="py-4 px-3">30</td>
                  <td className="py-4 px-3">100</td>
                  <td className="py-4 px-3">300</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-bold">Fotos por anúncio</td>
                  <td className="py-4 px-3">5</td>
                  <td className="py-4 px-3">10</td>
                  <td className="py-4 px-3">15</td>
                  <td className="py-4 px-3">20</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <section className="rounded-3xl bg-blue-950 text-white text-center p-8 md:p-12 mt-12">
          <h2 className="text-3xl md:text-4xl font-black">
            Pronto para dar o próximo passo?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mt-4">
            Comece sua jornada na AFD. Cadastre-se e conheça as possibilidades
            para divulgar seus produtos e serviços em todo o Brasil.
          </p>
          <a href="/cadastro"
            className="inline-block rounded-xl bg-yellow-400 text-blue-950 px-8 py-4 mt-7 font-black hover:bg-yellow-300 transition">
            QUERO COMEÇAR AGORA →
          </a>
        </section>

        <p className="text-center text-xs text-slate-500 mt-8">
          Os limites apresentados correspondem às condições iniciais dos planos.
          Os preços e a contratação dos planos pagos serão informados quando o sistema
          de assinaturas e pagamentos estiver disponível. Nenhuma cobrança é realizada nesta página.
        </p>
        <div className="text-center mt-6">
          <a href="/" className="text-blue-800 font-bold hover:underline">
            ← Voltar para a página inicial
          </a>
        </div>
      </section>
    </main>
  );
}
