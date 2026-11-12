import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import llmsContent from "../public/llms.txt?raw";
import appCssInline from "./styles.css?inline";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const accept = request.headers.get("accept") ?? "";

    // Content negotiation for AI agents & LLM crawlers (e.g. ChatGPT, Claude, Gemini, is-agentic)
    if (url.pathname === "/llms.txt" || (url.pathname === "/" && accept.includes("text/markdown"))) {
      return new Response(llmsContent, {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "vary": "Accept",
          "cache-control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      // Markdown 404 fallback for agents requesting text/markdown
      if (response.status >= 400 && accept.includes("text/markdown")) {
        return new Response(
          `# 404 Not Found\n\nThe requested page does not exist on Scale Flow.\n\n- [Home](https://www.joinscaleflow.in/)\n- [Our Work](https://www.joinscaleflow.in/work)\n- [Build Your Website](https://www.joinscaleflow.in/build-your-website)\n- [Contact Us](https://www.joinscaleflow.in/contact)\n- [LLMs Overview](https://www.joinscaleflow.in/llms.txt)\n- [Sitemap](https://www.joinscaleflow.in/sitemap.xml)\n`,
          {
            status: 404,
            headers: {
              "content-type": "text/markdown; charset=utf-8",
              "vary": "Accept",
            },
          },
        );
      }

      let finalResponse = await normalizeCatastrophicSsrResponse(response);
      const contentType = finalResponse.headers.get("content-type") ?? "";
      if (contentType.includes("text/html") && finalResponse.status === 200) {
        const html = await finalResponse.text();
        const heroPreload =
          url.pathname === "/"
            ? `<link rel="preload" as="image" type="image/webp" href="/__l5e/assets-v1/0c91e1ac-5a8b-4651-b576-d6e7c7364a1d/sf-bmw-d2-sm.webp" imagesrcset="/__l5e/assets-v1/0c91e1ac-5a8b-4651-b576-d6e7c7364a1d/sf-bmw-d2-sm.webp 640w, /__l5e/assets-v1/0c91e1ac-5a8b-4651-b576-d6e7c7364a1d/sf-bmw-d2.webp 1280w" imagesizes="(max-width: 768px) 340px, 560px" fetchpriority="high"/>`
            : "";
        const fontPreloads = `<link rel="preload" href="/fonts/manrope-latin-400.woff2" as="font" type="font/woff2" crossorigin="anonymous"/><link rel="preload" href="/fonts/space-grotesk-latin-500.woff2" as="font" type="font/woff2" crossorigin="anonymous"/>`;
        const inlinedHtml = html
          .replace(
            /<link rel="stylesheet" href="\/assets\/styles-[^"]+\.css"[^>]*\/?>/,
            () => `${heroPreload}${fontPreloads}<style id="sf-inline-css" data-precedence="default">${appCssInline}</style>`,
          )
          .replace(/<link rel="modulepreload" href="\/assets\/[^"]+"[^>]*\/?>/g, "")
          .replace(
            /<script type="module" async="" src="(\/assets\/index-[^"]+\.js)"><\/script>/,
            '<script type="module">requestAnimationFrame(()=>setTimeout(()=>{import("$1")},80))</script>',
          );
        const htmlHeaders = new Headers(finalResponse.headers);
        htmlHeaders.delete("content-length");
        finalResponse = new Response(inlinedHtml, {
          status: finalResponse.status,
          statusText: finalResponse.statusText,
          headers: htmlHeaders,
        });
      }

      const acceptEncoding = request.headers.get("accept-encoding") ?? "";
      if (
        finalResponse.body &&
        !finalResponse.headers.get("content-encoding") &&
        acceptEncoding.includes("gzip") &&
        (contentType.includes("text/html") || contentType.includes("application/json") || contentType.includes("text/markdown")) &&
        typeof CompressionStream !== "undefined"
      ) {
        const headers = new Headers(finalResponse.headers);
        headers.set("content-encoding", "gzip");
        headers.set("vary", "Accept, Accept-Encoding");
        headers.delete("content-length");
        return new Response(finalResponse.body.pipeThrough(new CompressionStream("gzip")), {
          status: finalResponse.status,
          statusText: finalResponse.statusText,
          headers,
        });
      }
      return finalResponse;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
