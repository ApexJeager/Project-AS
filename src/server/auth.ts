import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  color_group: string | null;
}

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const configuredSecret = process.env.AUTH_SECRET?.trim();
if (process.env.NODE_ENV === 'production' && !configuredSecret) {
  throw new Error('AUTH_SECRET must be configured in production.');
}
const tokenSecret = configuredSecret || randomBytes(32).toString('hex');

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(pin, salt, 32, { N: 16_384, r: 8, p: 1 }).toString('hex');
  return `scrypt$16384$8$1$${salt}$${derived}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  if (!stored.startsWith('scrypt$')) return stored === pin;
  const [, n, r, p, salt, expected] = stored.split('$');
  try {
    const actual = scryptSync(pin, salt, 32, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    const expectedBuffer = Buffer.from(expected, 'hex');
    return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
  } catch {
    return false;
  }
}

export function createToken(user: AuthUser): string {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  })).toString('base64url');
  const signature = createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): { id: string; role: string } | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.sub || !parsed.role || !Number.isFinite(parsed.exp) || parsed.exp < Date.now() / 1000) {
      return null;
    }
    return { id: parsed.sub, role: parsed.role };
  } catch {
    return null;
  }
}
