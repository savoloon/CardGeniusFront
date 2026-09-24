import { describe, expect, it } from 'vitest';
import { getZoneCenter } from './infographicZones';

describe('getZoneCenter', () => {
  it('returns known zone centers', () => {
    expect(getZoneCenter('top_left')).toEqual({ x: 18, y: 14 });
    expect(getZoneCenter('bottom_right')).toEqual({ x: 82, y: 86 });
  });

  it('falls back to image center for unknown positions', () => {
    expect(getZoneCenter('unknown_zone')).toEqual({ x: 50, y: 50 });
  });
});
