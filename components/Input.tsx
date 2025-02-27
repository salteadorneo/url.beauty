import { JSX } from "preact";

export default function Input(props: JSX.HTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      class={`px-3 py-2 bg-white rounded border w-64 disabled:(opacity-50 cursor-not-allowed) ${props.class ?? ""
        }`}
    />
  );
}
