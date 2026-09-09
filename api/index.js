import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let appPromise;

module.exports = async function handler(req, res) {
  try {
    if (!appPromise) {
      const { startServer } = require('../dist/server.cjs');
      appPromise = startServer();
    }
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    console.error('Unable to initialize Vercel API:', error);
    res.status(500).json({
      error: 'Server initialization failed.',
      detail: error instanceof Error ? error.message : 'Unknown initialization error.',
    });
  }
};
