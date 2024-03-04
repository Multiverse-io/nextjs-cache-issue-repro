# NextJS cache issue repro

A NextJS app for reproducing a caching issue with `fetch`. Runs on
`next@14.1.2-canary.3`.

## Instructions

### 1. Initial setup (no cookies)

#### Console 1

Start the app on localhost:3000:

```sh
npm i
npm run dev
```

The app has a `/test` page that makes two requests via `fetch` to
`http://localhost:8080/test`.

#### Console 2

Start an HTTP server on localhost:8080 that echos any requests received. This
server stands in for an external API called by the page rendering code.

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
be made to `/foo` (again indicating the use of the cache).

### 2. With cookies() call in page.jsx

Edit `app/test/page.jsx` and uncomment the call to `cookies()`.

#### Expected result

Now when `curl http://localhost:3000/test` is run, console 2 should show **two**
GET requests being made to `/foo`. This indicates that the cache is not being
used.

### 3. With `force-cache` option set

With the call to `cookies()` still uncommented, replace the call to `fetch`
in `app/test/page.jsx` with

```javascript
await fetch("http://localhost:8080/foo", { method: "GET", cache: 'force-cache' })
```

Now in console 3 run `curl http://localhost:3000/test`.

#### Expected result

The cache is used (i.e. no GET requests are made to `/foo`), even with the call
to `cookies()` in `page.jsx`.

### 4. With `next: { revalidate: 999 }` set

With the call to `cookies()` still uncommented, replace the call to `fetch`
in `app/test/page.jsx` with

```javascript
await fetch("http://localhost:8080/foo", { method: "GET", next: { revalidate: 999} })
```

Now in console 3 run `curl http://localhost:3000/test`.

#### Expected result

The cache is used (i.e. no GET requests are made to `/foo`), even with the call
to `cookies()` in `page.jsx`.

## Why does this happen?

The key logic is
* [staticGenerationStore.revalidate = 0](https://github.com/vercel/next.js/blob/c6e865bf6f034a06390424cddb026a8f7c53ea5b/packages/next/src/server/future/route-modules/app-route/module.ts#L302), and
* [staticGenerationStore.revalidate === 0](https://github.com/vercel/next.js/blob/e9862a80f8102070dfc0c1226e11f0e97a90bf0a/packages/next/src/server/lib/patch-fetch.ts#L342).

## Why is this unexpected?

* Docs suggest that `cache: 'force-cache'` is the default for `fetch`
  (see [here](https://github.com/vercel/next.js/blob/e9862a80f8102070dfc0c1226e11f0e97a90bf0a/docs/02-app/02-api-reference/04-functions/fetch.mdx#L16)),
  but section 3 above shows that `fetch` can behave differently when this option is set.
* If a page accesses cookies during SSR, it seems counterintuitive that this
  should turn off caching for any `fetch` calls that its rendering code makes to
  any external APIs.

## How to clear the fetch cache

It can be useful to clear the fetch cache when testing behavior:

```sh
rm -rf .next/cache/fetch-cache/
```
