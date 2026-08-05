// Sample content standing in for RSS feed items (Assessment 1 is frontend
// only). The shape follows the blog structure from the Module 4 labs
// (id, title, description→summary, author, date, imageUrl).
// Everything reads through getPosts()/getPostBySlug() — in Assessment 2
// these functions will be reimplemented against the real RSS backend
// without any component changes.
//
// This feed is written entirely by the student: six "Build Journal" posts
// reflecting on what was actually new and difficult while building this app,
// and five "Research Notes" posts where a real source was read and then tied
// back to a decision made in this codebase.

import { siteConfig } from "./siteConfig";

export type PostCategory = "Announcements" | "Learning" | "Theming" | "Research";

/** A citation's exact substring in `body` paired with the real URL it should link to. */
export type Citation = { text: string; href: string };

export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  author: string;
  date: string; // ISO 8601
  imageUrl: string;
  imageAlt: string; // every image gets a real text alternative (WCAG)
  source: string; // name of the (future) RSS feed this item came from
  category: PostCategory;
  citations?: Citation[];
};

const posts: Post[] = [
  {
    id: 1,
    slug: "new-concepts-i-met-building-my-first-app",
    title: "New concepts I met building my first app",
    summary:
      "I started Assessment 1 not knowing what RSS, a hamburger menu, a cookie, or a breadcrumb trail actually were in code terms. Here is what each one turned out to mean.",
    body: [
      "This is the first app I have built, so a lot of the words in the brief were new to me before I started, not just new to this project. Writing them down in plain terms is how I actually understood them.",
      "RSS (Really Simple Syndication) is a standard format a website publishes so other tools can read its content programmatically instead of scraping the page. That's the whole idea behind the RSS Server this app is the frontend for. A hamburger menu is the three-line icon that expands into full navigation on small screens; a cookie is a small piece of data the browser sends back to the server with every request, which turned out to matter a lot once I got to theming. A breadcrumb trail is the small Home / Feeds / Post Title strip at the top of a page that shows where you are and lets you step back up one level at a time.",
      "None of these were difficult once I saw them working, but I could not have named any of them accurately before this assessment. I am writing this post first, before the others, because everything else I built depends on understanding these basic pieces first.",
    ],
    author: siteConfig.studentName,
    date: "2026-06-24",
    imageUrl: "/images/posts/rss-server.svg",
    imageAlt:
      "An RSS feed icon sending content to a screen that represents the LMS.",
    source: "Build Journal",
    category: "Learning",
  },
  {
    id: 2,
    slug: "react-component-composition-and-reuse",
    title: "Research notes: React component composition and reuse",
    summary:
      "Before building my components I read up on how React expects components to be composed and reused. The core idea: small, single-purpose components combined together, not large ones with dozens of props.",
    body: [
      "React's own documentation frames this through 'Thinking in React': break the interface into a component hierarchy where each component does one job, then compose them rather than writing one large component that tries to handle every case (React, n.d., react.dev/learn/thinking-in-react). The docs are also direct about the alternative to reaching for a prop for every variant: favour composition, and let a component accept children or a small set of variant props instead of branching internally for every case.",
      "The other point that stood out, also from the official docs, was about where data lives: components should not manage their own data if they do not have to. Fetch it once, then pass it down as props, so the same component can be reused wherever that data shape shows up.",
      "What this means for my build: it is the reason PostCard in this app takes a layout prop instead of me writing a separate CardPostCard and ListPostCard. One component, one job, reused in two views. Reading the reasoning behind the pattern before I wrote the component is what stopped me from duplicating it.",
    ],
    author: siteConfig.studentName,
    date: "2026-06-26",
    imageUrl: "/images/posts/community-tools.svg",
    imageAlt:
      "Dots of different sizes joined into a network, representing components composed together.",
    source: "Research Notes",
    category: "Research",
    citations: [
      { text: "react.dev/learn/thinking-in-react", href: "https://react.dev/learn/thinking-in-react" },
    ],
  },
  {
    id: 3,
    slug: "applying-component-reusability-for-the-first-time",
    title: "Applying component reusability for the first time",
    summary:
      "I learned the idea of reusable components in my IT Fundamentals course, but this is the first project where I actually built one. PostCard and siteConfig are where it shows up.",
    body: [
      "IT Fundamentals is where I first learned the idea that you should write a piece of logic once and reuse it, not copy it. This project is where I actually had to do it in real code rather than talk about it in theory. Two places in this app show the idea directly. PostCard is one component that renders a post two different ways, as a grid card or as a list row, controlled by a single layout prop, instead of two separate near-identical components — the exact pattern React's docs describe for passing the same data down to different presentations of it (React, n.d., react.dev/learn/passing-props-to-a-component). siteConfig.ts is the other: my name, student number, and the assessment title are written once and imported by the header, footer, and About page, so changing one file updates all three places at once instead of three separate edits that could drift apart.",
      "One thing I found myself wondering while building this: is React similar to how PHP mixes server code with HTML? I think that is a fair comparison, but only half of it. Where they are alike: a Next.js Server Component runs on the server and outputs finished HTML before the browser sees it, which is the same basic idea as a PHP file mixing <?php ?> logic into an HTML page. Both produce server-rendered HTML as the response. Where they are not alike: PHP is a templating and scripting language, it does not have a component model. React components are reusable units with their own props and, when needed, their own state, and they can also become Client Components that keep running and reacting in the browser after the page loads, updating the screen without a full page reload. Plain PHP + HTML + CSS does not have that second half at all; any change after the page loads needs a new request or separate JavaScript bolted on. So the server-rendering half of the comparison holds up; the component-and-interactivity half is where React (and Next.js Client Components) is doing something PHP was never built to do.",
      "Realising that distinction is what made the App Router's split between Server and Client Components click for me. I go into that properly in the next research post.",
    ],
    author: siteConfig.studentName,
    date: "2026-06-28",
    imageUrl: "/images/posts/rss-education.svg",
    imageAlt:
      "Three content sources connected by lines to a central hub, representing shared logic reused in several places.",
    source: "Build Journal",
    category: "Learning",
    citations: [
      {
        text: "react.dev/learn/passing-props-to-a-component",
        href: "https://react.dev/learn/passing-props-to-a-component",
      },
    ],
  },
  {
    id: 4,
    slug: "nextjs-server-and-client-components",
    title: "Research notes: Next.js Server and Client Components",
    summary:
      "The App Router makes every component a Server Component by default. I read the official docs to understand when a component actually needs to become a Client Component, and why fewer is better.",
    body: [
      "In Next.js's App Router, Server Components are the default. A file only becomes a Client Component when you explicitly mark it with 'use client' at the top (Next.js, n.d., nextjs.org/docs/app/getting-started/server-and-client-components).",
      "Server Components render once on the server and send finished HTML to the browser. That's it, no JavaScript runs afterward, nothing keeps executing. Use them when a component just needs to display something and doesn't need to react to the user.",
      "Client Components also render on the server first, so the browser gets HTML straight away like everything else. But their JavaScript is also sent to the browser, and once it arrives, it 'wakes up' and keeps running there. That's what lets a Client Component hold state, remembering things like whether a toggle is on or off, and respond instantly when the user clicks, types, or interacts, without needing to ask the server for a new page.",
      "The trade-off is simple: Client Components can do more, but they cost more. Every Client Component means extra JavaScript the browser has to download and run. So the best practice is to keep the default, Server Component, wherever possible, and only mark something as a Client Component when it genuinely needs state or interaction, pushing that marking down to the smallest component that needs it rather than a whole page or layout.",
      "In this app, that's exactly the pattern followed: the theme toggle, the hamburger menu, and the search/feeds view are Client Components, because they need to hold state and respond to clicks. Everything else, including the page shells and PostCard's server-rendered structure, stays a Server Component by default, since it only needs to display, not react.",
    ],
    author: siteConfig.studentName,
    date: "2026-06-30",
    imageUrl: "/images/posts/nextjs-boundary.svg",
    imageAlt:
      "A server rack on one side connected by an arrow to a browser window on the other, representing the server/client boundary.",
    source: "Research Notes",
    category: "Research",
    citations: [
      {
        text: "nextjs.org/docs/app/getting-started/server-and-client-components",
        href: "https://nextjs.org/docs/app/getting-started/server-and-client-components",
      },
    ],
  },
  {
    id: 5,
    slug: "learning-git-feature-branches-on-this-project",
    title: "Learning git feature branches on this project",
    summary:
      "I had used GitHub before, but always as one branch. This assessment is where I learned to split work into separate streams per component and merge them back deliberately.",
    body: [
      "I already knew how to use GitHub before this course: commit, push, done. What I hadn't done is work in a cycle, building one feature on its own branch, finishing it, merging it, then moving to the next.",
      "Git's own documentation calls this the feature-based workflow: branch per feature, delete it once merged into main (Chacon & Straub, n.d., git-scm.com/about/branching-and-merging). It works because of isolation. Everything in a branch relates to one topic, which makes it easier to reason about and review (Chacon & Straub, n.d., git-scm.com/book/en/v2/Git-Branching-Branching-Workflows).",
      "The cycle was the same each time: branch, commit, test locally, merge with --no-ff, delete, repeat. That gave me feature/layout-shell, feature/theme-system, feature/feeds-pages, feature/interactivity, feature/a11y-polish, plus smaller fix/ and chore/ branches. --no-ff mattered because it keeps every merge as its own commit, so git log --graph --oneline actually shows the branch shape instead of one flat line.",
      "A branch is a boundary around one decision at a time. While I was on feature/theme-system, half-finished feed code wasn't in the same working tree, and if something broke, main stayed unaffected. Main was always something I could check out and trust would run.",
      "What earns its own branch: a change deserves its own branch when it's one decision I could describe in a sentence, and revert on its own without unravelling something else. One rubric criterion, one branch: theming, feeds content, and accessibility each got their own. Size doesn't decide it, coherence does. The ten-post feeds rewrite was big but one decision, so one branch. The citation-hyperlinks work came later, for a different reason, so it was a separate branch even though it touched the same file.",
      "If the commit message needs an 'and,' it's probably two branches. I did break this once: I found a stale React URL while linkifying citations and fixed it in the same commit rather than its own branch. That was a judgment call, not a rule, since it was tiny and directly adjacent. Chores, fixes, and docs get their own branch too, just smaller: chore/student-identity, fix/nav-order-consistency, docs/upgrade-research-sources.",
    ],
    author: siteConfig.studentName,
    date: "2026-07-02",
    imageUrl: "/images/posts/git-branches.svg",
    imageAlt:
      "A simple diagram of a main line with a branch splitting off and merging back in, representing a git feature branch.",
    source: "Build Journal",
    category: "Learning",
    citations: [
      {
        text: "git-scm.com/about/branching-and-merging",
        href: "https://git-scm.com/about/branching-and-merging",
      },
      {
        text: "git-scm.com/book/en/v2/Git-Branching-Branching-Workflows",
        href: "https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows",
      },
    ],
  },
  {
    id: 6,
    slug: "wcag-2-2-and-designing-for-accessibility",
    title: "Research notes: WCAG 2.2 and designing for accessibility",
    summary:
      "I read the actual W3C WCAG 2.2 guidelines rather than guessing at 'good practice' — specifically the keyboard focus and contrast requirements — before finishing the accessibility pass on this app.",
    body: [
      "WCAG 2.2 is the current W3C rulebook for making websites accessible, published in October 2023. It builds on the version before it (2.1) rather than replacing it (W3C, 2023, w3.org/TR/WCAG22/). The basic idea behind WCAG hasn't changed across versions: a site is accessible when anyone can use it, no matter how they interact with it. That gets broken into four principles: can people perceive the content, can they operate it, can they understand it, and does it work reliably across different tools like screen readers (Boxhall et al., n.d., web.dev/articles/accessibility).",
      "Two of the newer WCAG 2.2 rules mattered directly for what I was building.",
      "First, everything has to work with a keyboard alone. No mouse, no touchscreen, just Tab to move between things and Enter to select them. And whatever's currently selected has to actually be visible on screen. It can't be hidden behind something else or scrolled out of view.",
      "Second, when something is selected, there has to be a visible highlight around it. WCAG 2.2 doesn't just say 'add an outline.' It gives an actual rule: the highlight has to be a certain size, and it has to stand out from the background with a contrast ratio of at least 3:1.",
      "Reading the real rules, instead of a summary of them, changed how I tested my own work. I stopped clicking through the app with a mouse. Instead, I did a full pass using only the keyboard, using Tab, Enter, and Escape, watching where the highlight landed at every step. I also checked that my hamburger menu button was a real <button> with aria-expanded and aria-controls, so it actually announces whether it's open or closed, not just looks like it does.",
      "This is the research that shaped a real decision in my build. The skip-to-content link as the first thing you can Tab to, the visible focus outline in globals.css, and the rule that turns off animations for people who've told their device they don't want motion. All three came from checking my app against WCAG 2.2 directly, instead of assuming it 'looked accessible.'",
    ],
    author: siteConfig.studentName,
    date: "2026-07-05",
    imageUrl: "/images/posts/accessible-content.svg",
    imageAlt:
      "Large readable letters beside light-on-dark and dark-on-light contrast samples.",
    source: "Research Notes",
    category: "Research",
    citations: [
      { text: "w3.org/TR/WCAG22/", href: "https://www.w3.org/TR/WCAG22/" },
      { text: "web.dev/articles/accessibility", href: "https://web.dev/articles/accessibility" },
    ],
  },
  {
    id: 7,
    slug: "solving-the-theme-flash-cookies-and-localstorage",
    title: "Solving the theme flash: cookies and localStorage",
    summary:
      "My dark mode worked the first time I built it, except every reload flashed white before turning dark. Understanding why the server needed to know the theme too — not just the browser — is what fixed it.",
    body: [
      "The first version of my theme toggle only used localStorage: click the button, save 'dark' to the browser's storage, done. It worked while the tab was open, but every hard reload flashed the light theme for a moment before flipping to dark. I did not understand at first why saving the preference had not already fixed that.",
      "The answer came from the Next.js Server/Client Components research above: Next.js renders the page on the server first and sends finished HTML to the browser, and localStorage only exists in the browser — the server has no way to read it while it is building that first HTML response. So the server always renders the default theme, and only after the page arrives and JavaScript runs does the browser correct it to dark, which is the flash. The fix was to also write the choice into a cookie, and to read it back in a tiny script that sits in the <head> of layout.tsx. That script runs synchronously, before the browser paints anything, so it stamps data-theme=\"dark\" onto the <html> tag while the page is still blank — there is never a moment where the wrong theme is on screen.",
      "I did try the more obvious version first: reading the cookie on the server with await cookies() inside layout.tsx. It works, but it costs something I did not expect. Calling cookies() opts the whole route into dynamic rendering, so every page is rebuilt for each request instead of being served as pre-built static HTML, and that switches off the prefetching Next.js does on <Link>, which makes moving between pages feel slower. Running npm run build shows it plainly: every route is marked ○ (Static) the way the app is built now, and they turn into ƒ (Dynamic) the moment await cookies() goes in. Paying for one tiny inline script to keep every page static was the better trade, and it is the decision in this build I would most want to be asked about.",
      "Every colour in the app is a CSS custom property, so that one data-theme attribute swapping is what repaints the whole page at once, in both directions. This is the single piece of the build I understood most slowly and am now most confident explaining, because I had to actually trace why saving the preference was not enough on its own.",
    ],
    author: siteConfig.studentName,
    date: "2026-07-08",
    imageUrl: "/images/posts/dark-mode.svg",
    imageAlt:
      "A circle split into a light half with sun rays and a dark half with stars, representing light and dark themes.",
    source: "Build Journal",
    category: "Theming",
  },
  {
    id: 8,
    slug: "where-cookies-fit-in-bridging-server-and-client-components",
    title: "Where cookies fit in: bridging Server and Client Components",
    summary:
      "Server Components and Client Components run in two different places, and that difference is exactly what caused the theme flash. A cookie turned out to be the one thing both sides can actually see.",
    body: [
      "Server Components and Client Components run in two different places, and that difference decides what each one can actually see.",
      "A Server Component renders on the server, before anything reaches the browser. At that point, the only information it has is whatever travelled with the request. That includes cookies, because a cookie is sent to the server automatically with every request. So a Server Component can read a cookie and use it while it's building the HTML.",
      "A Client Component runs later, in the browser, after the page has already loaded. It has access to things a Server Component doesn't, like localStorage, which lives entirely in the browser and never gets sent anywhere.",
      "That gap is exactly where the theme flash came from. localStorage only exists in the browser, so when the Server Component builds the first HTML response, it has no way to check it and falls back to the default theme. Only once the page arrives and the Client Component's JavaScript runs does it check localStorage and correct the theme to dark. In that gap between the server's guess and the browser's correction, the light theme flashes on screen for a moment.",
      "A cookie closes that gap, because it isn't stuck on one side the way localStorage is. It's written in the browser, but travels to the server with every request after that. In this app I ended up using that property slightly differently than I first expected: rather than reading the cookie in a Server Component, a small script in the <head> reads it and sets the theme before the browser paints. The post on solving the theme flash explains why — reading cookies on the server would have forced every page to render dynamically instead of shipping as static HTML.",
      "That is still the reason the preference lives in a cookie and not in localStorage alone: a cookie is the one piece of browser-side storage the server is also allowed to see, while anything in localStorage stays invisible to it. So I kept both — the cookie is what the pre-paint script reads today and what a server could read once Assessment 2 adds a real backend, and localStorage is the copy that survives cookies being cleared.",
    ],
    author: siteConfig.studentName,
    date: "2026-07-09",
    imageUrl: "/images/posts/cookie-bridge.svg",
    imageAlt:
      "A cookie icon between a server rack and a browser window, with arrows connecting it to both sides.",
    source: "Build Journal",
    category: "Theming",
  },
  {
    id: 9,
    slug: "the-f-pattern-and-how-people-scan-feeds",
    title: "Research notes: the F-pattern and how people scan feeds",
    summary:
      "Nielsen Norman Group's original eye-tracking research shows people scan web content in an F-shaped pattern rather than reading it. I used that to check the Feeds page layout, not just the interactions.",
    body: [
      "Jakob Nielsen's original 2006 eye-tracking study recorded how users actually looked at web pages and found the dominant pattern traced roughly the shape of the letter F: two horizontal stripes across the top and a bit further down, then a vertical stripe scanning down the left edge (Nielsen, 2006, nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/). The reason given is straightforward: people do not read web pages, they scan them, picking up the first few words of a line or heading and deciding whether to keep going.",
      "A follow-up study eleven years later confirmed the pattern still holds, but added an important correction: F-shaped scanning is not something to design toward, it's a sign that users are missing content, and good design should reduce how much of it happens (Pernice, 2017, nngroup.com/articles/f-shaped-pattern-reading-web-content/). The practical implication is to put the meaningful words first (in a heading, in a list item, in a card title) so a scanning eye actually catches them, rather than treating the F-shape itself as the target.",
      "Checking the Feeds page against this after building it, not before, was useful: each PostCard already leads with the title, then date and source, then a short summary, which matches the pattern. What I added because of this research was the search box announcing its result count through an aria-live region and the expand/collapse control on each summary. Both let someone scanning the list decide to go deeper without leaving the page, rather than committing to a full click-through on every item that catches their eye.",
    ],
    author: siteConfig.studentName,
    date: "2026-07-11",
    imageUrl: "/images/posts/feed-scanning.svg",
    imageAlt:
      "A wireframe list of posts with a vertical bar tracing an F-shaped scanning pattern.",
    source: "Research Notes",
    category: "Research",
    citations: [
      {
        text: "nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/",
        href: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/",
      },
      {
        text: "nngroup.com/articles/f-shaped-pattern-reading-web-content/",
        href: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/",
      },
    ],
  },
  {
    id: 10,
    slug: "frontend-first-backend-later-staged-architecture",
    title: "Research notes: frontend-first, backend-later staged architecture",
    summary:
      "Building the whole interface now with sample data, before any backend exists, is not just what the brief asked for — it is a recognised way to stage a build. I looked into why that order works.",
    body: [
      "This assessment's structure, build the full frontend against sample data first, add the real backend in Assessment 2, is not an unusual constraint invented for a university brief. Google's own Site Reliability Engineering book describes the same instinct at a much larger scale: their Launch Coordination Engineering team has teams launch new products gradually rather than all at once, using a checklist covering architecture, capacity, and failure modes, plus gradual rollouts and feature flags, specifically to keep risk manageable when Google sometimes performs up to 70 launches per week (Kirsch, 2017, in Beyer et al., Site Reliability Engineering, Chapter 27: Reliable Product Launches at Scale, sre.google/sre-book/reliable-product-launches/). The scale is completely different, but the reasoning is the same one behind this assessment's structure: prove the smaller, safer piece works before the bigger, riskier piece is switched on.",
      "The trade-off is real, not free. Sample data can hide problems a real backend will expose later: pagination, empty states, slow responses, malformed feed items, none of which show up when the data is ten hand-written objects in a TypeScript file.",
      "This is why getPosts() exists as a single function in this app rather than components importing the sample array directly. It is the seam described in this research. Everything downstream of that one function, search, the layout toggle, the dynamic [slug] route, was built and tested against sample data, and in Assessment 2 that one function is what gets rewritten against the real RSS backend. No component above it should need to change.",
    ],
    author: siteConfig.studentName,
    date: "2026-07-13",
    imageUrl: "/images/posts/roadmap.svg",
    imageAlt:
      "Four numbered milestones in a row connected by an arrow, representing a staged four-assessment project.",
    source: "Research Notes",
    category: "Research",
    citations: [
      {
        text: "sre.google/sre-book/reliable-product-launches/",
        href: "https://sre.google/sre-book/reliable-product-launches/",
      },
    ],
  },
  {
    id: 11,
    slug: "trade-offs-and-where-this-goes-next",
    title: "Trade-offs and where this goes next",
    summary:
      "Assessment 1 is one stage of four. Reflecting on what I chose to build now, what I deliberately left out, and what has to stay stable for the rest of the project to work.",
    body: [
      "Every decision in this build had to be made knowing three more assessments build on top of it, not just this one. The frontend-first research above is the reason I was comfortable with sample data standing in for real content. The cost is that some backend realities (loading states, errors, pagination) are not tested yet, but the benefit is that navigation, theming, and layout are all proven and stable before the harder backend work starts.",
      "I also chose plain CSS Modules and custom properties over a UI framework like Bootstrap or Tailwind. That was slower to build and means more CSS to maintain, but it demonstrates the actual underlying skills (transforms, media queries, theming with variables) rather than hiding them behind a library, and it means there is no framework dependency to work around when Assessment 2 changes what data flows through these same components.",
      "Looking ahead: Assessment 2 replaces getPosts() with a real RSS-backed function and nothing above that seam should need to change; Assessment 3 will add reporting and data on top of an interface that already has a working search and layout system to extend rather than rebuild; Assessment 4's cloud deployment and performance work benefits from a build that is already component-based and already passes its own automated Playwright suite. None of that was guaranteed by accident. It is the direct result of treating Assessment 1 as the foundation for three more stages, not as a standalone piece of coursework.",
    ],
    author: siteConfig.studentName,
    date: "2026-07-15",
    imageUrl: "/images/posts/signpost.svg",
    imageAlt:
      "A signpost with four numbered markers pointing forward, representing decisions made now shaping the next three assessments.",
    source: "Build Journal",
    category: "Announcements",
  },
];

/** All posts, newest first. */
export function getPosts(): Post[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
