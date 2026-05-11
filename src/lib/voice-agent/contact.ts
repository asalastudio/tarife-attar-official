import crypto from 'crypto';

export interface ContactInput {
  email?: string | null;
  phone?: string | null;
}

export interface ContactCandidates {
  emails?: Array<string | null | undefined>;
  phones?: Array<string | null | undefined>;
}

export function normalizeEmail(email?: string | null): string | undefined {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || undefined;
}

export function normalizePhoneDigits(phone?: string | null): string | undefined {
  const digits = phone?.replace(/\D/g, '');
  if (!digits) return undefined;
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

export function toE164US(phone?: string | null): string | undefined {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return undefined;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length > 10 && phone?.trim().startsWith('+')) {
    return `+${phone.replace(/\D/g, '')}`;
  }
  return undefined;
}

export function emailMatches(provided?: string | null, candidate?: string | null): boolean {
  const a = normalizeEmail(provided);
  const b = normalizeEmail(candidate);
  return !!a && !!b && a === b;
}

export function phoneMatches(provided?: string | null, candidate?: string | null): boolean {
  const a = normalizePhoneDigits(provided);
  const b = normalizePhoneDigits(candidate);
  if (!a || !b) return false;
  return a === b || (a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10));
}

export function contactMatches(input: ContactInput, candidates: ContactCandidates): boolean {
  const emailOk = candidates.emails?.some((candidate) => emailMatches(input.email, candidate));
  const phoneOk = candidates.phones?.some((candidate) => phoneMatches(input.phone, candidate));
  return !!emailOk || !!phoneOk;
}

export function hashContact(input: ContactInput): string | undefined {
  const email = normalizeEmail(input.email);
  const phone = normalizePhoneDigits(input.phone);
  const value = email || phone;
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function redactEmail(email?: string | null): string | undefined {
  const normalized = normalizeEmail(email);
  if (!normalized) return undefined;
  const [local, domain] = normalized.split('@');
  if (!local || !domain) return normalized;
  const visible = local.length <= 2 ? local[0] : `${local[0]}${local.slice(-1)}`;
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

export function redactPhone(phone?: string | null): string | undefined {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return undefined;
  return `***-***-${digits.slice(-4)}`;
}
