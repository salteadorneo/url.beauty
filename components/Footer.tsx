import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.6/tsx/brand-github.tsx";

export default function Footer() {
  return (
    <div class="bg-white flex flex-col md:flex-row items-center w-full max-w-screen-lg gap-8 md:gap-16 py-8 text-sm">
      <div class="flex items-baseline gap-4 flex-1">
        <a href="/" class="font-bold text-xl">url.<span class="text-pink-500">beauty</span></a>
        <div class="text-gray-500">Free. Fast. Foo.</div>
      </div>

      <div class="flex items-center gap-4">
        <a href="https://github.com/salteadorneo/url.beauty/blob/main/LICENSE"
          class="flex items-center gap-1 font-semibold hover:text-pink-500"
        >
          License
        </a>
        <a
          href="https://github.com/salteadorneo/url.beauty"
          class="flex items-center gap-1 font-semibold hover:text-pink-500"
        >
          <BrandGithub aria-hidden="true" />
          GitHub
        </a>
      </div>
    </div>
  );
}
