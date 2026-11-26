alter table public.anuncios enable row level security;

drop policy if exists "Vendedor exclui anuncio" on public.anuncios;

drop policy if exists "Vendedor ve proprios anuncios" on public.anuncios;
create policy "Vendedor ve proprios anuncios"
  on public.anuncios for select
  using (auth.uid() = vendedor_id);

create or replace function public.atualizar_data_anuncio()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists atualizar_data_anuncio on public.anuncios;
create trigger atualizar_data_anuncio
  before update on public.anuncios
  for each row execute function public.atualizar_data_anuncio();

alter table public.denuncias
  add column if not exists ad_id uuid references public.anuncios(id) on delete set null;

update public.denuncias
set ad_id = anuncio_id
where ad_id is null and anuncio_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'denuncias_ad_id_required'
      and conrelid = 'public.denuncias'::regclass
  ) then
    alter table public.denuncias
      add constraint denuncias_ad_id_required check (ad_id is not null) not valid;
  end if;
end;
$$;

create table if not exists public.favoritos (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  ad_id uuid not null references public.anuncios(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (usuario_id, ad_id)
);

alter table public.favoritos enable row level security;

drop policy if exists "Usuario le proprios favoritos" on public.favoritos;
create policy "Usuario le proprios favoritos"
  on public.favoritos for select
  using (auth.uid() = usuario_id);

drop policy if exists "Usuario salva anuncios ativos" on public.favoritos;
create policy "Usuario salva anuncios ativos"
  on public.favoritos for insert
  with check (
    auth.uid() = usuario_id
    and exists (
      select 1 from public.anuncios a
      where a.id = ad_id and a.ativo = true
    )
  );

drop policy if exists "Usuario remove proprios favoritos" on public.favoritos;
create policy "Usuario remove proprios favoritos"
  on public.favoritos for delete
  using (auth.uid() = usuario_id);

create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.anuncios(id) on delete cascade,
  remetente_id uuid not null references auth.users(id) on delete cascade,
  destinatario_id uuid not null references auth.users(id) on delete cascade,
  corpo text not null check (length(trim(corpo)) between 1 and 5000),
  created_at timestamptz not null default now(),
  check (remetente_id <> destinatario_id)
);

alter table public.mensagens enable row level security;

drop policy if exists "Participantes leem mensagens" on public.mensagens;
create policy "Participantes leem mensagens"
  on public.mensagens for select
  using (auth.uid() in (remetente_id, destinatario_id));

drop policy if exists "Comprador envia mensagem ao vendedor" on public.mensagens;
create policy "Comprador envia mensagem ao vendedor"
  on public.mensagens for insert
  with check (
    auth.uid() = remetente_id
    and exists (
      select 1 from public.anuncios a
      where a.id = ad_id
        and a.vendedor_id = destinatario_id
        and a.ativo = true
        and a.vendedor_id <> auth.uid()
    )
  );

drop policy if exists "Participantes respondem mensagens" on public.mensagens;
create policy "Participantes respondem mensagens"
  on public.mensagens for insert
  with check (
    auth.uid() = remetente_id
    and exists (
      select 1 from public.mensagens anterior
      where anterior.ad_id = mensagens.ad_id
        and (
          (anterior.remetente_id = auth.uid() and anterior.destinatario_id = mensagens.destinatario_id)
          or (anterior.destinatario_id = auth.uid() and anterior.remetente_id = mensagens.destinatario_id)
        )
    )
  );

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.anuncios(id) on delete cascade,
  avaliador_id uuid not null references auth.users(id) on delete cascade,
  vendedor_id uuid not null references auth.users(id) on delete cascade,
  nota integer not null check (nota between 1 and 5),
  comentario text not null check (length(trim(comentario)) between 1 and 2000),
  created_at timestamptz not null default now(),
  unique (ad_id, avaliador_id),
  check (avaliador_id <> vendedor_id)
);

alter table public.avaliacoes enable row level security;

drop policy if exists "Avaliacoes sao publicas" on public.avaliacoes;
create policy "Avaliacoes sao publicas"
  on public.avaliacoes for select
  using (true);

drop policy if exists "Usuario avalia vendedor de anuncio ativo" on public.avaliacoes;
create policy "Usuario avalia vendedor de anuncio ativo"
  on public.avaliacoes for insert
  with check (
    auth.uid() = avaliador_id
    and exists (
      select 1 from public.anuncios a
      where a.id = ad_id
        and a.vendedor_id = vendedor_id
        and a.ativo = true
        and a.vendedor_id <> auth.uid()
    )
  );

grant select, insert, delete on public.favoritos to authenticated;
grant select, insert on public.mensagens to authenticated;
grant select on public.avaliacoes to anon, authenticated;
grant insert on public.avaliacoes to authenticated;

create or replace function public.buscar_anuncios(
  p_busca text default '',
  p_estado text default null,
  p_categoria text default null,
  p_limite integer default 24,
  p_deslocamento integer default 0
)
returns table (
  id uuid,
  vendedor_id uuid,
  titulo text,
  preco numeric,
  categoria text,
  estado char(2),
  cidade text,
  descricao text,
  ativo boolean,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select
    a.id,
    a.vendedor_id,
    a.titulo,
    a.preco,
    a.categoria,
    a.estado,
    a.cidade,
    a.descricao,
    a.ativo,
    a.created_at,
    a.updated_at,
    count(*) over() as total_count
  from public.anuncios a
  where a.ativo = true
    and (
      coalesce(trim(p_busca), '') = ''
      or a.titulo ilike '%' || trim(p_busca) || '%'
      or a.categoria ilike '%' || trim(p_busca) || '%'
      or a.cidade ilike '%' || trim(p_busca) || '%'
    )
    and (p_estado is null or a.estado = p_estado)
    and (p_categoria is null or a.categoria = p_categoria)
  order by a.created_at desc
  limit least(greatest(coalesce(p_limite, 24), 1), 50)
  offset greatest(coalesce(p_deslocamento, 0), 0);
$$;

grant execute on function public.buscar_anuncios(text, text, text, integer, integer) to anon, authenticated;
