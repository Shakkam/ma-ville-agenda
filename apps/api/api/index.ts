// Vercel serverless entrypoint. Vercel turns files in /api into serverless
// functions; the Express app is itself a (req, res) handler, so we re-export it.
// vercel.json rewrites every path to this function, and Express routes the
// original URL (e.g. /api/events) internally.
import app from '../src/app.js';

export default app;
