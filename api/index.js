import { randomUUID } from 'node:crypto';

let appPromise;

export default async function handler(req, res) {
  try {
    if (!appPromise) {
      const { startServer } = await import('../dist/server.cjs');
      appPromise = startServer();
    }
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    const errorId = randomUUID();
    console.error(`Unable to initialize Vercel API [${errorId}]:`, error);
    res.status(500).json({ error: 'Server initialization failed.', error_id: errorId });
  }
}
