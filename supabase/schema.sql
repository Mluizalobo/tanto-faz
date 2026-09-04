-- TANTO FAZ — schema do banco compartilhado
-- Cole este script inteiro no SQL Editor do Supabase e clique em Run.

create table if not exists moradoras (
  id text primary key,
  nome text not null,
  avatar text,
  status text not null default 'ativa',
  data_entrada date not null,
  data_saida date
);

create table if not exists categorias (
  id text primary key,
  nome text not null
);

create table if not exists despesas (
  id text primary key,
  descricao text not null default '',
  valor numeric not null default 0,
  data date not null,
  categoria_id text references categorias(id) on delete set null,
  pago_por text references moradoras(id) on delete set null,
  forma_pagamento text,
  comprovante_path text,
  comprovante_nome text,
  observacao text default '',
  criado_em timestamptz not null default now()
);

create table if not exists entradas (
  id text primary key,
  data date not null,
  valor numeric not null default 0,
  moradora_id text references moradoras(id) on delete set null,
  referencia text default '',
  observacao text default '',
  criado_em timestamptz not null default now()
);

create table if not exists fechamentos (
  month_key text primary key,
  fechado boolean not null default false,
  fechado_por text,
  fechado_em timestamptz
);

create table if not exists anexos (
  id text primary key,
  nome text not null,
  descricao text default '',
  arquivo_path text not null,
  arquivo_nome text not null,
  criado_em timestamptz not null default now()
);

-- Categorias padrão (só insere se a tabela estiver vazia)
insert into categorias (id, nome)
select * from (values
  ('cat-supermercado', 'Supermercado'),
  ('cat-limpeza', 'Limpeza'),
  ('cat-higiene', 'Higiene'),
  ('cat-agua', 'Água'),
  ('cat-energia', 'Energia'),
  ('cat-internet', 'Internet'),
  ('cat-gas', 'Gás'),
  ('cat-manutencao', 'Manutenção'),
  ('cat-aluguel', 'Aluguel'),
  ('cat-outros', 'Outros')
) as v(id, nome)
where not exists (select 1 from categorias);

-- Habilita atualização em tempo real (todas as moradoras veem mudanças na hora)
alter publication supabase_realtime add table moradoras, categorias, despesas, entradas, fechamentos, anexos;

-- Bucket para guardar fotos de comprovante
insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', true)
on conflict (id) do nothing;

-- Este é um app privado só para a república (sem login individual), então liberamos
-- leitura e escrita para quem tiver o link do app. Não há dados sensíveis (só despesas
-- da casa), mas evite compartilhar o link publicamente fora do grupo da república.
alter table moradoras enable row level security;
alter table categorias enable row level security;
alter table despesas enable row level security;
alter table entradas enable row level security;
alter table fechamentos enable row level security;
alter table anexos enable row level security;

create policy "public all moradoras" on moradoras for all using (true) with check (true);
create policy "public all categorias" on categorias for all using (true) with check (true);
create policy "public all despesas" on despesas for all using (true) with check (true);
create policy "public all entradas" on entradas for all using (true) with check (true);
create policy "public all fechamentos" on fechamentos for all using (true) with check (true);
create policy "public all anexos" on anexos for all using (true) with check (true);
create policy "public all comprovantes" on storage.objects for all
  using (bucket_id = 'comprovantes') with check (bucket_id = 'comprovantes');
