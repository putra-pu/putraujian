import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  const app = express();
  // Always bind to port 3000 as per AI Studio requirements
  const port = 3000;
  const isProd = process.env.NODE_ENV === "production";

  console.log(`[CBT SERVER] Starting... Mode: ${isProd ? "PRODUCTION" : "DEVELOPMENT"}`);

  // 1. Health check (Crucial for Cloud Run)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV 
    });
  });

  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    // Serve static files from dist
    app.use(express.static(distPath, { 
      index: false,
      maxAge: '1h'
    }));
  }

  // 2. SPA Fallback - Catch-all handler
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Ignore asset-like requests (containing dots) that weren't caught by static middleware
    if (url.includes(".") && !url.includes("index.html") && !url.includes("login")) {
      return next();
    }

    try {
      let template: string;
      const devIndexPath = path.resolve(__dirname, "index.html");
      const prodIndexPath = path.resolve(__dirname, "dist", "index.html");

      if (!isProd && vite) {
        // Dev mode: Transform index.html through Vite
        if (fs.existsSync(devIndexPath)) {
          template = fs.readFileSync(devIndexPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
        } else {
          return res.status(404).send("Dev index.html not found");
        }
      } else {
        // Prod mode: Serve built index.html
        if (fs.existsSync(prodIndexPath)) {
          template = fs.readFileSync(prodIndexPath, "utf-8");
        } else if (fs.existsSync(devIndexPath)) {
          // Fallback to dev index if prod index is missing
          template = fs.readFileSync(devIndexPath, "utf-8");
        } else {
          return res.status(404).send("Application index.html not found. Please run 'npm run build'.");
        }
      }

      res.status(200).set({ "Content-Type": "text/html" }).send(template);
    } catch (e) {
      console.error(`[CBT SERVER] Fallback Error for ${url}:`, e);
      if (!isProd && vite) vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // 3. Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[CBT SERVER] Global Error:", err);
    res.status(500).send("Internal Server Error (CBT System)");
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`[CBT SERVER] Running on http://0.0.0.0:${port}`);
  });
}

bootstrap().catch(err => {
  console.error("[CBT SERVER] Critical Startup Failure:", err);
  process.exit(1);
});
