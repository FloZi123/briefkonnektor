import express, { type Request, type Response, type NextFunction } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcp.js";
import { getCarrier } from "./carriers/index.js";
import { PingenCarrier } from "./carriers/pingen.js";
import { store } from "./store.js";

/**
 * Express-App mit Streamable-HTTP-Endpunkt /mcp (stateless: pro Request ein Server).
 * Auth: Bearer-Token je Kunde aus API_KEYS ("token:kunde,token2:kunde2").
 * OAuth 2.1 + Dynamic Client Registration (für den Claude-Connector-Dialog)
 * kommt als nächster Schritt davor – diese App bleibt dann unverändert.
 */
export function createApp() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  const keys = new Map<string, string>();
  for (const pair of (process.env.API_KEYS ?? "").split(",")) {
    const [token, customer] = pair.split(":").map((s) => s.trim());
    if (token && customer) keys.set(token, customer);
  }

  app.get("/health", (_req, res) => {
    res.json({ ok: true, carrier: process.env.CARRIER ?? "mock", customers: keys.size });
  });

  // Pingen-Webhook: Signatur prüfen, betroffenen Brief per API neu abfragen (Payload-Form nicht hart verdrahtet)
  app.post("/webhooks/pingen", express.text({ type: "*/*", limit: "1mb" }), async (req, res) => {
    const carrier = getCarrier();
    if (!(carrier instanceof PingenCarrier)) {
      res.status(404).json({ error: "pingen carrier not active" });
      return;
    }
    const raw = typeof req.body === "string" ? req.body : "";
    if (!carrier.verifyWebhook(raw, req.header("signature"))) {
      res.status(401).json({ error: "bad signature" });
      return;
    }
    res.status(202).end(); // schnell quittieren, dann verarbeiten
    try {
      const payload = JSON.parse(raw) as { data?: { relationships?: { letter?: { data?: { id?: string } } }; id?: string } };
      const letterRef = payload.data?.relationships?.letter?.data?.id ?? payload.data?.id;
      if (!letterRef) return;
      const letter = await store.findByCarrierRef(letterRef);
      if (!letter) return;
      const s = await carrier.status(letterRef);
      letter.status = s.status;
      letter.carrierStatus = s.carrierStatus;
      await store.update(letter);
    } catch (e) {
      console.error("webhook processing failed", e);
    }
  });

  const auth = (req: Request, res: Response, next: NextFunction) => {
    const h = req.header("authorization") ?? "";
    const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
    const customer = keys.get(token);
    if (!customer) {
      res.set("WWW-Authenticate", 'Bearer realm="briefkonnektor"');
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    (req as Request & { customer: string }).customer = customer;
    next();
  };

  app.post("/mcp", auth, async (req, res) => {
    const customer = (req as Request & { customer: string }).customer;
    const server = createMcpServer({ customer });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (e) {
      console.error("MCP error", e);
      if (!res.headersSent) res.status(500).json({ error: "internal" });
    }
  });

  // Stateless: keine Sessions → GET/DELETE nicht nötig
  app.get("/mcp", auth, (_req, res) => res.status(405).json({ error: "method not allowed" }));
  app.delete("/mcp", auth, (_req, res) => res.status(405).json({ error: "method not allowed" }));

  return app;
}
