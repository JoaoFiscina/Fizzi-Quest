export const BASE_MOVEMENT_CAP = 100; // world pixels per second, before Impulso
export function movementSpeed(agility: number, impulseBonus = 0): number {
  const base = Math.min(BASE_MOVEMENT_CAP, 56 + Math.max(0, agility) * 1.2);
  return base * (1 + Math.max(0, impulseBonus));
}
