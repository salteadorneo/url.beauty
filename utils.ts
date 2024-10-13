export async function hashStr(message: string) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// deno-lint-ignore no-explicit-any
export function idToShortURL(value: any) {
  const map = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const shorturl = [];
  while (value) {
    shorturl.push(map[value % 62]);
    value = Math.floor(value / 62);
  }
  shorturl.reverse();
  return shorturl.join("").slice(0, 5);
}

export function parseUrl(url: string) {
  if (!url.startsWith("http://") && url.startsWith("http:/")) {
    return url.replace("http:/", "http://");
  }
  if (!url.startsWith("https://") && url.startsWith("https:/")) {
    return url.replace("https:/", "https://");
  }
  return url;
}
