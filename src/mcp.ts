import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AddressSchema, SenderSchema, type Letter } from "./types.js";
import { store } from "./store.js";
import { getCarrier } from "./carriers/index.js";
import { PingenCarrier } from "./carriers/pingen.js";
import { renderLetter } from "./letter/render.js";
import { allClasses, pickClass } from "./pricing.js";

export interface Context {
  /** Kunden-ID aus der Authentifizierung – trennt die Mandanten. */
  customer: string;
}

function fmtDate(d = new Date()): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function summary(l: Letter, price?: number) {
  return {
    letter_id: l.id,
    status: l.status,
    recipient: `${l.recipient.name}, ${l.recipient.zip} ${l.recipient.city} (${l.recipient.country})`,
    subject: l.subject,
    pages: l.pages,
    color: l.color,
    duplex: l.duplex,
    created_at: l.createdAt,
    ...(price !== undefined ? { price_estimate_eur_net: price } : {}),
    ...(l.carrierRef ? { carrier: l.carrier, carrier_ref: l.carrierRef, carrier_status: l.carrierStatus } : {}),
    ...(l.sentAt ? { sent_at: l.sentAt } : {}),
    ...(l.lastError ? { last_error: l.lastError } : {}),
  };
}

const json = (obj: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] });

/** Baut pro Request einen frischen MCP-Server mit Kundenkontext. */
export function createMcpServer(ctx: Context): McpServer {
  const server = new McpServer(
    { name: "briefkonnektor", version: "0.1.0" },
    {
      instructions:
        "Du kannst echte Briefe per Post verschicken. Ablauf: create_letter → preview_letter (dem Nutzer zeigen) → " +
        "send_letter nur nach ausdrücklicher Bestätigung des Nutzers (confirm=true). Preise sind Netto-Schätzungen in EUR. " +
        "Werbebriefe ab 500 Stück sind als Kampagne deutlich günstiger – bei Serienbriefen darauf hinweisen.",
    },
  );
  const carrier = getCarrier();

  server.registerTool(
    "create_letter",
    {
      title: "Brief erstellen",
      description:
        "Erstellt einen Briefentwurf (DIN 5008, A4) und rendert das PDF. Gibt letter_id, Seitenzahl und Preisschätzung zurück. " +
        "Der Brief wird NICHT versendet. Text im body als Fließtext mit Absätzen (Leerzeile = neuer Absatz), inkl. Anrede und Grußformel.",
      inputSchema: {
        sender: SenderSchema.describe("Absender – erscheint im Briefkopf und als Rücksendeangabe"),
        recipient: AddressSchema.describe("Empfänger"),
        subject: z.string().min(1).max(120).describe("Betreffzeile"),
        body: z.string().min(1).max(20000).describe("Brieftext inkl. Anrede und Grußformel; Absätze durch Leerzeilen trennen"),
        date: z.string().optional().describe("Datum im Format TT.MM.JJJJ; Standard: heute"),
        info_lines: z.array(z.string()).max(5).optional().describe("Zusätzliche Zeilen im Infoblock, z. B. 'Ihr Zeichen: AB-12'"),
        color: z.boolean().default(false).describe("Farbdruck (teurer); Standard schwarz-weiß"),
        duplex: z.boolean().default(false).describe("Beidseitiger Druck"),
      },
    },
    async (args) => {
      const date = args.date ?? fmtDate();
      const { pdf, pages } = await renderLetter({
        sender: args.sender,
        recipient: args.recipient,
        subject: args.subject,
        body: args.body,
        date,
        infoLines: args.info_lines,
      });
      const letter = await store.create({
        customer: ctx.customer,
        sender: args.sender,
        recipient: args.recipient,
        subject: args.subject,
        body: args.body,
        date,
        color: args.color,
        duplex: args.duplex,
        pdf,
        pages,
      });
      const opts = { color: args.color, duplex: args.duplex };
      const live = carrier instanceof PingenCarrier ? await carrier.quote(args.recipient.country, opts) : undefined;
      const price = live ?? carrier.estimatePrice(pages, opts, args.recipient.country);
      return json({
        ...summary(letter, price),
        price_source: live !== undefined ? "carrier_live" : "estimate",
        next_step: "Zeige dem Nutzer die Vorschau (preview_letter) und hole eine ausdrückliche Freigabe ein, bevor du send_letter aufrufst.",
      });
    },
  );

  server.registerTool(
    "preview_letter",
    {
      title: "Briefvorschau",
      description: "Liefert das gerenderte PDF eines Briefentwurfs zur Kontrolle (als eingebettete Ressource) plus Zusammenfassung.",
      inputSchema: { letter_id: z.string().describe("ID aus create_letter") },
    },
    async ({ letter_id }) => {
      const l = await store.get(ctx.customer, letter_id);
      if (!l) return { isError: true, content: [{ type: "text", text: `Brief ${letter_id} nicht gefunden.` }] };
      return {
        content: [
          { type: "text", text: JSON.stringify(summary(l), null, 2) },
          {
            type: "resource",
            resource: {
              uri: `letter://${l.id}.pdf`,
              mimeType: "application/pdf",
              blob: Buffer.from(l.pdf).toString("base64"),
            },
          },
        ],
      };
    },
  );

  server.registerTool(
    "send_letter",
    {
      title: "Brief versenden",
      description:
        "Übergibt einen Briefentwurf an den Carrier (Druck, Kuvertierung, Porto). Kostenpflichtig und nicht rückgängig zu machen. " +
        "Nur mit confirm=true aufrufen, nachdem der Nutzer den Versand ausdrücklich freigegeben hat.",
      inputSchema: {
        letter_id: z.string(),
        confirm: z.boolean().describe("Muss true sein – bestätigt die ausdrückliche Freigabe durch den Nutzer"),
      },
    },
    async ({ letter_id, confirm }) => {
      if (!confirm) {
        return { isError: true, content: [{ type: "text", text: "Versand nicht bestätigt (confirm=false). Bitte erst Freigabe des Nutzers einholen." }] };
      }
      const l = await store.get(ctx.customer, letter_id);
      if (!l) return { isError: true, content: [{ type: "text", text: `Brief ${letter_id} nicht gefunden.` }] };
      if (l.status !== "draft" && l.status !== "failed") {
        return { isError: true, content: [{ type: "text", text: `Brief ${letter_id} ist bereits im Status "${l.status}".` }] };
      }
      try {
        const r = await carrier.send(l, { color: l.color, duplex: l.duplex });
        l.status = "queued";
        l.carrier = carrier.name;
        l.carrierRef = r.carrierRef;
        l.carrierStatus = r.carrierStatus;
        l.sentAt = new Date().toISOString();
        l.lastError = undefined;
      } catch (e) {
        l.status = "failed";
        l.lastError = e instanceof Error ? e.message : String(e);
      }
      await store.update(l);
      return json(summary(l));
    },
  );

  server.registerTool(
    "get_status",
    {
      title: "Versandstatus",
      description: "Aktueller Status eines Briefs (draft, queued, sent, delivered, failed, cancelled), bei Bedarf frisch vom Carrier abgefragt.",
      inputSchema: { letter_id: z.string() },
    },
    async ({ letter_id }) => {
      const l = await store.get(ctx.customer, letter_id);
      if (!l) return { isError: true, content: [{ type: "text", text: `Brief ${letter_id} nicht gefunden.` }] };
      if (l.carrierRef && l.status !== "delivered" && l.status !== "cancelled") {
        try {
          const s = await carrier.status(l.carrierRef);
          l.status = s.status;
          l.carrierStatus = s.carrierStatus;
          await store.update(l);
        } catch (e) {
          l.lastError = e instanceof Error ? e.message : String(e);
        }
      }
      return json(summary(l));
    },
  );

  server.registerTool(
    "cancel_letter",
    {
      title: "Versand stornieren",
      description: "Storniert einen bereits übergebenen Brief, solange der Carrier noch nicht gedruckt hat. Nur mit confirm=true.",
      inputSchema: { letter_id: z.string(), confirm: z.boolean() },
    },
    async ({ letter_id, confirm }) => {
      if (!confirm) return { isError: true, content: [{ type: "text", text: "Stornierung nicht bestätigt (confirm=false)." }] };
      const l = await store.get(ctx.customer, letter_id);
      if (!l) return { isError: true, content: [{ type: "text", text: `Brief ${letter_id} nicht gefunden.` }] };
      if (!l.carrierRef || l.status !== "queued") {
        return { isError: true, content: [{ type: "text", text: `Brief ${letter_id} kann im Status "${l.status}" nicht storniert werden.` }] };
      }
      try {
        if (carrier instanceof PingenCarrier) await carrier.cancel(l.carrierRef);
        l.status = "cancelled";
        l.carrierStatus = "cancelled";
      } catch (e) {
        l.lastError = e instanceof Error ? e.message : String(e);
      }
      await store.update(l);
      return json(summary(l));
    },
  );

  server.registerTool(
    "list_letters",
    {
      title: "Briefe auflisten",
      description: "Listet die letzten Briefe des Kunden mit Status (neueste zuerst).",
      inputSchema: { limit: z.number().int().min(1).max(100).default(20) },
    },
    async ({ limit }) => {
      const letters = await store.list(ctx.customer, limit);
      return json(letters.map((l) => summary(l)));
    },
  );

  server.registerTool(
    "estimate_campaign",
    {
      title: "Kampagne kalkulieren",
      description:
        "Preisschätzung für Serien-/Werbebriefe: wählt automatisch die günstigste Versandklasse (Einzelbrief, Dialogpost Easy ab 500, Dialogpost ab 5.000). " +
        "Rabattklassen gelten nur für werbliche Inhalte und Versand innerhalb Deutschlands.",
      inputSchema: {
        quantity: z.number().int().min(1).describe("Anzahl Briefe"),
        is_advertising: z.boolean().describe("Ist der Inhalt werblich (Angebot, Einladung, Produktinfo)? Rechnungen/Verträge: false"),
        country: z.string().length(2).default("DE"),
      },
    },
    async ({ quantity, is_advertising, country }) => {
      const c = pickClass(quantity, is_advertising, country.toUpperCase());
      return json({
        quantity,
        shipping_class: c.shippingClass,
        label: c.label,
        price_per_letter_eur_net: c.price,
        total_eur_net: +(c.price * quantity).toFixed(2),
        advertising_only: c.advertisingOnly,
        note:
          c.shippingClass === "single" && is_advertising && country.toUpperCase() === "DE" && quantity < 500
            ? `Ab 500 Stück sinkt der Preis auf ${allClasses()[1].price} €/Brief (Dialogpost Easy).`
            : undefined,
      });
    },
  );

  return server;
}
