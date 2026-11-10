-- Flinkbrief: Interessenten für "prüfen lassen" (Test der Vermittlungsidee, Nov. 2026)
-- Zugriff ausschließlich über den Service-Role-Key aus /api/interesse (RLS an, keine Policies).

create table if not exists public.interest (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  anlass      text not null,                 -- Kampagne/Anlass, z. B. nebenkosten
  email       text not null,
  plz         text,                          -- optional, für "Partner in Ihrer Nähe"
  campaign    text,                          -- Attribution aus localStorage (30 Tage)
  consent_at  timestamptz not null default now(),
  contacted_at timestamptz
);

create index if not exists interest_anlass_idx on public.interest (anlass, created_at desc);

alter table public.interest enable row level security;
