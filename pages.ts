import { setup, tw } from "https://esm.sh/twind@0.16.16"
import { getStyleTag, virtualSheet } from "https://esm.sh/twind@0.16.16/sheets"

const sheet = virtualSheet()

setup({
  theme: {
    fontFamily: {
      sans: ["Helvetica", "sans-serif"],
      serif: ["Times", "serif"],
    },
  },
  sheet,
})

const TITLE = "URL Beauty"
const DESCRIPTION = "An other URL shortener. But, with magic."
const ORIGIN = Deno.env.get("ORIGIN")

const HEAD = `
  <title>${TITLE}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${DESCRIPTION}" />

  <meta name="keywords" content="url, shortener, url shortener, url beauty, beauty, url.beauty" />
  <meta name="author" content="salteadorneo" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#ffffff" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@salteadorneo" />
  <meta name="twitter:creator" content="@salteadorneo" />
  <meta name="twitter:title" content="${TITLE}" />
  <meta name="twitter:description" content="${DESCRIPTION}" />
  <meta name="twitter:image" content="${ORIGIN}/og.png" />

  <meta property="og:title" content="${TITLE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:image" content="${ORIGIN}/og.png" />
  <meta property="og:url" content="${ORIGIN}" />
  <meta property="og:site_name" content="${TITLE}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
`

export function home() {
  sheet.reset()
  const body = renderHome()
  const styleTag = getStyleTag(sheet)

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        ${HEAD}
        ${styleTag}
      </head>
      <body>
        ${body}
      </body>
    </html>`
}

export function create(res: any) {
  sheet.reset()
  const body = renderCreate(res)
  const styleTag = getStyleTag(sheet)

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        ${HEAD}
        ${styleTag}
      </head>
      <body>
        ${body}
      </body>
    </html>`
}

function renderHome() {
  return `
    <section class="${tw`bg-gray-600 h-screen grid place-content-center`}">
        <div class="${tw`grid max-w-screen-xl px-4 py-8 mx-auto gap-8 lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12`}">
            <div class="${tw`mr-auto place-self-center lg:col-span-7`}">
                <h1 class="${tw`max-w-lg mb-4 font-extrabold tracking-tight leading-none text-6xl text-white`}">
                  Make <span class="${tw`bg-clip-text text-transparent bg-gradient-to-b from-pink-700 to-pink-500`}">beauty</span> any link
                </h1>
                <p class="${tw`max-w-2xl mb-8 font-light text-white md:text-lg lg:text-xl`}">
                  An other URL shortener. But, with magic.
                </p>
                <a
                  href="https://github.com/salteadorneo/url.beauty"
                  target="_blank"
                  class="${tw`inline-flex items-center justify-center gap-2 px-5 py-3 mr-3 text-base font-medium text-center rounded-lg border border-gray-300 bg-gray-100 text-gray-900 hover:bg-transparent hover:text-white`}"
                >
                    <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                      <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" fill="currentColor"></path>
                    </svg>
                    GitHub
                </a>
                <p class="${tw`max-w-2xl mt-2 font-light text-gray-300 text-xs`}">
                  Developed by <a href="https://salteadorneo.dev" target="_blank" class="${tw`underline`}">@salteadorneo</a> with <a href="https://deno.land/" target="_blank" class="${tw`underline`}">Deno</a> and <a href="https://deno.com/kv" target="_blank" class="${tw`underline`}">Deno KV</a>.
                </p>
            </div>
            <div class="${tw`sm:col-span-5 grid place-content-center`}">
                <div class="${tw`border border-gray-400 shadow rounded-lg p-3 space-y-4 select-none`}">
                  <div class="${tw`flex gap-2`}">
                    <div class="${tw`w-3 h-3 rounded-full`}" style="background:#FF8782;"></div>
                    <div class="${tw`w-3 h-3 rounded-full`}" style="background:#FFBE2F;"></div>
                    <div class="${tw`w-3 h-3 rounded-full`}" style="background:#29CE42;"></div>
                  </div>
                  <div class="${tw`w-72 sm:w-80 flex items-center justify-between bg-white py-2 px-6 rounded-full bg-none text-lg`}">
                    <div class="${tw`flex gap-0`}">
                      <span id="feature-text" class="${tw`font-bold`}"></span>
                      <span id="url" class="${tw`transition-all`}">https://example.com</span>
                    </div>
                    <div class="${tw`hidden text-gray-500`}">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                      >
                        <path d="M19 6a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H7.41l1.3-1.29a1 1 0 0 0-1.42-1.42l-3 3a1 1 0 0 0-.21.33 1 1 0 0 0 0 .76 1 1 0 0 0 .21.33l3 3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42L7.41 14H17a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1Z" />
                      </svg>
                    </div>
                  </div>
                  <p class="${tw`text-sm text-white text-center`}">
                    Add <span class="${tw`font-bold`}">url.beauty/</span> to the address bar to get magic.
                  </p>
                </div>
                <script defer>
                  const carouselDomains = [
                    { domain: "https://example.com", result: "xdqon" },
                  ]
                  const carouselText = [
                    { text: "url.beauty/" },
                  ]

                  carousel(carouselText, document.getElementById("feature-text"))

                  async function typeSentence(sentence, eleRef, delay = 100) {
                    const letters = sentence.split("");
                    let i = 0;
                    while(i < letters.length) {
                      await waitForMs(delay);
                      eleRef.append(letters[i]);
                      i++
                    }
                    return;
                  }

                  async function deleteSentence(eleRef) {
                    const sentence = eleRef.innerHTML;
                    const letters = sentence.split("");
                    let i = 0;
                    while(letters.length > 0) {
                      await waitForMs(100);
                      letters.pop();
                      eleRef.innerHTML = letters.join("");
                    }
                  }

                  async function carousel(carouselList, eleRef) {
                      var i = 0;
                      while(true) {
                        await typeSentence(carouselList[i].text, eleRef);
                        await waitForMs(500);

                        document.getElementById("url").style.opacity = 0;
                        await waitForMs(100);
                        document.getElementById("url").innerHTML = carouselDomains[i].result;
                        await waitForMs(100);
                        document.getElementById("url").style.opacity = 1;

                        await waitForMs(1500);

                        document.getElementById("url").innerHTML = carouselDomains[i].domain;
                        eleRef.innerHTML = "";
                        // await deleteSentence(eleRef);

                        await waitForMs(500);
                        i++
                        if(i >= carouselList.length) {i = 0;}
                      }
                  }

                  function waitForMs(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms))
                  }
                </script>
            </div>                
        </div>
    </section>
  `
}

