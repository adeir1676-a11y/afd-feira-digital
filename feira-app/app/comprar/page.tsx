import { Suspense } from "react";
import ComprarClient from "./ComprarClient";

export default function ComprarPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-slate-600">Carregando anúncios...</main>}>
      <ComprarClient />
    </Suspense>
  );
}
