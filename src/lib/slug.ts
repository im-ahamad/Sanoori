/**
 * Safe slug generation and normalization shared by the admin product form and
 * the server-side validators.
 *
 * The client uses `slugify()` for live preview; the server re-normalizes with
 * `normalizeSlug()` before persisting so the database value never depends on
 * client-side code alone.
 */

const NON_LATIN =
  /[\u0300-\u036f\u007f-\u023f\u0250-\u02af\u0370-\u1fff\u2000-\u2bff\ue000-\uf8ff\ufe30-\uffff]/g;

/**
 * Convert any string into a URL-safe slug. Unsafe characters are stripped,
 * runs of separators are collapsed, and the result is lowercased.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(NON_LATIN, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** Strict server-side normalization; rejects strings that cannot form a safe slug. */
export function normalizeSlug(input: string): string {
  return slugify(input);
}

export function isSafeSlug(input: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input);
}