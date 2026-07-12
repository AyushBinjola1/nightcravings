/** Builds a `wa.me` deep link — the "Message the store" pattern specified
 * throughout Phase 2 (Profile's Support row, Search's empty-result
 * fallback, Store Closed's escalation link). India-only per the phone
 * schema this product already validates against (`phoneSchema`). */
export function buildWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/91${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
