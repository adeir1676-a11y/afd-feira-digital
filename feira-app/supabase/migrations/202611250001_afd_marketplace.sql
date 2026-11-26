create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text,
  telefone text,
  tipo_conta text check (tipo_conta in ('pf', 'pj')),
  tipo_documento text,
  documento text,
  razao_social text,
  nome_fantasia text,
  estado char(2),
  cidade text,
  created_at timestamptz not null default now()
);

alter table public.perfis enable row level security;

drop policy if exists "Perfis publicos podem ser lidos" on public.perfis;
create policy "Perfis publicos podem ser lidos"
  on public.perfis for select
  using (true);

drop policy if exists "Usuario altera proprio perfil" on public.perfis;
create policy "Usuario altera proprio perfil"
  on public.perfis for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.criar_perfil_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (
    id, nome_completo, telefone, tipo_conta, tipo_documento, documento,
    razao_social, nome_fantasia, estado, cidade
  )
  values (
    new.id,
    new.raw_user_meta_data->>'nome_completo',
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'tipo_conta',
    new.raw_user_meta_data->>'tipo_documento',
    new.raw_user_meta_data->>'documento',
    new.raw_user_meta_data->>'razao_social',
    new.raw_user_meta_data->>'nome_fantasia',
    new.raw_user_meta_data->>'estado',
    new.raw_user_meta_data->>'cidade'
  )
  on conflict (id) do update set
    nome_completo = excluded.nome_completo,
    telefone = excluded.telefone,
    tipo_conta = excluded.tipo_conta,
    tipo_documento = excluded.tipo_documento,
    documento = excluded.documento,
    razao_social = excluded.razao_social,
    nome_fantasia = excluded.nome_fantasia,
    estado = excluded.estado,
    cidade = excluded.cidade;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_perfil_usuario();

create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  preco numeric(12,2) not null check (preco >= 0),
  categoria text not null,
  estado char(2) not null,
  cidade text not null,
  descricao text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.anuncios enable row level security;

drop policy if exists "Anuncios ativos sao publicos" on public.anuncios;
create policy "Anuncios ativos sao publicos"
  on public.anuncios for select
  using (ativo = true);

drop policy if exists "Vendedor cria anuncio" on public.anuncios;
create policy "Vendedor cria anuncio"
  on public.anuncios for insert
  with check (auth.uid() = vendedor_id);

drop policy if exists "Vendedor gerencia anuncio" on public.anuncios;
create policy "Vendedor gerencia anuncio"
  on public.anuncios for update
  using (auth.uid() = vendedor_id)
  with check (auth.uid() = vendedor_id);

drop policy if exists "Vendedor exclui anuncio" on public.anuncios;
create policy "Vendedor exclui anuncio"
  on public.anuncios for delete
  using (auth.uid() = vendedor_id);

create table if not exists public.denuncias (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references auth.users(id) on delete cascade,
  anuncio_id uuid references public.anuncios(id) on delete set null,
  motivo text not null,
  created_at timestamptz not null default now()
);

alter table public.denuncias enable row level security;

drop policy if exists "Autor cria denuncia" on public.denuncias;
create policy "Autor cria denuncia"
  on public.denuncias for insert
  with check (auth.uid() = autor_id);

drop policy if exists "Autor ve propria denuncia" on public.denuncias;
create policy "Autor ve propria denuncia"
  on public.denuncias for select
  using (auth.uid() = autor_id);
