import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import CopyToClipboard from "../islands/CopyToClipboard.tsx";
import { parseUrl } from "../utils.ts";

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:8000";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async GET(_, ctx) {
    const links = [];

    const entries = kv.list({ prefix: ["links"] }, { limit: 5 }, { reverse: true });
    for await (const entry of entries) {
      links.push(entry);
    }

    return await ctx.render({ links });
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
  const { links } = props.data;

  return (
    <main class="relative max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <section class="hidden max-w-xl mx-auto">
        <p class="text-lg font-medium mb-4">
          Last 5 shortened links
        </p>
        <ul class="flex flex-col gap-2">
          {links
            ?.filter((link: { value: { path: string } }) =>
              link.value.path.startsWith("http")
            )
            ?.map((link: { key: string[]; value: { path: string } }) => (
              <li
                key={link.key}
                class="flex items-center justify-between py-3 px-4 border border-zinc-200 rounded bg-zinc-100"
              >
                <div class="flex flex-col max-sm:items-center">
                  <div class="flex items-center gap-1">
                    <a
                      href={`${ORIGIN}/${link.key[1]}`}
                      target="_blank"
                      class="font-semibold"
                    >
                      {`url.beauty/${link.key[1]}`}
                    </a>
                    <CopyToClipboard value={`${ORIGIN}/${link.key[1]}`} />
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
                    <a href={link.value.path} target="_blank" class="max-w-md truncate">{parseUrl(link.value.path)}</a>
                  </p>
                </div>
                <a
                  href={`${ORIGIN}/${link.value.path}`}
                  class="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 rounded-full py-0.5 px-2 text-sm"
                >
                  {link.value.count} clicks
                </a>
              </li>
            ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
