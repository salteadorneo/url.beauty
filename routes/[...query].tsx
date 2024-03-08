import { Handlers, PageProps } from "$fresh/server.ts";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";
import { Chart } from "$fresh_charts/mod.ts";
import { getIPLocation } from "https://deno.land/x/ip_location/mod.ts";

import { hashStr, idToShortURL } from "../utils.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import CopyToClipboard from "../islands/CopyToClipboard.tsx";

type Request = {
  ip: string;
  city: string;
  country: string;
  country_name: string;
  latitude: number;
  longitude: number;
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

    const location = await getIPLocation();
    const userAgent = _req.headers.get("user-agent") || "";
    const referer = _req.headers.get("referer") || "";

    requests.push({
      ip: location?.ip ?? ctx.remoteAddr?.hostname,
      city: location?.city ?? "",
      country: location?.country ?? "",
      country_name: location?.country_name ?? "",
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
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
    <main class="max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <section class="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-2 p-4 border border-zinc-200 rounded bg-zinc-100">
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

        <img
          src={qr}
          alt="QR code"
          class="border-2 border-zinc-200 rounded"
        />

        <section class="flex items-center gap-2">
          <a
            href={qr}
            class="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 rounded-full py-0.5 px-2 text-sm"
            download="qr.gif"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            Download QR
          </a>
          <a
            href={`${ORIGIN}/${path}#stats`}
            class="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 rounded-full py-0.5 px-2 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path d="M12 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1ZM6.5 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6ZM2 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" />
            </svg>
            Stats
          </a>
        </section>
      </section>
      <section
        id="stats"
        class="flex flex-wrap justify-between gap-2 p-4 border rounded mt-6"
      >
        <div class="grid">
          <p>
            <strong>Clicks</strong> over the last 7 days
          </p>
          <Chart
            type="bar"
            width={300}
            height={300}
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
        </div>
        <div class="grid">
          <p>
            <strong>Referrers</strong>
          </p>
          <Chart
            type="pie"
            width={260}
            height={260}
            data={{
              labels: Object.keys(referrers),
              datasets: [
                {
                  label: "Referrers",
                  data: Object.values(referrers),
                },
              ],
            }}
          />
        </div>
        <div class="grid">
          <p>
            <strong>Countries</strong>
          </p>
          <Chart
            type="pie"
            width={260}
            height={260}
            data={{
              labels: Object.keys(countries),
              datasets: [
                {
                  label: "Countries",
                  data: Object.values(countries),
                },
              ],
            }}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
