# How This App Was Built — a guided tour

Written for you, the author — because the video and the Assessment 4 Q&A both require you to
explain this in your own words. Read it top to bottom once, then do the exercises at the end.
Every example is real code from `app/`.

---

## 1. The 30-second mental model

- **React** lets you build a page out of **components** — reusable pieces like LEGO bricks.
  A component is just a JavaScript function that returns HTML-like code (called JSX).
- **Next.js** is a framework around React that adds the missing parts: URLs → pages, a server
  that renders HTML, a build system.
- Your app is: **a folder of pages** (`src/app/`), **a box of LEGO bricks** (`src/components/`),
  and **a drawer of data & logic** (`src/lib/`). That's it.

```
src/
├── app/          ← each folder here IS a page on the site
├── components/   ← reusable pieces used by the pages
└── lib/          ← data and logic (no visuals)
```

## 2. Folders are URLs

Next.js routing rule: **a folder inside `src/app/` containing a `page.tsx` becomes a URL.**

| Folder | URL you type |
|---|---|
| `src/app/page.tsx` | `/` (Home) |
| `src/app/about/page.tsx` | `/about` |
| `src/app/feeds/page.tsx` | `/feeds` |
| `src/app/feeds/[slug]/page.tsx` | `/feeds/anything-here` ← brackets = wildcard |
| `src/app/settings/page.tsx` | `/settings` |

No configuration file lists the routes — the folder tree *is* the routing table.

## 3. What a component looks like

Open [`src/components/Footer.tsx`](src/components/Footer.tsx) — the simplest one:

```tsx
import { siteConfig } from "@/lib/siteConfig";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      ...
      <strong>{siteConfig.studentName}</strong> · Student No. {siteConfig.studentId}
      ...
    </footer>
  );
}
```

Three things to notice — they repeat in every component:

1. **It's a function that returns markup.** `<footer>...</footer>` is JSX — HTML written in
   JavaScript.
2. **Curly braces `{}` insert JavaScript into the markup.** `{siteConfig.studentName}` prints
   your name. Change it in `siteConfig.ts` once → footer, header and About all update, because
   they all read the same variable.
3. **`styles from "./Footer.module.css"`** — each component has its own private stylesheet
   (a *CSS Module*). `styles.footer` becomes a unique class name so styles never leak between
   components.

## 4. layout.tsx — the frame around every page

[`src/app/layout.tsx`](src/app/layout.tsx) wraps **every** page. Whatever page you
visit, Next.js renders:

```tsx
<html>
  <body>
    <a href="#main">Skip to main content</a>   ← accessibility skip link
    <Header />                                  ← same header everywhere
    <main>{children}</main>                     ← the current page goes here
    <Footer />                                  ← same footer everywhere
  </body>
</html>
```

`{children}` is the placeholder where the actual page (Home, Feeds…) is slotted in. That's why
the header/footer never need to be repeated in any page file.

## 5. Story 1 — you type `/feeds` and press Enter

Follow the chain (this is the answer to "how does a page get to my screen"):

1. Browser asks the server for `/feeds`.
2. Next.js finds `src/app/feeds/page.tsx` and **runs it on the server**:
   ```tsx
   const posts = getPosts();          // ← asks lib/posts.ts for the data
   return <FeedsView posts={posts} /> // ← hands the data to a component
   ```
