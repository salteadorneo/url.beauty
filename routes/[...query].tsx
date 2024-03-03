import { Handlers, PageProps } from "$fresh/server.ts";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";
import { Chart } from "$fresh_charts/mod.ts";

import { hashStr, idToShortURL } from "../utils.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import CopyToClipboard from "../islands/CopyToClipboard.tsx";

type Request = {
  ip: string;
  time: Date;
  userAgent: string;
  referer: string;
};

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

      const base64Image = await qrcode(`${ORIGIN}/${id}`, { size: 128 });
      res.qr = base64Image;

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
  const { key, value, qr } = props.data;
  const [, hash] = key;
  const { path, count = 0, requests = [] }: {
    path: string;
    count: number;
    requests: Request[];
  } = value;

  // get labels last 30 days
  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  // get count of requests for each label
  const data = labels.map((label) => {
    const date = new Date(label);
    const count = requests.filter((req) => {
      const reqDate = new Date(req.time);
      return (
        reqDate.getFullYear() === date.getFullYear() &&
        reqDate.getMonth() === date.getMonth() &&
        reqDate.getDate() === date.getDate()
      );
    }).length;
    return { label, count };
  });

  return (
    <main class="max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <section class="flex items-center justify-between gap-2 p-4 border border-zinc-200 rounded bg-zinc-100">
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <a href={`${ORIGIN}/${hash}`} target="_blank" class="font-semibold">
              {`url.beauty/${hash}`}
            </a>
            <CopyToClipboard value={`${ORIGIN}/${hash}`} />
          </div>
          <p class="text-sm">
            <a href={path} target="_blank">{path}</a>
          </p>
        </div>

        <img src={qr} alt="QR code" class="border-2 border-zinc-200 rounded" />

        <a
          href={`${ORIGIN}/${path}`}
          class="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 rounded-full py-0.5 px-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="w-4 h-4"
          >
            <path d="M12 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1ZM6.5 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6ZM2 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" />
          </svg>
          {count} clicks
        </a>
      </section>
      <section class="flex items-center gap-2 p-4 border rounded mt-6">
        <Chart
          type="bar"
          width={950}
          data={{
            labels,
            datasets: [
              {
                label: "Clicks",
                data: data.map((d) => d.count),
              },
            ],
          }}
        />
      </section>
      <Footer />
    </main>
  );
}
