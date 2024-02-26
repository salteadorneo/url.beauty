import { defineConfig } from "$fresh/server.ts";
import { kvOAuthPlugin } from "kv_oauth/fresh.ts";
import { oauth2Client } from "./utils/kv_oauth.ts";
import tailwind from "$fresh/plugins/tailwind.ts";

export default defineConfig({
  plugins: [
    kvOAuthPlugin(oauth2Client),
    tailwind(),
  ],
});