function renderCreate(res: any) {
  const id = res.key[1]
  const { path } = res.value

  return `
    <section class="${tw`bg-gray-600 h-screen grid place-content-center`}">
        <div class="${tw`grid max-w-screen-xl px-4 py-8 mx-auto gap-8 lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12`}">
            <div class="${tw`mr-auto place-self-center lg:col-span-7`}">
                <h1 class="${tw`max-w-lg mb-4 font-extrabold tracking-tight leading-none text-6xl text-white`}">
                  Make <span class="${tw`bg-clip-text text-transparent bg-gradient-to-b from-pink-700 to-pink-500`}">beauty</span> this link
                </h1>
                <p class="${tw`max-w-2xl mb-8 font-light text-white md:text-lg lg:text-xl`}">
                  Copy the link and share it.
                </p>
                <p class="${tw`max-w-2xl mb-8 font-light text-white md:text-lg lg:text-xl`}">
                  Back to <a href="/" class="${tw`underline`}">home</a>
                </p>
            </div>
            <div class="${tw`sm:col-span-5 grid place-content-center`}">
                <div class="${tw`border border-gray-400 shadow rounded-lg p-3 space-y-4`}">
                  <div class="${tw`flex gap-2`}">
                    <div class="${tw`w-3 h-3 rounded-full`}" style="background:#FF8782;"></div>
                    <div class="${tw`w-3 h-3 rounded-full`}" style="background:#FFBE2F;"></div>
                    <div class="${tw`w-3 h-3 rounded-full`}" style="background:#29CE42;"></div>
                  </div>
                  <div class="${tw`w-72 sm:w-80 flex items-center justify-between bg-white py-2 px-6 rounded-full bg-none text-lg`}">
                    <div class="${tw`flex gap-0`}">
                      <span id="feature-text" class="${tw`font-bold`}"></span>
                      <span id="url" class="${tw`transition-all`}">${ORIGIN}/${id}</span>
                    </div>
                    <button
                      class="${tw`text-gray-900 focus:outline-none`}"
                      onclick="navigator.clipboard.writeText(\'${`${ORIGIN}/${id}`}\');"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M1 9.5A1.5 1.5 0 0 0 2.5 11H4v-1H2.5a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V4H5.5A1.5 1.5 0 0 0 4 5.5v7A1.5 1.5 0 0 0 5.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 12.5 4H11V2.5A1.5 1.5 0 0 0 9.5 1h-7A1.5 1.5 0 0 0 1 2.5v7Zm4-4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                  <p class="${tw`text-sm text-gray-400 text-center`}">
                    Redirect to ${path}
                  </p>
                </div>
            </div>                
        </div>
    </section>
    `
}
