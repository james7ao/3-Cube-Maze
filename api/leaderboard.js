// Cube Maze — Daily leaderboard (PROTOTYPE serverless function).
//
// Storage: Vercel KV (@vercel/kv) when KV env vars are present; otherwise an
// in-memory Map — fine for `vercel dev` / a single instance, but it resets on
// every cold start, so KV is required for a real shared leaderboard.
//
//   GET  /api/leaderboard?day=YYYYMMDD       -> { day, scores:[{name,moves,ts}] }
//   POST /api/leaderboard  {day,name,moves}  -> { ok, rank, scores }
//
// Scores are ranked by moves ascending (fewer is better); one entry per name
// (their best). Top 50 kept per day, top 10 returned. See LEADERBOARD.md.

let kv = null;
try { ({ kv } = require('@vercel/kv')); } catch (_) { /* not installed locally */ }
const hasKV = !!(kv && process.env.KV_REST_API_URL);

const mem = new Map();                       // day -> scores[]  (fallback only)
const KEY = (day) => `cm:daily:${day}`;
const validDay = (d) => /^\d{8}$/.test(String(d || ''));
const cleanName = (s) =>
  String(s || '').replace(/[<>\n\r&]/g, '').trim().slice(0, 16) || 'Anon';

async function readScores(day) {
  if (hasKV) return (await kv.get(KEY(day))) || [];
  return mem.get(day) || [];
}
async function writeScores(day, scores) {
  if (hasKV) await kv.set(KEY(day), scores, { ex: 60 * 60 * 24 * 14 }); // 14-day TTL
  else mem.set(day, scores);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const day = req.query && req.query.day;
      if (!validDay(day)) return res.status(400).json({ error: 'bad day' });
      const scores = (await readScores(day)).slice(0, 10);
      return res.status(200).json({ day, scores });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : (req.body || {});
      const day = body.day;
      const name = cleanName(body.name);
      const moves = Math.floor(Number(body.moves));
      if (!validDay(day) || !Number.isFinite(moves) || moves <= 0 || moves > 9999) {
        return res.status(400).json({ error: 'bad payload' });
      }

      const scores = await readScores(day);
      const mine = scores.find((s) => s.name === name);
      if (mine) { if (moves < mine.moves) { mine.moves = moves; mine.ts = Date.now(); } }
      else { scores.push({ name, moves, ts: Date.now() }); }

      scores.sort((a, b) => a.moves - b.moves || a.ts - b.ts);
      const trimmed = scores.slice(0, 50);
      await writeScores(day, trimmed);

      const rank = trimmed.findIndex((s) => s.name === name) + 1;
      return res.status(200).json({ ok: true, rank, scores: trimmed.slice(0, 10) });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (_) {
    return res.status(500).json({ error: 'server error' });
  }
};
