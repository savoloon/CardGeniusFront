/** Зоны из ML (InfographicPosition) → центр в процентах относительно контейнера изображения */
export const ZONE_CENTERS: Record<string, { x: number; y: number }> = {
  top_left: { x: 18, y: 14 },
  top_center: { x: 50, y: 14 },
  top_right: { x: 82, y: 14 },
  middle_left: { x: 18, y: 50 },
  middle_right: { x: 82, y: 50 },
  bottom_left: { x: 18, y: 86 },
  bottom_center: { x: 50, y: 86 },
  bottom_right: { x: 82, y: 86 },
};

export function getZoneCenter(position: string): { x: number; y: number } {
  return ZONE_CENTERS[position] ?? { x: 50, y: 50 };
}

export type InfographicPositionKey = keyof typeof ZONE_CENTERS;
