# Daily Leaderboard — prototype

A global leaderboard for the **Daily Challenge**: everyone plays the same
seeded maze each day, and the completion screen shows the day's lowest move
counts. This is wired up but **off by default** so it can't affect the live
static site until you deliberately turn it on.

## What's included

| Piece | File | Role |
|---|---|---|
| Serverless API | [api/leaderboard.js](api/leaderboard.js) | `GET`/`POST` daily scores; Vercel KV storage with an in-memory fallback |
| Client hooks | [index.html](index.html) | `submitDailyLeaderboard()` posts your score on a Daily clear and renders the top 10 into the toast |
| Feature flag | `LEADERBOARD_ENDPOINT` in `index.html` | `''` = disabled (default). Set to `'/api/leaderboard'` to enable |

While disabled, `submitDailyLeaderboard()` is a no-op and the Daily screen
looks exactly as it does today.

## Try it locally

```bash
npm i -g vercel          # if not already installed
vercel dev               # serves index.html + runs /api/leaderboard
```

Temporarily set `LEADERBOARD_ENDPOINT='/api/leaderboard'` in `index.html`,
open the local URL, and clear a Daily. Scores persist in memory for the life
of the dev process (they reset when it restarts — that's expected without KV).

## Ship it for real (persistent, shared)

The in-memory store resets on every serverless cold start, so production needs
a datastore. Vercel KV (Upstash Redis) is the least-effort option:

1. **Provision KV** — Vercel dashboard → your `cube-maze` project → **Storage**
   → create a **KV** database and connect it. This auto-injects
   `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars; `api/leaderboard.js`
   detects them automatically.
2. **Add the dependency** — `npm i @vercel/kv` (needs a `package.json` in what
   gets deployed).
3. **Let the function + its deps deploy.** The current
   [.vercelignore](.vercelignore) ships *only* `index.html`, `three.min.js`,
   and `vercel.json`, so `api/` is currently excluded. Un-ignore it and include
   `package.json`:

   ```
   !api/**
   !package.json
   ```

   > ⚠️ This changes the deploy from pure-static to one that runs `npm install`
   > for the function. Test with `vercel --prod` from the CLI and confirm the
   > site + `/api/leaderboard` both work before relying on it.
4. **Enable the flag** — set `LEADERBOARD_ENDPOINT='/api/leaderboard'` in
   `index.html` and deploy.

## Notes & follow-ups

- **No anti-cheat.** Scores are trusted from the client — fine for a friendly
  board, not for anything competitive. A real version would validate the solve
  server-side (replay the seed) or sign submissions.
- **Names** are stored in `localStorage` (`cubeMazeName`); click the ✎ pill on
  the leaderboard to rename. No accounts.
- Weekly mode ([weekKey](index.html)) could reuse the same endpoint with a
  `week` key instead of `day`.
