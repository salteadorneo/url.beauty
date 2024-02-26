import Button from "./Button.tsx";
import Input from "./Input.tsx";

export default function Header() {
  return (
    <>
      <div
        aria-hidden="true"
        class="absolute inset-0 -z-10 grid grid-cols-2 -space-x-52 opacity-60"
      >
        <div class="blur-[106px] h-56 bg-gradient-to-br from-primary to-pink-200 dark:from-pink-300">
        </div>
        <div class="blur-[106px] h-32 bg-gradient-to-r from-pink-200 to-pink-300 dark:to-pink-400">
        </div>
      </div>
      <section class="relative space-y-4 py-8">
        <h1 class="font-extrabold leading-[4rem] text-7xl text-pretty max-w-xl">
          Make{" "}
          <span class="bg-clip-text text-transparent bg-gradient-to-b from-pink-700 to-pink-500">
            beauty
          </span>{" "}
          any link
        </h1>
        <p class="text-xl text-pretty max-w-xl">
          A free URL shortener fast and easy to use.
        </p>
        <form method="post" class="space-x-2">
          <Input name="query" placeholder="https://" />
          <Button>Shorten!</Button>
        </form>
      </section>
    </>
  );
}
