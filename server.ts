import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  const app = express();
  const port = 3000;
  const isProd = process.env.NODE_ENV === "production";

  console.log(`[CBT LOG] Initializing server in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);
  console.log(`[CBT LOG] Current Working Directory: ${process.cwd()}`);
  console.log(`[CBT LOG] __dirname: ${__dirname}`);

  // Health check - place this FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV, timestamp: new Date().toISOString() });
  });

  let vite: any;
  if (!isProd) {
    console.log("[CBT LOG] Creating Vite server in middleware mode...");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[CBT LOG] Vite middlewares attached.");
  } else {
    const distPath = path.resolve(__dirname, "dist");
    console.log(`[CBT LOG] Serving static files from: ${distPath}`);
    if (!fs.existsSync(distPath)) {
      console.error(`[CBT ERROR] Dist folder NOT FOUND at ${distPath}`);
    }
    app.use(express.static(distPath, { index: false }));
  }

  // Global Fallback for SPA - Catch everything else
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;
    console.log(`[CBT LOG] Request received: ${url}`);

    // Skip assets (anything with a dot that isn't a known route) 
    // and API calls
    if (url.startsWith("/api") || (url.includes(".") && !url.includes("index.html") && !url.includes("login"))) {
      console.log(`[CBT LOG] Skipping fallback for asset-like URL: ${url}`);
      return next();
    }

    try {
      let template: string;
      const devIndexPath = path.resolve(__dirname, "index.html");
      const prodIndexPath = path.resolve(__dirname, "dist", "index.html");

      if (!isProd && vite) {
        console.log(`[CBT LOG] Attempting Dev fallback for: ${url}`);
        if (fs.existsSync(devIndexPath)) {
          template = fs.readFileSync(devIndexPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
        } else if (fs.existsSync(prodIndexPath)) {
          console.warn("[CBT LOG] Dev index missing, falling back to Prod index");
          template = fs.readFileSync(prodIndexPath, "utf-8");
        } else {
          throw new Error("No index.html found in root or dist");
        }
      } else {
        console.log(`[CBT LOG] Attempting Prod fallback for: ${url}`);
        if (fs.existsSync(prodIndexPath)) {
          template = fs.readFileSync(prodIndexPath, "utf-8");
        } else if (fs.existsSync(devIndexPath)) {
          console.warn("[CBT LOG] Prod index missing, falling back to Dev index");
          template = fs.readFileSync(devIndexPath, "utf-8");
        } else {
          throw new Error("No index.html found in root or dist");
        }
      }
      
      res.status(200).set({ "Content-Type": "text/html" }).send(template);
    } catch (e) {
      console.error(`[CBT ERROR] SPA Fallback total failure for ${url}:`, e);
      res.status(500).send(`Server Routing Error: ${(e as Error).message}. Mode: ${process.env.NODE_ENV}`);
    }
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`[CBT] OK: Server listening on 0.0.0.0:${port}`);
  });
}

bootstrap().catch(err => {
  console.error("[CBT] Fatal startup error:", err);
  process.exit(1);
});
