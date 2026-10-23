import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import linksRouter from './routes/links.js';
import { Link } from './models/Link.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linkpulse';

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Health check (used by Docker and Kubernetes probes)
app.get('/health', (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', db: dbUp });
});

app.use('/api/links', linksRouter);

// Redirect: GET /aB3xK9 -> 302 -> longUrl (302 so every click reaches the server)
app.get('/:code([0-9A-Za-z]{4,12})', async (req, res, next) => {
  try {
    const link = await Link.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } }
    );
    if (!link) return res.status(404).json({ error: 'Link nahi mila' });
    res.redirect(302, link.longUrl);
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
  const server = app.listen(PORT, () => console.log(`API listening on :${PORT}`));

  const shutdown = async () => {
    console.log('Shutting down...');
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
