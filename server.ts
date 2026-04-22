import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === "production";

  console.log(`[CBT] Starting server in ${isProd ? 'production' : 'development'} mode...`);

  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
  }

  // SPA Fallback logic for both Dev and Prod
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip fallback for API or direct asset calls
    if (url.startsWith('/api') || url.includes('.')) {
      return next();
    }

    try {
      let template: string;
      if (!isProd) {
        const indexPath = path.resolve(__dirname, "index.html");
        template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
      } else {
        const indexPath = path.resolve(__dirname, "dist", "index.html");
        template = fs.readFileSync(indexPath, "utf-8");
      }
      
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      if (!isProd) vite.ssrFixStacktrace(e as Error);
      console.error(`[CBT ERROR] Fallback failed for ${url}:`, e);
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CBT] Server successfully listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[CBT FATAL] Server failed to start:", err);
  process.exit(1);
});
