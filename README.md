# NextJS possible cache issue repo

`next@14.1.2-canary.3`.

## Instructions

### 1. Initial setup (no cookies)

#### Console 1

```sh
npm run dev
```

#### Console 2

```sh
node ./echo.js
```

#### Console 3

```sh
curl http://localhost:3000/test
```

#### Expected result

On the first run of `curl`, with an empty cache, console 2 should show one
GET request to `/foo` (indicating that the second request was cached).

On any additional run of `curl http://localhost:3000/test`, no requests should
be made to `/foo` (indicating again the use of the cache).

### 2. With cookies() call in page.tsx

Edit `app/test/page.jsx` and uncomment the call to `cookies()`.

Now when `curl http://localhost:3000/test` is run, console 2 should show two
GET requests being made to `/foo`. This indicates that the cache is not being
used.

### How to clear the fetch cache

```sh
rm -rf .next/cache/fetch-cache/
```

## Why does this happen?

The key logic is
[staticGenerationStore.revalidate = 0](https://github.com/vercel/next.js/blob/c6e865bf6f034a06390424cddb026a8f7c53ea5b/packages/next/src/server/future/route-modules/app-route/module.ts#L302)
and
[staticGenerationStore.revalidate === 0](https://github.com/vercel/next.js/blob/e9862a80f8102070dfc0c1226e11f0e97a90bf0a/packages/next/src/server/lib/patch-fetch.ts#L342).
