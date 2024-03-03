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
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
