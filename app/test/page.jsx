import { cookies } from "next/headers"

export default async () => {
  // uncomment this and the request will no longer be cached
  // cookies()

  // make the request two times so we can clearly see that it's not being cached
  // even when the page is loaded for the first time and the cache starts empty.
  for (let i = 0; i < 2; ++i) {
    await fetch("http://localhost:8080/foo", { method: "GET" })
  }

  return (
    <div>
      Hello
    </div>
  );
}
