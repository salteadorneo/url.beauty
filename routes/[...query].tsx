import { Handlers, PageProps } from "$fresh/server.ts";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";
import { getIPLocation } from "https://deno.land/x/ip_location@v1.0.0/mod.ts";

import Footer from "../components/Footer.tsx";
import { ValueProps } from "../types.ts";
import { hashStr, idToShortURL } from "../utils.ts";
import Link from "../components/Link.tsx";
import ChartClient from "../islands/ChartClient.tsx";

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
        <Link hash={hash} qr={qr} path={path} count={count} />
      </section>
      <section id="stats" class="flex flex-col gap-2 max-w-xl mx-auto mt-2">
        <div class="grid p-4 border rounded">
          <p class="font-bold">Last 7 days</p>
          {data.length > 0
            ? (
              <ChartClient
                type="bar"
                labels={labels}
                data={data}
              />
            )
            : <p class="w-full text-center text-xs opacity-80">No data</p>}
        </div>
        <div class="grid p-4 border rounded">
          <p class="font-bold">Referrers</p>
          {Object.values(referrers).length > 0
            ? (
              <ChartClient
                type="pie"
                labels={Object.keys(referrers)}
                data={Object.values(referrers).map((count) => ({ count }))}
              />
            )
            : <p class="w-full text-center text-xs opacity-80">No data</p>}
        </div>
        <div class="grid p-4 border rounded">
          <p class="font-bold">Countries</p>
          {Object.values(countries).length > 0
            ? (
              <ChartClient
                type="pie"
                labels={Object.keys(countries)}
                data={Object.values(countries).map((count) => ({ count }))}
              />
            )
            : <p class="w-full text-center text-xs opacity-80">No data</p>}
        </div>
      </section>
      <Footer />
    </main>
  );
}
