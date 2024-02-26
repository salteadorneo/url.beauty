export async function hashStr(message: string) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export function idToShortURL(n: any) {
  const map = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const shorturl = [];
  while (n) {
    shorturl.push(map[n % 62]);
    n = Math.floor(n / 62);
  }
  shorturl.reverse();
  return shorturl.join("").slice(0, 5);
}
