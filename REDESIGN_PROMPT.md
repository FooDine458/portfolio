# Master Prompt — Portfolio Redesign (Lim Saifudine)

Paste this whole document as the instruction when you want an AI (this session or another) to redesign `index.html` / `main.js` / `style.css` in this repo. It's written from a real audit of the current site, not a generic template.

---

## 1. Context

Static single-page portfolio for **Lim Saifudine**, ICT undergraduate at AUPP (Phnom Penh), GPA 3.5+, class of 2028. Stack: plain HTML + Tailwind CDN + vanilla JS, no build step, deployed to Vercel (`portfolio-foodine458s-projects.vercel.app`), GitHub repo `FooDine458/portfolio`.

Current sections: Hero → About → Skills → Projects (7 real GitHub projects, see §5) → Contact (fake-submit form) → Footer.

Design language already in place: near-black background (`#0b0f14`), one accent color — lime `#c8ff00` — Syne for display type, JetBrains Mono for body, custom cursor, noise-canvas overlay, scroll-reveal animations, sticky header with active-section highlighting. This is **not generic AI slop** — it already avoids the purple-gradient/Inter/three-card-row look. Treat this as a refinement pass, not a rebuild.

## 2. Goal

Take this from "solid student portfolio" to "portfolio that gets an internship interview." Audience: hiring managers and recruiters scanning on mobile in under 30 seconds, then engineers doing a deeper read on desktop.

## 3. Hard constraints — do not violate

- **No framework migration.** Stay plain HTML/CSS/JS with Tailwind. Do not introduce React/Vue/a bundler.
- **Do not break the existing motion system** (scroll-reveal, custom cursor, noise canvas) unless explicitly replacing it with something better — these are the site's strongest asset, not boilerplate to rip out.
- **Test after every change**: open in a browser, check mobile width (375px) and desktop (1440px), check keyboard nav (Tab through links, contact form).
- **Small, reviewable diffs.** Don't rewrite the whole file in one shot — work section by section.
- Keep the single lime accent. Do not add a second accent color.

## 4. Known issues to fix (in priority order)

1. **Tailwind via CDN (`cdn.tailwindcss.com`) in production.** This ships the full JIT compiler to the browser and has no purge step — it's a documented "do not use in production" pattern. Recommend switching to the Tailwind CLI or a proper build step (Vite is already used in one of the linked projects, so it's a stack the author knows), or at minimum documenting this as a known tradeoff if staying zero-build is intentional.
2. **Broken LinkedIn URL.** `https://linkedin.com/in/Lim Saifudine` has a literal space in it and will 404. Needs the real LinkedIn public URL slug (ask the site owner — do not invent one).
3. **Contact form doesn't send anything.** `main.js` just fakes a success message and resets the form (`form.reset()` after `preventDefault()`) — no request ever leaves the browser. Wire it to a real endpoint (Formspree, Resend, a Vercel serverless function, or a `mailto:` fallback) or be explicit in the UI that it's not yet wired up.
4. **No favicon.** Add a branded one (the "LS" monogram from the nav brand mark is a natural source).
5. **No meta description / Open Graph tags.** Add `<meta name="description">`, `og:title`, `og:description`, `og:image` (a screenshot or the hero photo), and `twitter:card` so shared links preview correctly.
6. **No custom 404 / no "skip to content" link.** Minor but cheap accessibility and polish wins per the redesign audit checklist.
7. **Project cards are single-purpose links.** Right now each project card links to *either* the live demo *or* the GitHub repo, never both (this was a deliberate minimal-diff choice when the projects were added — see §5). If both exist for a project, consider a secondary small "Repo ↗" text link inside `.pi-meta` alongside the existing badge, without turning the whole row into a two-click target.

## 5. Projects — ground truth (do not invent or reorder without checking GitHub again)

Pulled live from `github.com/FooDine458` — 9 public repos total, 7 are portfolio-worthy:

| # | Project | Repo | Live demo | Stack |
|---|---|---|---|---|
| P.01 | Password Encryption System | `Text-Encryption` | — | Python |
| P.02 | Student Tracking System | `Java-Project` | — | Java (Maven, attendance data + CSV export) |
| P.03 | Portfolio | `portfolio` | `portfolio-foodine458s-projects.vercel.app` | HTML/CSS/JS |
| P.04 | MovieFlix | `movieflix` | `movieflix-vert-sigma.vercel.app` | React + Vite |
| P.05 | DishGenie | `DishGenie` | — | Flutter/Dart + Python scraping |
| P.06 | Khmer Proverbs Archive | `khmer-proverbs-archive` | `khmer-proverbs-archive.vercel.app` | JavaScript, ICT 340 coursework |
| P.07 | Sudoku Solver | `Sudoku` | — | Java, backtracking vs. MRV heuristic |

Deliberately **excluded**: `vibe_code` (a coursework dump — currently just holds `AUPP_SPRING_2026/DSA` assignment files, not a standalone project) and `balloon_animation` (a tiny Flutter animation exercise, no README, minimal content). If either grows into something with a real README and purpose, re-run the GitHub check (`https://api.github.com/users/FooDine458/repos`) and add it the same way.

When new repos are pushed, re-fetch that endpoint rather than assuming this table is still current — it's a snapshot from 2026-08-21.

## 6. Design audit checklist (apply where it still applies)

The site is already past most of the generic-AI-slop failure modes. What's worth double-checking on a fresh pass:

- **Typography**: headline tracking/weight already strong (Syne, tight tracking). Check body-copy line length stays ≈65ch (currently `max-w-[44ch]` in hero, good).
- **Color**: single lime accent, dark neutral background — keep it that way. Don't let a second "AI blue" sneak in via a copy-pasted icon color.
- **Layout**: hero uses asymmetric `1fr_.75fr` grid, not three even columns — good, keep varying column ratios across sections rather than defaulting to equal thirds.
- **Motion**: uses `transform`/`opacity` for reveal animation (GPU-friendly) — keep new animations on the same properties, not `top`/`left`/`width`.
- **States**: hover/active states exist on buttons and project rows — verify every new interactive element gets the same treatment (hover shift, focus ring, active-press feedback).
- **Content**: copy is specific (real GPA, real dates, real project names) — no Lorem Ipsum, no "Acme Corp" placeholders. Keep it that way for anything new.

## 7. What "done" looks like

- Every link on the page resolves (no `#`, no broken LinkedIn URL).
- Contact form either sends real messages or clearly says it doesn't yet.
- Lighthouse (mobile) accessibility ≥ 95, no console errors.
- Site still opens correctly at 375px and 1440px widths with the existing animations intact.
- Every project card points at real, working URLs (verified against the table in §5, not memory).
