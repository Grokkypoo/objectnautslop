/**
 * Levels are scenery lists: platforms, water sensors, pre-spawns, spark goal,
 * gates + buttons. Playground is the sandbox (budget 28, width 2400).
 * Puzzle levels teach flags (sleeping lion, water, magnets) without a tutorial.
 */
export type Scenery =
  | { kind: "platform"; x: number; y: number; w: number; h: number }
  | { kind: "water"; x: number; y: number; w: number; h: number }
  | { kind: "spawn"; name: string; x: number; y: number }
  | { kind: "spark"; x: number; y: number }
  | { kind: "gate"; id: string; x: number; y: number; w: number; h: number }
  | { kind: "button"; x: number; y: number; w: number; h: number; opens: string };

export type Level = {
  id: string;
  title: string;
  blurb: string;
  hint: string;
  par: number;
  budget: number;
  width: number;
  startX: number;
  startY: number;
  scenery: Scenery[];
};

export const LEVELS: Level[] = [
  {
    id: "playground",
    title: "Playground",
    blurb: "No goal. Write anything and watch the rules collide.",
    hint: "Try giant balloon, fire, wooden box, cop, donut.",
    par: 0,
    budget: 28,
    width: 2400,
    startX: 220,
    startY: 520,
    scenery: [
      { kind: "platform", x: 1200, y: 700, w: 2400, h: 80 },
      { kind: "platform", x: 620, y: 540, w: 220, h: 24 },
      { kind: "platform", x: 1100, y: 430, w: 180, h: 24 },
      { kind: "water", x: 1750, y: 670, w: 380, h: 90 },
      { kind: "spawn", name: "tree", x: 420, y: 586 },
      { kind: "spawn", name: "box", x: 300, y: 640 },
    ],
  },
  {
    id: "tree",
    title: "Up a Tree",
    blurb: "The spark is stuck in the branches.",
    hint: "A ladder works. So does an axe. So does a balloon.",
    par: 1,
    budget: 6,
    width: 1400,
    startX: 180,
    startY: 520,
    scenery: [
      { kind: "platform", x: 700, y: 700, w: 1400, h: 80 },
      { kind: "spawn", name: "tree", x: 720, y: 586 },
      { kind: "spark", x: 720, y: 500 },
    ],
  },
  {
    id: "crossing",
    title: "The Crossing",
    blurb: "Water, a shark, and a spark on the far bank.",
    hint: "Boats float. Wings fly. Anvils do not.",
    par: 1,
    budget: 6,
    width: 1800,
    startX: 160,
    startY: 520,
    scenery: [
      { kind: "platform", x: 280, y: 700, w: 560, h: 80 },
      { kind: "platform", x: 1520, y: 700, w: 560, h: 80 },
      { kind: "water", x: 900, y: 710, w: 680, h: 100 },
      { kind: "spawn", name: "shark", x: 900, y: 660 },
      { kind: "spark", x: 1580, y: 620 },
    ],
  },
  {
    id: "bars",
    title: "Behind Bars",
    blurb: "The spark is caged. The switch is not.",
    hint: "Weight on the button. Fly, stack, or drop an anvil.",
    par: 2,
    budget: 8,
    width: 1600,
    startX: 160,
    startY: 520,
    scenery: [
      { kind: "platform", x: 800, y: 700, w: 1600, h: 80 },
      { kind: "platform", x: 1180, y: 560, w: 280, h: 20 },
      { kind: "gate", id: "cage", x: 1320, y: 500, w: 22, h: 320 },
      { kind: "gate", id: "cage", x: 1480, y: 500, w: 22, h: 320 },
      { kind: "platform", x: 1400, y: 330, w: 180, h: 20 },
      { kind: "button", x: 480, y: 652, w: 70, h: 14, opens: "cage" },
      { kind: "spark", x: 1400, y: 500 },
      { kind: "spawn", name: "box", x: 360, y: 640 },
    ],
  },
  {
    id: "lion",
    title: "Sleeping Lion",
    blurb: "Walk past it, distract it, or don't.",
    hint: "A sleeping lion stays put. A steak helps. A cop is a bad idea.",
    par: 1,
    budget: 7,
    width: 1700,
    startX: 140,
    startY: 520,
    scenery: [
      { kind: "platform", x: 850, y: 700, w: 1700, h: 80 },
      { kind: "spawn", name: "sleeping lion", x: 820, y: 640 },
      { kind: "spark", x: 1480, y: 620 },
    ],
  },
  {
    id: "firewall",
    title: "Through the Fire",
    blurb: "A wall of flame between you and the spark.",
    hint: "Water puts fire out. Ice melts. A wooden plank will not last.",
    par: 1,
    budget: 6,
    width: 1500,
    startX: 150,
    startY: 520,
    scenery: [
      { kind: "platform", x: 750, y: 700, w: 1500, h: 80 },
      { kind: "spawn", name: "fire", x: 700, y: 640 },
      { kind: "spawn", name: "fire", x: 740, y: 640 },
      { kind: "spawn", name: "fire", x: 780, y: 640 },
      { kind: "spark", x: 1240, y: 620 },
    ],
  },
];
