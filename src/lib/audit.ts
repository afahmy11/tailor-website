import { prisma } from './prisma';

// Redact obvious PII before persisting to the audit log.
function redact(meta?: Record<string, unknown>) {
  if (!meta) return undefined;
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (/email|phone|address|measure|name/i.test(k)) clone[k] = '[redacted]';
    else clone[k] = v;
  }
  return clone;
}

export async function audit(params: {
  actor?: string | null;
  action: string;
  target?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actor: params.actor ?? 'system',
        action: params.action,
        target: params.target ?? null,
        ip: params.ip ?? null,
        meta: redact(params.meta) as any,
      },
    });
  } catch {
    // never let audit failures break the request path
  }
}
