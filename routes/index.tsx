import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Link from "../components/Link.tsx";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async GET(_, ctx) {
    const links = [];

    const entries = kv.list({ prefix: ["links"] });
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
        <Link
          hash={"bnZIJ"}
          path={"https://url.beauty/bnZIJ"}
          count={2323}
        />
      </section>
      <section class="hidden max-w-xl mx-auto">
        <p class="text-lg font-medium mb-4">
          Last 5 shortened links
        </p>
        <ul class="flex flex-col gap-2">
          {links
            ?.filter((link: { value: { path: string } }) =>
              link.value.path.startsWith("http")
            )
            ?.map((
              link: { key: string[]; value: { path: string; count: number } },
            ) => (
              <li key={link.key}>
                <Link
                  hash={link.key[1]}
                  path={link.value.path}
                  count={link.value.count}
                />
              </li>
            ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
