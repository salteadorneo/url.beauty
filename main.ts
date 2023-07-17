import { serve } from "https://deno.land/std@0.142.0/http/server.ts";

serve(async (_req: Request) => {
    if (!_req.url.endsWith("favicon.ico")){

        const { pathname } = new URL(_req.url)
        const query = pathname.substring(1)

        const kv = await Deno.openKv();

        if (query.startsWith("http")) {
            const hash = await hashStr(query)

            kv.set(["links", hash], { path: query });
            const res = await kv.get(["links", hash]);

            return new Response(JSON.stringify(res), { status: 200 });
        } else {
            const { value } = await kv.get(["links", query]);

            if (!value) {
                return new Response("Not found", { status: 404 });
            }

            const count = (value.count || 0) + 1;

            kv.set(["links", query], { path: query, count });

            const { path } = value;
            return Response.redirect(path, 307);
        }
    }
});

async function hashStr(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}