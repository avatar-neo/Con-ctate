-- Esquema inicial de Conéctate (MVP).
-- Todos los datos son visibles solo para miembros autenticados y aprobados.

create extension if not exists "pgcrypto";

-- Perfiles de miembros (uno por usuario de auth.users) -------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  business_name text,
  category text,
  city text,
  bio text,
  whatsapp text,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'editor', 'admin')),
  approved boolean not null default false,
  show_in_directory boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and approved);
$$;

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and approved and role in ('editor', 'admin'));
$$;

alter table public.profiles enable row level security;
create policy "miembros ven el directorio" on public.profiles
  for select using (public.is_approved() and (show_in_directory or id = auth.uid()));
create policy "cada quien crea su perfil" on public.profiles
  for insert with check (id = auth.uid() and approved = false and role = 'member');
create policy "cada quien edita su perfil" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Solo editores/admins pueden aprobar miembros o cambiar roles.
create or replace function public.protect_profile_flags() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.approved is distinct from old.approved or new.role is distinct from old.role)
     and not public.is_editor() then
    raise exception 'Solo un editor puede cambiar approved o role';
  end if;
  return new;
end;
$$;
create trigger profiles_protect_flags before update on public.profiles
  for each row execute function public.protect_profile_flags();
create policy "admins gestionan perfiles" on public.profiles
  for all using (public.is_editor());

-- Noticias (Home tipo blog) ----------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  body text not null,
  period text not null check (period in ('daily', 'weekly')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  ai_generated boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
create policy "miembros leen noticias publicadas" on public.posts
  for select using (public.is_approved() and status = 'published');
create policy "editores gestionan noticias" on public.posts
  for all using (public.is_editor());

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;
create policy "miembros leen comentarios" on public.comments for select using (public.is_approved());
create policy "miembros comentan" on public.comments for insert with check (public.is_approved() and author_id = auth.uid());
create policy "autor o editor borra" on public.comments for delete using (author_id = auth.uid() or public.is_editor());

-- Chat -------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, member_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at desc);

create or replace function public.is_conversation_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from conversation_members where conversation_id = cid and member_id = auth.uid());
$$;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "participantes ven la conversación" on public.conversations
  for select using (public.is_conversation_member(id));
create policy "miembros crean conversaciones" on public.conversations
  for insert with check (public.is_approved() and created_by = auth.uid());
create policy "participantes ven participantes" on public.conversation_members
  for select using (public.is_conversation_member(conversation_id));
create policy "creador agrega participantes" on public.conversation_members
  for insert with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
  );
create policy "participantes leen mensajes" on public.messages
  for select using (public.is_conversation_member(conversation_id));
create policy "participantes envían mensajes" on public.messages
  for insert with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

alter publication supabase_realtime add table public.messages;

-- Formularios y estadísticas -----------------------------------------------------
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  questions jsonb not null,           -- [{id, label, kind, options?}]
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null,             -- {questionId: valor}
  created_at timestamptz not null default now(),
  unique (form_id, member_id)
);

alter table public.forms enable row level security;
alter table public.form_responses enable row level security;
create policy "miembros ven formularios activos" on public.forms for select using (public.is_approved() and active);
create policy "editores gestionan formularios" on public.forms for all using (public.is_editor());
create policy "miembros responden" on public.form_responses
  for insert with check (public.is_approved() and member_id = auth.uid());
create policy "cada quien ve sus respuestas" on public.form_responses
  for select using (member_id = auth.uid() or public.is_editor());

-- Estadísticas agregadas sin exponer respuestas individuales.
create or replace function public.form_stats(fid uuid)
returns table (question_id text, answer text, total bigint)
language sql stable security definer set search_path = public as $$
  select q.key, q.value #>> '{}', count(*)
  from form_responses r, jsonb_each(r.answers) q
  where r.form_id = fid and public.is_approved()
  group by 1, 2
  order by 1, 3 desc;
$$;
