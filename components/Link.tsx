import CopyToClipboard from "../islands/CopyToClipboard.tsx";
import { parseUrl } from "../utils.ts";
import DownloadQr from "./DownloadQr.tsx";

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:8000";

type Props = {
    hash: string;
    qr?: string;
    path: string;
    count: number;
};

export default function Link({ hash, qr, path, count }: Props) {
    return (
        <section class="flex items-center justify-between py-3 px-4 border border-zinc-200 rounded bg-zinc-100">
            <div class="flex flex-col">
                <div class="flex items-center gap-1">
                    <a
                        href={`${ORIGIN}/${hash}`}
                        target="_blank"
                        class="font-semibold"
                    >
                        {`url.beauty/${hash}`}
                    </a>
                    <CopyToClipboard value={`${ORIGIN}/${hash}`} />
                    {qr && <DownloadQr href={qr} />}
                </div>
                <p class="flex items-center gap-1 text-sm font-medium text-zinc-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-corner-down-right"
                    >
                        <polyline points="15 10 20 15 15 20" />
                        <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                    </svg>
                    <a href={parseUrl(path)} target="_blank">
                        {parseUrl(path)}
                    </a>
                </p>
            </div>
            <a
                href={`${ORIGIN}/${encodeURIComponent(path)}`}
                class="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 rounded-full py-0.5 px-2 text-sm"
            >
                {count} clicks
            </a>
            <img
                src={qr}
                alt="QR code"
                class="hidden border-2 border-zinc-200 rounded"
            />
        </section>
    );
}
