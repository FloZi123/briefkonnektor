import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { writeFileSync } from "node:fs";
import { createApp } from "../src/app";

/** End-to-End-Test: Server starten, alle Tools über einen echten MCP-Client aufrufen. */
process.env.API_KEYS ??= "test-token:testkunde";
process.env.CARRIER ??= "mock";

const srv = createApp().listen(0);
const port = (srv.address() as { port: number }).port;
const url = new URL(`http://localhost:${port}/mcp`);

const text = (r: { content: Array<{ type: string; text?: string }> }) => JSON.parse(r.content.find((c) => c.type === "text")!.text!);

try {
  // 1. ohne Token → 401
  const unauth = await fetch(url, { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
  if (unauth.status !== 401) throw new Error(`erwartet 401, bekam ${unauth.status}`);
  console.log("✓ Auth: ohne Token abgelehnt");

  const client = new Client({ name: "test", version: "0.0.1" });
  await client.connect(
    new StreamableHTTPClientTransport(url, { requestInit: { headers: { Authorization: "Bearer test-token" } } }),
  );
  const tools = (await client.listTools()).tools.map((t) => t.name);
  console.log("✓ Tools:", tools.join(", "));

  const created = text(
    (await client.callTool({
      name: "create_letter",
      arguments: {
        sender: { name: "Muster GmbH", street: "Industriestraße 5", zip: "92526", city: "Oberviechtach", country: "DE", phone: "09671 12345", email: "info@muster.de", website: "muster.de" },
        recipient: { name: "Max Mustermann", name2: "z. Hd. Einkauf", street: "Hauptstraße 12", zip: "80331", city: "München", country: "DE" },
        subject: "Ihr persönliches Angebot für die Herbstsaison",
        body:
          "Sehr geehrter Herr Mustermann,\n\nvielen Dank für Ihr Interesse an unseren Produkten. Gern unterbreiten wir Ihnen ein Angebot, das exakt auf Ihren Bedarf zugeschnitten ist.\n\n" +
          "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. ".repeat(6) +
          "\n\nMit freundlichen Grüßen\n\nFlorian Zinkl\nGeschäftsführung",
        info_lines: ["Kundennr.: 4711", "Ihr Ansprechpartner: F. Zinkl"],
      },
    })) as never,
  );
  console.log("✓ create_letter:", created.letter_id, `${created.pages} Seite(n)`, `${created.price_estimate_eur_net} €`);

  const preview = (await client.callTool({ name: "preview_letter", arguments: { letter_id: created.letter_id } })) as {
    content: Array<{ type: string; resource?: { blob: string; mimeType: string } }>;
  };
  const pdfPart = preview.content.find((c) => c.type === "resource")!.resource!;
  if (pdfPart.mimeType !== "application/pdf") throw new Error("PDF fehlt");
  const out = new URL("../test-output.pdf", import.meta.url);
  writeFileSync(out, Buffer.from(pdfPart.blob, "base64"));
  console.log("✓ preview_letter: PDF gespeichert →", out.pathname);

  const denied = (await client.callTool({ name: "send_letter", arguments: { letter_id: created.letter_id, confirm: false } })) as { isError?: boolean };
  if (!denied.isError) throw new Error("send ohne confirm hätte abgelehnt werden müssen");
  console.log("✓ send_letter ohne confirm abgelehnt");

  const sent = text((await client.callTool({ name: "send_letter", arguments: { letter_id: created.letter_id, confirm: true } })) as never);
  console.log("✓ send_letter:", sent.status, sent.carrier_ref);

  const status = text((await client.callTool({ name: "get_status", arguments: { letter_id: created.letter_id } })) as never);
  console.log("✓ get_status:", status.status, `(${status.carrier_status})`);

  const list = text((await client.callTool({ name: "list_letters", arguments: {} })) as never);
  console.log("✓ list_letters:", list.length, "Brief(e)");

  const est = text((await client.callTool({ name: "estimate_campaign", arguments: { quantity: 800, is_advertising: true, country: "DE" } })) as never);
  console.log("✓ estimate_campaign:", est.shipping_class, `${est.price_per_letter_eur_net} €/Brief`, `${est.total_eur_net} € gesamt`);

  await client.close();
  console.log("\nAlle Tests bestanden.");
} finally {
  srv.close();
}
