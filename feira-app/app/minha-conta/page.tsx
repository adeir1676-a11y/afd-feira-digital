import AccountShell from "@/components/AccountShell";

export default function MinhaContaPage() {
  return (
    <AccountShell title="Minha conta">
      <div className="grid gap-4 sm:grid-cols-3">
        <a href="/meus-anuncios" className="rounded-xl border p-5 font-bold text-blue-950 hover:border-blue-500">Gerenciar anúncios</a>
        <a href="/favoritos" className="rounded-xl border p-5 font-bold text-blue-950 hover:border-blue-500">Ver favoritos</a>
        <a href="/configuracoes" className="rounded-xl border p-5 font-bold text-blue-950 hover:border-blue-500">Configurações</a>
      </div>
    </AccountShell>
  );
}
