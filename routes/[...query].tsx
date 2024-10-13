import { Handlers, PageProps } from "$fresh/server.ts";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";
import { Chart } from "$fresh_charts/mod.ts";
import { getIPLocation } from "https://deno.land/x/ip_location@v1.0.0/mod.ts";

import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import CopyToClipboard from "../islands/CopyToClipboard.tsx";
import DownloadQr from "../components/DownloadQr.tsx";
import { ValueProps } from "../types.ts";
import { hashStr, idToShortURL, parseUrl } from "../utils.ts";

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:8000";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async GET(req, ctx) {
    const { query } = ctx.params;

    let parseQuery = query;
    if (
      query.startsWith("http") && query.length !== 5 &&
      query.match(/%3A%2F/g)
    ) {
      parseQuery = decodeURIComponent(query);
    }

    if (
      parseQuery.startsWith("http") && parseQuery.length !== 5 &&
      parseQuery.match(/:/g)
    ) {
      const hash = await hashStr(parseQuery);
      const onlyNums = hash.replace(/\D/g, "");
      const id = idToShortURL(onlyNums);

      let res = await kv.get(["links", id]);

      if (!res || !res.value) {
        await kv.set(["links", id], {
          path: parseQuery,
          count: 0,
          requests: [],
        });
        res = await kv.get(["links", id]);
      }

      const base64Image = await qrcode(`${ORIGIN}/${id}`, { size: 128 });
      res.qr = base64Image;

      return await ctx.render(res);
    }

    const { value } = await kv.get(["links", parseQuery]);

    if (!value) {
      return ctx.renderNotFound();
    }

    const { path, count = 0, requests = [] }: ValueProps = value;

    const location = await getIPLocation(ctx.remoteAddr?.hostname);
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    requests.push({
      ip: ctx.remoteAddr?.hostname,
      city: location?.city ?? "Unknown",
      country: location?.country ?? "Unknown",
      country_name: location?.country_name ?? "Unknown",
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      userAgent,
      referer,
      time: new Date(),
    });

    kv.set(["links", parseQuery], { path, count: count + 1, requests });

    if (!path.startsWith("http")) {
      return Response.redirect(`https://${path}`, 307);
    }

    return Response.redirect(path, 307);
  },
  async POST(req) {
    const form = await req.formData();
    const query = form.get("query")?.toString();

    if (!query) {
      return new Response(null, {
        status: 400,
        statusText: "Bad Request",
      });
    }

    const headers = new Headers();
    headers.set("location", `/${encodeURIComponent(query)}`);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function Page(props: PageProps) {
  const { key, value, qr } = props.data;
  const [, hash] = key;
  const { path, count = 0, requests = [] }: ValueProps = value;

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

  // get referrers grouped by domain
  const referrers = requests.reduce((acc, req) => {
    if (!req.referer) return acc;
    const domain = new URL(req.referer).hostname;
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // get country name and count of requests
  const countries = requests.reduce((acc, req) => {
    if (!req.country_name) return acc;
    acc[req.country_name] = (acc[req.country_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main class="relative max-w-screen-lg mx-auto px-4 text-zinc-800">
      <div
        aria-hidden="true"
        class="absolute inset-0 -z-10 grid grid-cols-2 -space-x-52 opacity-60"
      >
        <div class="blur-[106px] h-56">
        </div>
        <div class="blur-[106px] h-32 bg-gradient-to-r from-pink-100 to-pink-200 dark:to-pink-300">
        </div>
      </div>
      <section class="relative space-y-4 py-16 text-center">
        <h1 class="font-bold leading-[4rem] text-7xl text-balance max-w-xl mx-auto">
          Oh! A very{" "}
          <span class="bg-clip-text text-transparent bg-gradient-to-b from-pink-700 to-pink-500">
            beauty
          </span>{" "}
          link
        </h1>
      </section>
      <section class="max-w-xl mx-auto">
        <section class="flex items-center justify-between py-3 px-4 border border-zinc-200 rounded bg-zinc-100">
          <div class="flex flex-col max-sm:items-center">
            <div class="flex items-center gap-1">
              <a href={`${ORIGIN}/${hash}`} target="_blank" class="font-semibold">
                {`url.beauty/${hash}`}
              </a>
              <CopyToClipboard value={`${ORIGIN}/${hash}`} />
              <DownloadQr href={qr} />
            </div>
            <p class="flex items-center gap-1 text-sm font-medium text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-corner-down-right"
              >
                <polyline points="15 10 20 15 15 20" />
                <path d="M4 4v7a4 4 0 0 0 4 4h12" />
              </svg>
              <a href={path} target="_blank">{parseUrl(path)}</a>
            </p>
          </div>
          <a
            href={`${ORIGIN}/${path}`}
            class="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 rounded-full py-0.5 px-2 text-sm"
          >
            {count} clicks
          </a>
          <img
            src={qr}
            alt="QR code"
            class="hidden border-2 border-zinc-200 rounded"
          />
        </section>
      </section>
      <section id="stats" class="flex flex-col gap-2 max-w-xl mx-auto mt-2">
        <div class="grid p-4 border rounded">
          <p class="font-bold">Last 7 days</p>
          {data.length > 0
            ? (
                <Chart
                  type="bar"
                  width={550}
                  height={300}
                  data={{
                    labels,
                    datasets: [
                      {
                        label: "",
                        data: data.map((d) => d.count),
                        backgroundColor: "#EC4899",
                      },
                    ],
                  }}
                />
            )
            : <p class="w-full text-center text-xs opacity-80">No data</p>}
        </div>
        <div class="grid p-4 border rounded">
          <p class="font-bold">Referrers</p>
          {Object.values(referrers).length > 0
            ? (
              <Chart
                type="pie"
                width={550}
                height={290}
                data={{
                  labels: Object.keys(referrers),
                  datasets: [
                    {
                      label: "",
                      data: Object.values(referrers),
                      backgroundColor: "#EC4899",
                    },
                  ],
                }}
              />
            )
            : <p class="w-full text-center text-xs opacity-80">No data</p>}
        </div>
        <div class="grid p-4 border rounded">
          <p class="font-bold">Countries</p>
          {Object.values(countries).length > 0
            ? (
              <Chart
                type="pie"
                width={550}
                height={290}
                data={{
                  labels: Object.keys(countries),
                  datasets: [
                    {
                      label: "",
                      data: Object.values(countries),
                      backgroundColor: "#EC4899",
                    },
                  ],
                }}
              />
            )
            : <p class="w-full text-center text-xs opacity-80">No data</p>}
        </div>
      </section>
      <Footer />
    </main>
  );
}
