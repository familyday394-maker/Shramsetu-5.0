/**
 * Builds the public verification URL for a pass.
 *
 * On the hosted site this is an absolute link so a scanned QR code can be
 * opened by someone else. When the same build is opened straight from disk
 * (`file://`, as in the offline single-file edition) there is no usable
 * origin — `location.origin` reports the string "null" — so we fall back to a
 * relative hash link that still resolves inside the current document.
 */
export function buildVerifyUrl(token: string): string {
  const safe = encodeURIComponent(token || '');
  const fallback = `https://shramsetu.in/#/verify?refToken=${safe}`;

  if (typeof window === 'undefined') return fallback;

  const origin = window.location.origin;
  if (/^https?:\/\//i.test(origin)) return `${origin}/#/verify?refToken=${safe}`;

  // Opened from disk (the offline single-file edition): a QR code needs a real
  // absolute URL to be scannable, so point at the canonical public address.
  return `https://shramsetu.in/#/verify?refToken=${safe}`;
}
