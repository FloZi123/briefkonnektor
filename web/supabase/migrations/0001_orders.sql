-- Flinkbrief: Bestellungen + PDF-Ablage
-- Zugriff ausschließlich über den Service-Role-Key aus den Server-Routen (RLS an, keine Policies).

create table if not exists public.orders (
  id                text primary key,                      -- FB-2026-XXXXXX
  token             text not null,                         -- Download-Token
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  expires_at        timestamptz not null default now() + interval '30 days',
  status            text not null check (status in ('pending','paid','queued','sent','delivered','failed')),
  shipping          text not null check (shipping in ('download','post','registered')),
  price_cents       integer not null,
  price_label       text not null,
  email             text not null,
  subject           text not null,
  recipient_name    text not null,
  deadline          date,
  draft             jsonb not null,                        -- kompletter Entwurf inkl. Unterschrift (für Webhook-Verarbeitung)
  pdf_path          text,                                  -- Pfad im Bucket "letters"
  carrier_ref       text,
  stripe_session_id text,
  last_error        text
);

create index if not exists orders_stripe_session_idx on public.orders (stripe_session_id);
create index if not exists orders_expires_idx on public.orders (expires_at);

alter table public.orders enable row level security;

create or replace function public.orders_touch() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.orders_touch();

-- privater Bucket für die gerenderten Briefe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('letters', 'letters', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Aufräumen abgelaufener Bestellungen (per Cron/Edge-Function täglich aufrufen):
--   delete from public.orders where expires_at < now();
--   + zugehörige Objekte im Bucket "letters" löschen

-- 0002: Versandstatus des Carriers und Einschreiben-Sendungsnummer (angewendet am 21.10.2026)
alter table public.orders add column if not exists carrier_status text;
alter table public.orders add column if not exists tracking_number text;
create index if not exists orders_carrier_ref_idx on public.orders (carrier_ref);

-- 0003: Status "cancelled" (Stornierung beim Carrier)
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending','paid','queued','sent','delivered','failed','cancelled'));
