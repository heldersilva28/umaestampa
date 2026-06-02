import { Injectable } from '@angular/core';

const APP_SECRET = 'umaestampa-jwt-secret-key-2024';

function base64urlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  return atob(pad ? padded + '='.repeat(4 - pad) : padded);
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return base64urlEncode(String.fromCharCode(...new Uint8Array(sig)));
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  async sign(payload: Record<string, unknown>, expiresInDays = 30): Promise<string> {
    const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      ...payload,
      iat: now,
      exp: now + expiresInDays * 86400,
    };
    const body = base64urlEncode(JSON.stringify(claims));
    const sig = await hmacSha256(APP_SECRET, `${header}.${body}`);
    return `${header}.${body}.${sig}`;
  }

  async verify(token: string): Promise<Record<string, unknown> | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, sig] = parts;
      const expectedSig = await hmacSha256(APP_SECRET, `${header}.${body}`);
      if (sig !== expectedSig) return null;
      const claims = JSON.parse(base64urlDecode(body)) as Record<string, unknown>;
      if (typeof claims['exp'] === 'number' && claims['exp'] < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return claims;
    } catch {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return sha256(`umaestampa:${password}`);
  }
}
