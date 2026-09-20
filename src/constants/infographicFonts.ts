export const INFOGRAPHIC_FONT_OPTIONS = [
  'Inter, Arial, sans-serif',
  'Roboto, Arial, sans-serif',
  'Montserrat, Arial, sans-serif',
  'Manrope, Arial, sans-serif',
  'Oswald, Arial, sans-serif',
  '"PT Serif", Georgia, serif',
  '"JetBrains Mono", ui-monospace, monospace',
] as const;

export type InfographicFontOption = (typeof INFOGRAPHIC_FONT_OPTIONS)[number];

export const DEFAULT_INFOGRAPHIC_FONT: InfographicFontOption = INFOGRAPHIC_FONT_OPTIONS[0];

export function infographicFontPrimaryName(stack: string): string {
  return stack.split(',')[0]?.replace(/['"]/g, '').trim() ?? '';
}

const FONT_BY_PRIMARY = new Map(
  INFOGRAPHIC_FONT_OPTIONS.map((stack) => [
    infographicFontPrimaryName(stack).toLowerCase(),
    stack,
  ])
);

const LEGACY_FONT_MAP: Record<string, InfographicFontOption> = {
  'times new roman': '"PT Serif", Georgia, serif',
  times: '"PT Serif", Georgia, serif',
  'courier new': '"JetBrains Mono", ui-monospace, monospace',
  courier: '"JetBrains Mono", ui-monospace, monospace',
  arial: DEFAULT_INFOGRAPHIC_FONT,
  helvetica: DEFAULT_INFOGRAPHIC_FONT,
  georgia: '"PT Serif", Georgia, serif',
};

export function normalizeInfographicFont(fontFamily?: string | null): InfographicFontOption {
  if (!fontFamily?.trim()) return DEFAULT_INFOGRAPHIC_FONT;
  const key = infographicFontPrimaryName(fontFamily).toLowerCase();
  const known = FONT_BY_PRIMARY.get(key);
  if (known) return known;
  return LEGACY_FONT_MAP[key] ?? DEFAULT_INFOGRAPHIC_FONT;
}

export async function ensureInfographicFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;

  const families = INFOGRAPHIC_FONT_OPTIONS.map((stack) => infographicFontPrimaryName(stack));
  await Promise.all(
    families.flatMap((family) => {
      const quoted = family.includes(' ') ? `"${family}"` : family;
      return [
        document.fonts.load(`400 16px ${quoted}`),
        document.fonts.load(`700 16px ${quoted}`),
        document.fonts.load(`italic 400 16px ${quoted}`),
      ];
    })
  );
  await document.fonts.ready;
}
