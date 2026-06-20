import crypto from 'crypto';

// AES-256-GCM field encryption for PII at rest (measurements, addresses).
function key(): Buffer {
  const raw = process.env.FIELD_ENCRYPTION_KEY ?? '';
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) {
    throw new Error('FIELD_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  }
  return buf;
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decrypt(payload: string): string {
  const [ivb, tagb, datab] = payload.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivb, 'base64'));
  decipher.setAuthTag(Buffer.from(tagb, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(datab, 'base64')), decipher.final()]).toString('utf8');
}

export const encryptJSON = (v: unknown) => encrypt(JSON.stringify(v));
export function decryptJSON<T>(s: string): T {
  return JSON.parse(decrypt(s)) as T;
}
