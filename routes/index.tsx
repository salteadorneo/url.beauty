import { Handlers } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

export const handler: Handlers = {
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

export default function HomePage(req: Request) {
  return (
    <main class="relative max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
      <Footer />
    </main>
  );
}
