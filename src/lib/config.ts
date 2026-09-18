export function isConfigPlaceholder(value: string | undefined | null): boolean {
  if (!value) return true;
  return /^\[.*\]$/.test(value.trim());
}