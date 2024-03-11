import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.6/tsx/brand-github.tsx";

export default function Footer() {
  const menus = [
    {
      title: "Community",
      children: [
        {
          name: "GitHub",
          href: "https://github.com/salteadorneo/url.beauty",
        },
        {
          name: "License",
          href: "https://github.com/salteadorneo/url.beauty/blob/main/LICENSE",
        },
      ],
    },
  ];

  return (
    <div class="bg-white flex flex-col md:flex-row w-full max-w-screen-lg gap-8 md:gap-16 py-8 text-sm">
      <div class="flex-1">
        <div class="flex items-center gap-1">
          <a href="/" class="font-bold text-xl">
            URL Beauty
          </a>
        </div>
        <div class="text-gray-500">
          Free. Fast. Foo.
        </div>
      </div>

      {menus.map((item) => (
        <div class="mb-4" key={item.title}>
          <div class="font-bold">{item.title}</div>
          <ul class="mt-2">
            {item.children.map((child) => (
              <li class="mt-2" key={child.name}>
                <a
                  class="text-gray-500 hover:text-gray-700"
                  href={child.href}
                >
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div class="">
        <a
          href="https://github.com/salteadorneo/url.beauty"
          class="inline-block hover:text-pink-500"
          aria-label="GitHub"
        >
          <BrandGithub aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
