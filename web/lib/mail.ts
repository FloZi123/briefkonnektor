import nodemailer from "nodemailer";
import { OPERATOR as O } from "./legal";
import { PRICES } from "./types";
import type { Order } from "./orders";

/**
 * Transaktions-Mails über All-Inkl-SMTP (Postfach info@flinkbrief.de).
 * Ohne SMTP_HOST/SMTP_USER/SMTP_PASS wird nur geloggt – der Flow bleibt lauffähig.
 */
const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001").replace(/\/$/, "");

function transport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export async function sendMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const t = transport();
  const from = process.env.MAIL_FROM ?? `Flinkbrief <${O.email}>`;
  if (!t) {
    console.warn(`[mail] SMTP nicht konfiguriert – nicht gesendet: "${subject}" an ${to}`);
    return false;
  }
  try {
    await t.sendMail({ from, to, subject, html, text, replyTo: O.email });
    return true;
  } catch (e) {
    console.error("[mail] Versand fehlgeschlagen", subject, to, e);
    return false;
  }
}

/* ---------- Vorlagen ---------- */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f0f1ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f1ee;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dcdfd9;border-radius:10px;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#16203a;">
<tr><td style="padding:22px 28px 0;"><a href="${base()}" style="font-family:Arial,Helvetica,sans-serif;font-weight:800;font-size:20px;color:#16203a;text-decoration:none;">flink<span style="color:#2f5bea;">brief</span></a></td></tr>
<tr><td style="padding:18px 28px 8px;">${bodyHtml}</td></tr>
<tr><td style="padding:14px 28px 20px;border-top:1px solid #dcdfd9;font-size:12px;line-height:1.5;color:#5a6274;">
Flinkbrief · <a href="mailto:${O.email}" style="color:#5a6274;">${O.email}</a><br>
<a href="${base()}/impressum" style="color:#5a6274;">Impressum</a> · <a href="${base()}/datenschutz" style="color:#5a6274;">Datenschutz</a> · <a href="${base()}/widerruf" style="color:#5a6274;">Widerruf</a> · <a href="${base()}/agb" style="color:#5a6274;">AGB</a>
</td></tr></table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:18px 0;"><a href="${href}" style="display:inline-block;background:#2f5bea;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">${esc(label)}</a></p>`;

const statusUrl = (o: Order) => `${base()}/brief/fertig?order=${o.id}&t=${o.token}`;
const pdfUrl = (o: Order) => `${base()}/api/letters/${o.id}/pdf?t=${o.token}`;

/** Bestellbestätigung nach Zahlung – mit Bestellnummer, Status-Link und PDF. */
export function renderOrderConfirmation(o: Order): { subject: string; html: string; text: string } {
  const isDownload = o.shipping === "download";
  const product = PRICES[o.shipping].label;
  const subject = isDownload ? `Ihr Brief ist fertig – Bestellung ${o.id}` : `Ihr Brief geht raus – Bestellung ${o.id}`;
  const intro = isDownload
    ? "vielen Dank für Ihre Bestellung. Ihr Brief ist fertig und kann heruntergeladen werden. Bitte ausdrucken, von Hand unterschreiben und abschicken."
    : "vielen Dank für Ihre Bestellung. Ihr Brief wird gedruckt, kuvertiert und der Post übergeben – an Werktagen bis 12 Uhr noch am selben Tag.";
  const html = layout(
    subject,
    `<p style="margin:0 0 14px;">Guten Tag ${esc(o.draft.sender.name)},</p>
<p style="margin:0 0 14px;">${esc(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;margin:0 0 6px;">
<tr><td style="padding:3px 14px 3px 0;color:#5a6274;">Bestellnummer</td><td style="padding:3px 0;font-family:Menlo,Consolas,monospace;">${esc(o.id)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#5a6274;">Betreff</td><td style="padding:3px 0;">${esc(o.subject)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#5a6274;">Empfänger</td><td style="padding:3px 0;">${esc(o.recipientName)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#5a6274;">Leistung</td><td style="padding:3px 0;">${esc(product)} · ${esc(o.priceLabel)} inkl. MwSt.</td></tr>
${o.deadline ? `<tr><td style="padding:3px 14px 3px 0;color:#5a6274;">Frist (Ihre Angabe)</td><td style="padding:3px 0;">${esc(o.deadline)}</td></tr>` : ""}
</table>
${button(isDownload ? pdfUrl(o) : statusUrl(o), isDownload ? "PDF herunterladen" : "Status ansehen")}
<p style="margin:0 0 14px;font-size:14px;color:#5a6274;">${isDownload ? `Status und Download jederzeit: <a href="${statusUrl(o)}" style="color:#2f5bea;">${statusUrl(o)}</a>` : `Eine PDF-Kopie Ihres Briefs: <a href="${pdfUrl(o)}" style="color:#2f5bea;">herunterladen</a>`}<br>Links gelten 30 Tage, danach löschen wir Bestellung und PDF automatisch.</p>
<p style="margin:0 0 6px;">Mit freundlichen Grüßen<br><strong>Ihr Flinkbrief-Team</strong></p>`,
  );
  const text = `Guten Tag ${o.draft.sender.name},\n\n${intro}\n\nBestellnummer: ${o.id}\nBetreff: ${o.subject}\nEmpfänger: ${o.recipientName}\nLeistung: ${product} · ${o.priceLabel} inkl. MwSt.\n\nStatus: ${statusUrl(o)}\nPDF: ${pdfUrl(o)}\n\nLinks gelten 30 Tage.\n\nMit freundlichen Grüßen\nIhr Flinkbrief-Team · ${base()}`;
  return { subject, html, text };
}

export async function sendOrderConfirmation(o: Order): Promise<boolean> {
  const m = renderOrderConfirmation(o);
  return sendMail(o.email, m.subject, m.html, m.text);
}

/** Versandstatus: eingeliefert / Problem. */
export function renderStatusMail(o: Order, status: "sent" | "failed"): { subject: string; html: string; text: string } {
  const subject = status === "sent" ? `Ihr Brief ist bei der Post – ${o.id}` : `Problem beim Versand – ${o.id}`;
  const msg =
    status === "sent"
      ? "Ihr Brief wurde gedruckt und der Post übergeben. Die Zustellung dauert innerhalb Deutschlands üblicherweise ein bis drei Werktage."
      : "beim Versand Ihres Briefs ist ein Problem aufgetreten. Wir kümmern uns darum und melden uns bei Ihnen – Sie müssen nichts tun. Wenn es eilt, können Sie das PDF herunterladen, ausdrucken und selbst einwerfen.";
  const html = layout(subject, `<p style="margin:0 0 14px;">Guten Tag ${esc(o.draft.sender.name)},</p><p style="margin:0 0 14px;">${esc(msg)}</p>${button(statusUrl(o), "Status ansehen")}<p style="margin:0 0 6px;">Mit freundlichen Grüßen<br><strong>Ihr Flinkbrief-Team</strong></p>`);
  const text = `Guten Tag ${o.draft.sender.name},\n\n${msg}\n\nStatus: ${statusUrl(o)}\n\nMit freundlichen Grüßen\nIhr Flinkbrief-Team`;
  return { subject, html, text };
}

export async function sendStatusMail(o: Order, status: "sent" | "failed"): Promise<boolean> {
  const m = renderStatusMail(o, status);
  return sendMail(o.email, m.subject, m.html, m.text);
}
