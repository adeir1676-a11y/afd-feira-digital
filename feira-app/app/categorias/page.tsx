import Link from "next/link";

const categorias = ["Moda e roupas","Eletrônicos","Casa e decoração","Veículos","Beleza","Pets","Serviços","Games","Esportes","Brinquedos","Acessórios","Outros"];

export default function CategoriasPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold text-blue-800">← Início</Link>
        <h1 className="mt-5 text-3xl font-black text-blue-950">Categorias</h1>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categorias.map((categoria) => (
            <a key={categoria} href={`/comprar?categoria=${encodeURIComponent(categoria)}`} className="rounded-xl bg-white p-5 text-center font-bold text-slate-700 shadow-sm hover:border-blue-300">
              {categoria}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
