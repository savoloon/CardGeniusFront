export function formatLocaleDateTime(iso: string, locale?: string): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}
