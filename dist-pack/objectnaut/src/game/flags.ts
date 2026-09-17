/**
 * Objectnaut property bits.
 *
 * Every spawned noun is a pile of these flags, merged from its category path
 * plus adjectives. The inspector prints PROP_LABELS. Gameplay (burn, float,
 * hunt, sleep-eligibility) should `has(def.props, P.X)` — do not special-case
 * noun ids except for art (cat/lion/otto sprites) and a few interactions.
 *
 * Sleeping is NOT a bit. It is Entity.sleeping. See DESIGN.md.
 */
export const P = {
  Flammable: 1 << 0,
  Buoyant: 1 << 1,
  Conductive: 1 << 2,
  Edible: 1 << 3,
  Alive: 1 << 4,
  Flying: 1 << 5,
  Heavy: 1 << 6,
  Sharp: 1 << 7,
  Explosive: 1 << 8,
  Container: 1 << 9,
  Vehicle: 1 << 10,
  Hot: 1 << 11,
  Cold: 1 << 12,
  Wet: 1 << 13,
  Magnetic: 1 << 14,
  Organic: 1 << 15,
  Tool: 1 << 16,
  Weapon: 1 << 17,
  Light: 1 << 18,
  Predator: 1 << 19,
  Prey: 1 << 20,
  Human: 1 << 21,
  Plant: 1 << 22,
  Liquid: 1 << 23,
  Rideable: 1 << 24,
  Sticky: 1 << 25,
  Electric: 1 << 26,
  Monster: 1 << 27,
  Food: 1 << 28,
  Static: 1 << 29,
} as const;

export type PropBit = (typeof P)[keyof typeof P];

export const PROP_LABELS: { bit: number; label: string }[] = [
  { bit: P.Flammable, label: "flammable" },
  { bit: P.Buoyant, label: "buoyant" },
  { bit: P.Conductive, label: "conductive" },
  { bit: P.Edible, label: "edible" },
  { bit: P.Alive, label: "alive" },
  { bit: P.Flying, label: "flying" },
  { bit: P.Heavy, label: "heavy" },
  { bit: P.Sharp, label: "sharp" },
  { bit: P.Explosive, label: "explosive" },
  { bit: P.Container, label: "container" },
  { bit: P.Vehicle, label: "vehicle" },
  { bit: P.Hot, label: "hot" },
  { bit: P.Cold, label: "cold" },
  { bit: P.Wet, label: "wet" },
  { bit: P.Magnetic, label: "magnetic" },
  { bit: P.Organic, label: "organic" },
  { bit: P.Tool, label: "tool" },
  { bit: P.Weapon, label: "weapon" },
  { bit: P.Light, label: "light" },
  { bit: P.Predator, label: "predator" },
  { bit: P.Prey, label: "prey" },
  { bit: P.Human, label: "human" },
  { bit: P.Plant, label: "plant" },
  { bit: P.Liquid, label: "liquid" },
  { bit: P.Rideable, label: "rideable" },
  { bit: P.Sticky, label: "sticky" },
  { bit: P.Electric, label: "electric" },
  { bit: P.Monster, label: "monster" },
  { bit: P.Food, label: "food" },
];

export function has(props: number, bit: number) {
  return (props & bit) !== 0;
}

export function propList(props: number): string[] {
  return PROP_LABELS.filter((p) => has(props, p.bit)).map((p) => p.label);
}
