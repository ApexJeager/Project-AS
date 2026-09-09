import type { VercelRequest, VercelResponse } from '@vercel/node';

type ExpressApp = (req: VercelRequest, res: VercelResponse) => void;
let appPromise: Promise<ExpressApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    appPromise ??= import('../server').then(({ startServer }) => startServer());
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    console.error('Unable to initialize Vercel API:', error);
    res.status(500).json({
      error: 'Server initialization failed.',
      detail: error instanceof Error ? error.message : 'Unknown initialization error.',
    });
  }
}
