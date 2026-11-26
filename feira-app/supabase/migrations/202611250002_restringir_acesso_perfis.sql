alter table public.perfis enable row level security;

drop policy if exists "Perfis publicos podem ser lidos" on public.perfis;
drop policy if exists "Usuario le proprio perfil" on public.perfis;

create policy "Usuario le proprio perfil"
  on public.perfis for select
  using (auth.uid() = id);
