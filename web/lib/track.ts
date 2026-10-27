"use client";
import { track as vtrack } from "@vercel/analytics";
import { getAttribution } from "@/lib/store";

/** Erlaubte Werte – Vercel Web Analytics nimmt nur Primitive. Nie E-Mail, Aktenzeichen, Betrag oder andere Angaben zur Person. */
type Props = Record<string, string | number | boolean | null | undefined>;

/**
 * Trichter-Ereignis an Vercel Web Analytics (cookielos, keine Speicherung im Browser).
 * Hängt die Kampagne der Einstiegsseite an, wenn vorhanden. Fehler werden geschluckt – Messen darf nie den Ablauf stören.
 */
export function track(name: string, props?: Props) {
  try {
    // Ereignisse aus Effekten beim ersten Laden (landing_view, order_paid) kommen vor <Analytics /> im Layout an.
    // Ohne Warteschlange würde track() sie verwerfen – dieselbe Queue legt @vercel/analytics sonst selbst an (initQueue).
    const w = window as unknown as { va?: (...a: unknown[]) => void; vaq?: unknown[][] };
    if (!w.va) w.va = (...a: unknown[]) => void (w.vaq ??= []).push(a);
    const clean: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(props ?? {})) if (v !== undefined) clean[k] = v;
    const campaign = getAttribution();
    if (campaign && clean.campaign === undefined) clean.campaign = campaign;
    vtrack(name, clean);
  } catch {}
}
