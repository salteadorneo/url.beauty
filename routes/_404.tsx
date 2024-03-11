import { Head } from "$fresh/runtime.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <main class="relative max-w-screen-lg mx-auto px-4 text-zinc-800">
        <p>
          Error 404 - Page not found
        </p>
        <a href="/">Go back to home</a>
        <Footer />
      </main>
    </>
  );
}
