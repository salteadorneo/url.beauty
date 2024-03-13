import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          URL Beauty | Make beauty any link | URL shortener
        </title>
        <meta
          name="description"
          content="A free URL shortener fast and easy to use. Beautify your links with URL Beauty."
        />
        <link rel="icon" href="/favicon.svg" />

        <meta property="og:url" content="https://url.beauty/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="URL Beauty | Make beauty any link | URL shortener"
        />
        <meta
          property="og:description"
          content="A free URL shortener fast and easy to use. Beautify your links with URL Beauty."
        />
        <meta property="og:image" content="https://url.beauty/og.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="url.beauty" />
        <meta property="twitter:url" content="https://url.beauty/" />
        <meta
          name="twitter:title"
          content="URL Beauty | Make beauty any link | URL shortener"
        />
        <meta
          name="twitter:description"
          content="A free URL shortener fast and easy to use. Beautify your links with URL Beauty."
        />
        <meta name="twitter:image" content="https://url.beauty/og.png" />

        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
