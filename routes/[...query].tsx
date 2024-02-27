import { Handlers, PageProps } from "$fresh/server.ts";
import { hashStr, idToShortURL } from "../utils.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import CopyToClipboard from "../islands/CopyToClipboard.tsx";

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:8000";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { query } = ctx.params;

    if (query.startsWith("http") || query.length !== 5 || query.match(/\./g)) {
      const hash = await hashStr(query);
      const onlyNums = hash.replace(/\D/g, "");
      const id = idToShortURL(onlyNums);

      let res = await kv.get(["links", id]);

      if (!res || !res.value) {
        await kv.set(["links", id], { path: query, count: 0, requests: [] });
        res = await kv.get(["links", id]);
      }
      return await ctx.render(res);
    }

    const { value } = await kv.get(["links", query]);

    if (!value) {
      return ctx.render({ status: 404 });
    }

    const { path, count = 0, requests = [] } = value;

    const userAgent = _req.headers.get("user-agent") || "";
    const referer = _req.headers.get("referer") || "";

    requests.push({
      ip: ctx.remoteAddr?.hostname,
      userAgent,
      referer,
      time: new Date().toUTCString(),
    });

    kv.set(["links", query], { path, count: count + 1, requests });

    if (!path.startsWith("http")) {
      return Response.redirect(`https://${path}`, 307);
    }

    return Response.redirect(path, 307);
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const query = form.get("query")?.toString();

    const headers = new Headers();
    headers.set("location", `/${query}`);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function Page(props: PageProps) {
  const { key } = props.data;
  const [, hash] = key;

  return (
    <main class="max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <p class="flex items-center gap-2 p-4 border rounded bg-zinc-100">
        <a href={`${ORIGIN}/${hash}`} class="font-semibold">
          {`${ORIGIN}/${hash}`}
        </a>
        <CopyToClipboard value={`${ORIGIN}/${hash}`} />
      </p>
      <Footer />
    </main>
  );
}
