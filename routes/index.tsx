import { Handlers } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

export const handler: Handlers = {
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

export default function Page() {
  return (
    <main class="relative max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <Footer />
    </main>
  );
}
