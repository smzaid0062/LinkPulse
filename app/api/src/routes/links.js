import { Router } from 'express';
import { Link } from '../models/Link.js';
import { generateCode } from '../utils/code.js';

const router = Router();
const BASE_URL = () => (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export const toDto = (l) => ({
  code: l.code,
  shortUrl: `${BASE_URL()}/${l.code}`,
  longUrl: l.longUrl,
  clicks: l.clicks,
  createdAt: l.createdAt,
  lastClickedAt: l.lastClickedAt,
});

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// POST /api/links  { url }
router.post('/', async (req, res, next) => {
  try {
    const { url } = req.body ?? {};
    if (typeof url !== 'string' || !isValidHttpUrl(url.trim())) {
      return res.status(400).json({ error: 'Valid http/https URL daalo (e.g. https://example.com)' });
    }
    if (url.length > 2048) {
      return res.status(400).json({ error: 'URL bahut lamba hai (max 2048 chars)' });
    }

    // Collision aaye (duplicate key) to naya code try karo
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const link = await Link.create({ code: generateCode(), longUrl: url.trim() });
        return res.status(201).json(toDto(link));
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
    return res.status(500).json({ error: 'Short code generate nahi ho paya, dobara try karo' });
  } catch (err) {
    next(err);
  }
});

// GET /api/links  -> latest 10
router.get('/', async (_req, res, next) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 }).limit(10);
    res.json(links.map(toDto));
  } catch (err) {
    next(err);
  }
});

// GET /api/links/:code/stats
router.get('/:code/stats', async (req, res, next) => {
  try {
    const link = await Link.findOne({ code: req.params.code });
    if (!link) return res.status(404).json({ error: 'Link nahi mila' });
    res.json(toDto(link));
  } catch (err) {
    next(err);
  }
});

export default router;
