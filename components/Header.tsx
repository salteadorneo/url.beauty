import Button from "./Button.tsx";
import Input from "./Input.tsx";

export default function Header() {
  return (
    <>
      <div
        aria-hidden="true"
        class="absolute inset-0 -z-10 grid grid-cols-2 -space-x-52 opacity-60"
      >
        <div class="blur-[106px] h-56">
        </div>
        <div class="blur-[106px] h-32 bg-gradient-to-r from-pink-100 to-pink-200 dark:to-pink-300">
        </div>
      </div>
      <section class="relative space-y-4 py-16 text-center">
        <h1 class="font-bold leading-[4rem] text-7xl text-pretty max-w-xl mx-auto">
          Make{" "}
          <span class="bg-clip-text text-transparent bg-gradient-to-b from-pink-700 to-pink-500">
            beauty
          </span>{" "}
          any link
        </h1>
        <p class="text-xl text-pretty max-w-xl mx-auto">
          A free URL shortener fast and easy to use.
        </p>
        <form method="post" class="space-x-2">
          <Input name="query" type="url" placeholder="https://" autoFocus />
          <Button class="!bg-pink-500 hover:!bg-pink-400 text-white">
            Shorten!
          </Button>
        </form>
      </section>
    </>
  );
}
