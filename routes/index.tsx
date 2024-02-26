import { Handlers } from "$fresh/server.ts";
import { getSessionAccessToken, getSessionId } from "kv_oauth/mod.ts";
import { oauth2Client } from "../utils/kv_oauth.ts";
import Header from "../components/Header.tsx";
import { signal } from "@preact/signals";
import Footer from "../components/Footer.tsx";

const user = signal(null);

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

export default async function HomePage(req: Request) {
  const sessionId = await getSessionId(req);
  const isSignedIn = sessionId !== undefined;
  const accessToken = isSignedIn
    ? await getSessionAccessToken(oauth2Client, sessionId)
    : null;

  if (accessToken !== null) {
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    user.value = await userResponse.json();
  }

  return (
    <main class="relative max-w-screen-lg mx-auto px-4 text-zinc-800">
      <Header />
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
