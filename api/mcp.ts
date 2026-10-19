// Vercel Serverless Function – /mcp und /health werden per vercel.json hierher geroutet.
import { createApp } from "../src/app.js";

const app = createApp();
export default app;
