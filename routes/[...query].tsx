import { Handlers, PageProps } from "$fresh/server.ts";
import { hashStr, idToShortURL } from "../utils.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";

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

  const copyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = `${ORIGIN}${hash}`;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  return (
    <main class="max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <p>
        Your shortened URL is:{" "}
        <a href={`${ORIGIN}/${hash}`}>{`${ORIGIN}/${hash}`}</a>
      </p>
      {
        /* <p>
        Your access token: {accessToken !== null
          ? (
            <span style="filter:blur(3px)">
              ${accessToken + " (intentionally blurred for security)"}
            </span>
          )
          : null}
      </p>
      <p>
        <a href="/oauth/signin">Sign in</a>
      </p>
      <p>
        <a href="/oauth/signout">Sign out</a>
      </p> */
      }
      <Footer />
    </main>
  );
}
