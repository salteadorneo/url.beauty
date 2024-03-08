import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        custom: "repeat(auto-fill, minmax(320px, 1fr))",
      },
    },
  },
} satisfies Config;
