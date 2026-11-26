import Link from "next/link";

export default function AjudaPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-bold text-blue-800">← Voltar ao início</Link>
        <h1 className="mt-5 text-3xl font-black text-blue-950">Ajuda e suporte</h1>
        <div className="mt-6 space-y-4 text-slate-700">
          <p><strong>Como anunciar:</strong> crie uma conta, entre no painel e use a opção &quot;Criar anúncio&quot;.</p>
          <p><strong>Como comprar:</strong> utilize a busca e abra os detalhes de um anúncio.</p>
          <p><strong>Segurança:</strong> nunca faça pagamento fora do canal acordado e use denúncias para conteúdo suspeito.</p>
        </div>
      </div>
    </main>
  );
}
