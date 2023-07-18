import { ConnInfo, serve } from "https://deno.land/std@0.142.0/http/server.ts";

serve(async (_req: Request, connInfo: ConnInfo): Promise<Response> => {
  const { pathname } = new URL(_req.url);
  const query = pathname.substring(1);

  const kv = await Deno.openKv();

  if (query === "all") {
    const entries = kv.list({ prefix: ["links"] });

    const result = [];
    for await (const entry of entries) {
      result.push(entry);
    }

    return new Response(JSON.stringify(result), { status: 200 });
  }

  if (query.startsWith("http")) {
    const hash = await hashStr(query);

    let res = await kv.get(["links", hash]);
    if (!res || !res.value) {
      await kv.set(["links", hash], { path: query, count: 0, requests: [] });
      res = await kv.get(["links", hash]);
    }

    return new Response(JSON.stringify(res), { status: 200 });
  } else {
    const { value } = await kv.get(["links", query]);

    if (!value) {
      return Response.redirect("https://web.url.beauty", 307);
    }

    const { path, count = 0, requests = [] } = value;

    requests.push({
      ip: connInfo.remoteAddr?.hostname,
      userAgent: _req.headers.get("user-agent"),
      time: new Date().toUTCString(),
    });

    kv.set(["links", query], { path, count: count + 1, requests });

    return Response.redirect(path, 307);
  }
});

async function hashStr(message: string) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