3. `getPosts()` in [`src/lib/posts.ts`](src/lib/posts.ts) returns the 6 sample posts,
   sorted newest first. (In Assessment 2 this same function will query a real database —
   nothing else will change. That's deliberate.)
4. `FeedsView` receives the posts as a **prop** (a function argument for components) and maps
   each one to a `<PostCard>`:
   ```tsx
   {filtered.map((post) => <PostCard post={post} layout={layout} />)}
   ```
5. The server turns all of that into plain HTML and sends it to the browser. You see cards.

**Data flows one way: lib → page → component → screen.**

## 6. Story 2 — you click the theme button (interactivity)

Pages are rendered on the server, but clicking needs JavaScript **in the browser**. Any
component that reacts to the user has `"use client"` as its first line — that marks it as a
*client component*. Only a handful have it: the hamburger, the theme toggle, the search.

The theme click, step by step:

1. [`ThemeToggle.tsx`](src/components/ThemeToggle.tsx): `onClick={() => setPreference("dark")}`.
2. `setPreference` lives in [`ThemeProvider.tsx`](src/components/ThemeProvider.tsx) and does
   three writes:
   ```ts
   root.dataset.theme = "dark";              // ① stamps <html data-theme="dark">
   localStorage.setItem("theme", "dark");    // ② remembers it in the browser
   document.cookie = "theme=dark; ...";      // ③ remembers it for the SERVER
   ```
3. Why does ① change the colours? Because **no component contains any colour** — they all use
   variables like `var(--bg)`. In [`globals.css`](src/app/globals.css):
   ```css
   :root                    { --bg: #f6f7f9; ... }   /* light values */
   :root[data-theme="dark"] { --bg: #0e1116; ... }   /* dark values  */
   ```
   Stamping `data-theme="dark"` on `<html>` swaps every variable at once. One attribute,
   whole app re-themed.
4. Why the cookie (③)? On your next visit a **small inline script in `<head>`** (look at the
   top of `layout.tsx`) reads that cookie and stamps `data-theme="dark"` onto `<html>`
   *before the browser paints anything* — so the page never flashes white before turning
   dark. localStorage (②) is the backup copy, used if the cookie was cleared.

   **Why not read the cookie on the server?** That was the obvious alternative — `await
   cookies()` inside `layout.tsx`. It works, but calling `cookies()` opts the route into
   **dynamic rendering**: every page would be rebuilt per request instead of being served as
   pre-built static HTML, which disables `<Link>` prefetching and makes navigation feel slow.
   `npm run build` prints the proof — every route is `○ (Static)` today; with `await cookies()`
   they turn into `ƒ (Dynamic)`. The inline script buys the same no-flash result without
   giving up static rendering.

This is the most impressive technical detail in the app — be able to say it in the video:
*"the theme is CSS variables switched by a data attribute; the choice is saved in a cookie and
applied by a tiny inline script before first paint — no flash, and the pages stay static."*

## 7. Story 3 — you click "Read more" (dynamic pages)

There is no file for `/feeds/welcome-to-the-rss-server-project`. Instead there's **one template
for all posts**: `src/app/feeds/[slug]/page.tsx`. The brackets mean "capture this part of the
URL and give it to me":

```tsx
const { slug } = await params;        // slug = "welcome-to-the-rss-server-project"
const post = getPostBySlug(slug);     // look it up in the data
if (!post) notFound();                // unknown slug → real 404 page
```

Six posts, one file. Add a 7th post to `posts.ts` and it instantly has its own page — nothing
else to write. Sample data lives in one place; pages are generated from it.

## 8. State — how the app "remembers" while you use it

**State** = a component's memory. Created with the `useState` hook:

```tsx
const [open, setOpen] = useState(false);   // HamburgerMenu: am I open?
const [query, setQuery] = useState("");    // FeedsView: what's typed in search?
```

When you call `setOpen(true)`, React re-runs the component and updates the screen. That's the
whole trick behind every interaction: **event → set state → React redraws.**

For state that must **survive closing the tab** (theme, card/list layout), the app writes to
`localStorage` through one shared helper, [`useLocalStorage.ts`](src/lib/useLocalStorage.ts)
— written once, reused by the layout toggle and settings.

## 9. Why it's organised this way (say this in the Q&A)

- **`siteConfig.ts`** — your name/ID appear in 3 places but are *defined* in 1. One edit, no
  inconsistency. ("Single source of truth.")
- **`getPosts()` instead of importing the array directly** — pages don't know where data comes
  from, so swapping in the Assessment 2 database changes one file, zero components. ("A seam.")
- **Components own their CSS** — deleting a component deletes its styles; nothing global breaks.
- **Git feature branches** (`git log --graph --oneline` shows it): each capability built on its
  own branch, merged into main — layout → themes → feeds → interactivity → polish → tests →
  post images → identity/nav fixes. The history *is* the build story, and it's worth marks.

## 10. Learn by poking (30 minutes, genuinely the fastest way)

With `npm run dev` running, make each change, watch the browser, then undo it:

1. **Your name**: edit `src/lib/siteConfig.ts` → footer + About update together.
2. **A colour**: in `globals.css` change `--accent: #2563eb` to `#e11d48` → every button, link
   and active state changes at once. Now you understand CSS variables.
3. **A post**: copy one object in `src/lib/posts.ts`, change its `title` and `slug` → a 7th
   card appears AND `/feeds/your-new-slug` exists. Now you understand dynamic routes.
4. **Break it**: rename `getPosts` to `getPost` in one place → the build error tells you
   exactly where it's used. Now you understand why TypeScript is on.
5. **See the tests**: `npm test` → watch a robot browser click your hamburger and toggle your
   theme in `tests/smoke.spec.ts`.

## 11. The one-breath answer (memorise this)

> "It's a Next.js App Router application. Folders under `src/app` are the pages; shared UI like
> the header, footer and hamburger menu are reusable components; data and logic live in `lib`.
> Pages render on the server — only interactive pieces run in the browser. Theming is CSS
> variables switched by a `data-theme` attribute, persisted in a cookie and applied by a tiny
> inline script before first paint, so there's no flash and every page stays static. The Feeds
> page reads through a `getPosts()` function, which is
> the seam where the Assessment 2 backend plugs in."

## 12. Glossary

| Term | Meaning |
|---|---|
| **Component** | A function returning JSX; a reusable piece of UI |
| **JSX** | HTML-looking syntax inside JavaScript |
| **Prop** | An argument passed *into* a component (`<PostCard post={...} />`) |
| **State** | A component's memory; changing it redraws the screen |
| **Hook** | Function starting with `use` that gives components abilities (`useState`…) |
| **Server component** | Rendered on the server; default; no interactivity |
| **Client component** | Has `"use client"`; runs in the browser; can handle clicks |
| **CSS Module** | Per-component stylesheet with auto-unique class names |
| **CSS variable** | Named value (`--bg`) referenced by styles; swap the value, re-theme the app |
| **Dynamic route** | `[slug]` folder — one template serving many URLs |
| **localStorage / cookie** | Browser storage; cookies also travel to the server with requests |

## 13. Everything outside `src/` — the rest of the folder explained

You write code in **three** places: `src/` (the app), `tests/` (the robot-browser tests), and
`public/` (files served as-is, like the video). Everything else falls into one of three
categories: **settings**, **generated**, or **bookkeeping** — you rarely touch any of it.

```
app/
├── src/                  ✍ YOUR CODE — pages, components, lib
├── tests/                ✍ Playwright smoke tests (npm test)
├── public/               ✍ static files served at the site root
│   └── videos/              → drop how-to.mp4 here for the About page
│
├── package.json          ⚙ the project manifest (see below — worth understanding)
├── package-lock.json     ⚙ exact version of every installed library, for reproducibility
├── tsconfig.json         ⚙ TypeScript settings — e.g. defines that "@/" means "src/"
├── next.config.ts        ⚙ Next.js settings (currently near-empty defaults)
├── eslint.config.mjs     ⚙ code-quality rules that `npm run lint` enforces
├── playwright.config.ts  ⚙ how tests run (builds the app, serves it on port 3457)
├── .gitignore            ⚙ what git must NEVER track (node_modules, .next, test output)
│
├── node_modules/         🤖 GENERATED — every installed library lives here (~hundreds of
│                            packages). Never edit, never submit; `npm install` rebuilds it
│                            from package.json. This is why the zip excludes it.
├── .next/                🤖 GENERATED — Next.js build output/cache. Deletable any time.
├── next-env.d.ts         🤖 GENERATED — TypeScript glue, auto-maintained
│
├── .git/                 📒 the entire git history database (every commit, every branch)
├── README.md             📒 the repo's front page on GitHub (a marked criterion)
├── CODE_TOUR.md          📒 this file
└── AGENTS.md, CLAUDE.md  📒 notes telling AI coding tools to read the bundled Next.js docs
```

**`package.json` is the one config file worth reading.** It answers two questions:

- *What commands exist?* — the `scripts` block: `npm run dev` (development server),
  `npm run build` (production build), `npm run lint` (code checks), `npm test` (Playwright).
- *What libraries does this project need?* — `dependencies` (shipped with the app: react,
  next) and `devDependencies` (used only while building/testing: eslint, playwright,
  TypeScript). `npm install` reads this list and fills `node_modules/` accordingly.

The mental shortcut: **if you didn't write it, you can't break it by leaving it alone** —
config files hold settings, generated folders can always be rebuilt, and `.git` is your safety
net, not something to manage by hand.
