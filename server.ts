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

  // 1. Health check for infrastructure
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  if (process.env.NODE_ENV !== "production") {
    // 2. Development Setup
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Allow manual HTML serving
      root: process.cwd()
    });
    
    app.use(vite.middlewares);

    // Manual SPA Fallback for Dev
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // Skip if it looks like an asset or API call
      if (url.includes('.') || url.startsWith('/api')) {
        return next();
      }

      try {
        // Read index.html each time in dev to pick up changes
        const templatePath = path.resolve(process.cwd(), 'index.html');
        if (!fs.existsSync(templatePath)) return next();
        
        const template = fs.readFileSync(templatePath, 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // 3. Production Setup
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files from dist folder
    app.use(express.static(distPath, { 
      index: false,
      maxAge: '1d' 
    }));
    
    // Catch-all SPA fallback for production
    app.get('*', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found. Please run build script.');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CBT SERVER] Listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
  process.exit(1);
});
