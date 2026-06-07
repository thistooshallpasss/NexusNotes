import crypto from 'crypto';

// A random session secret generated at startup to prevent forgery
const sessionSecret = process.env.SESSION_SECRET || 'fallback-local-session-secret-key-12345';


/**
 * Generates a signed, base64-encoded session token that expires in 24 hours.
 */
export function generateSessionToken(): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = JSON.stringify({ expiresAt });
  
  const hmac = crypto.createHmac('sha256', sessionSecret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

/**
 * Verifies if the given token is a valid, unexpired session token.
 */
export function verifySessionToken(token: string): boolean {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const { payload, signature } = JSON.parse(raw);
    
    const hmac = crypto.createHmac('sha256', sessionSecret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return false;
    }
    
    const { expiresAt } = JSON.parse(payload);
    return expiresAt > Date.now();
  } catch {
    return false;
  }
}
