import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const SSR_ROUTE_PATTERN =
  /^(\/|\/pos|\/web-development|\/blog|\/blog\/[^/]+)(\?.*)?$/;

function isSSRRoute(urlPath: string): boolean {
  return SSR_ROUTE_PATTERN.test(urlPath);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    const urlPath = url.split("?")[0];

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);

      if (isSSRRoute(urlPath)) {
        try {
          const { render } = (await vite.ssrLoadModule(
            "/src/entry-server.tsx",
          )) as {
            render: (
              url: string,
            ) => { html: string; headHtml: string };
          };

          const { html: appHtml, headHtml } = render(urlPath);

          const finalPage = page
            .replace("<!--ssr-head-->", headHtml)
            .replace("<!--ssr-outlet-->", appHtml);

          res.status(200).set({ "Content-Type": "text/html" }).end(finalPage);
          return;
        } catch (ssrErr) {
          log(`[SSR] render failed for ${urlPath}, falling back to SPA`);
          console.error(ssrErr);
          // Fall through to SPA delivery below
        }
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { index: false }));

  const ssrBundlePath = path.resolve(
    import.meta.dirname,
    "..",
    "dist",
    "server",
    "entry-server.js",
  );

  if (!fs.existsSync(ssrBundlePath)) {
    log("[SSR] bundle not found at dist/server/entry-server.js — run 'node build-ssr.mjs' after the main build to enable SSR. Serving SPA shell for all routes.");
  }

  const indexHtmlPath = path.resolve(distPath, "index.html");

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    const urlPath = req.originalUrl.split("?")[0];

    if (isSSRRoute(urlPath) && fs.existsSync(ssrBundlePath)) {
      try {
        const template = await fs.promises.readFile(indexHtmlPath, "utf-8");
        const { render } = (await import(ssrBundlePath)) as {
          render: (url: string) => { html: string; headHtml: string };
        };
        const { html: appHtml, headHtml } = render(urlPath);
        const finalPage = template
          .replace("<!--ssr-head-->", headHtml)
          .replace("<!--ssr-outlet-->", appHtml);
        res.status(200).set({ "Content-Type": "text/html" }).end(finalPage);
        return;
      } catch (err) {
        log(`[SSR] production render failed for ${urlPath}, falling back`);
        console.error(err);
      }
    }

    res.sendFile(indexHtmlPath);
  });
}
