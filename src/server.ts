import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, () => {
  console.log(`Briefkonnektor MCP läuft auf http://localhost:${port}/mcp (Carrier: ${process.env.CARRIER ?? "mock"})`);
});
