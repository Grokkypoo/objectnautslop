/**
 * Objectnaut dictionary.
 *
 * Nouns (`OBJECTS`) carry a dotted category path. `resolveObject` walks that
 * path, OR-ing flags and concatenating hunt/fear/eat/like, then adjectives
 * mutate the resolved def (giant, flying, hot, …).
 *
 * Parse is longest-suffix noun: "tiny sleeping lion" → noun lion, adjectives
 * tiny+sleeping. Unknown leftover tokens are ignored.
 *
 * IMPORTANT: the "sleeping" adjective is a spawn marker only. It must not
 * empty hunt/fear. The engine sets Entity.sleeping from it. Wake restores
 * temperament via OBJECTS+ADJECTIVES minus sleeping.
 */
import { has, P } from "./flags";

export type DrawKind =
  | "person"
  | "quad"
  | "bird"
  | "fish"
  | "bug"
  | "box"
  | "round"
  | "plank"
  | "ladder"
  | "balloon"
  | "flame"
  | "drop"
  | "vehicle"
  | "tree"
  | "star"
  | "weapon"
  | "food"
  | "rope"
  | "plant"
  | "boat"
  | "plane"
  | "cloud"
  | "anvil"
  | "magnet";

export type ShapeKind = "box" | "circle";

export type CategoryNode = {
  props?: number;
  material?: string;
  hunt?: string[];
  fear?: string[];
  eat?: string[];
  like?: string[];
};

export type ObjectDef = {
  id: string;
  names: string[];
  category: string;
  w: number;
  h: number;
  mass: number;
  color: string;
  ink?: string;
  shape: ShapeKind;
  draw: DrawKind;
  extra?: number;
  hunt?: string[];
  fear?: string[];
  eat?: string[];
  like?: string[];
  hp?: number;
};

export type ResolvedDef = ObjectDef & {
  props: number;
  material: string;
  path: string[];
  hunt: string[];
  fear: string[];
  eat: string[];
  like: string[];
  hp: number;
};

export type Adjective = {
  id: string;
  names: string[];
  apply: (d: ResolvedDef) => void;
};

export const CATEGORIES: Record<string, CategoryNode> = {
  living: { props: P.Alive },
  "living.animal": { props: P.Alive | P.Organic },
  "living.animal.mammal": {
    props: P.Alive | P.Organic | P.Edible,
    material: "flesh",
  },
  "living.animal.mammal.predator": {
    props: P.Predator,
    hunt: ["living.animal.mammal.prey", "living.animal.prey"],
  },
  "living.animal.mammal.prey": { props: P.Prey, fear: ["living.animal.mammal.predator", "role.predator"] },
  "living.animal.bird": { props: P.Alive | P.Organic | P.Flying | P.Prey },
  "living.animal.fish": { props: P.Alive | P.Organic | P.Buoyant },
  "living.animal.bug": { props: P.Alive | P.Organic | P.Flying | P.Prey },
  "living.person": {
    props: P.Alive | P.Human | P.Organic,
    eat: ["role.food"],
    fear: ["role.monster", "living.animal.mammal.predator"],
  },
  "living.plant": { props: P.Plant | P.Flammable | P.Organic, material: "wood" },
  "role.predator": { props: P.Predator },
  "role.prey": { props: P.Prey },
  "role.food": { props: P.Food | P.Edible | P.Organic },
  "role.monster": { props: P.Monster | P.Predator },
  "role.weapon": { props: P.Weapon | P.Sharp },
  "role.tool": { props: P.Tool },
  "role.vehicle": { props: P.Vehicle | P.Rideable },
  "material.wood": { props: P.Flammable | P.Buoyant, material: "wood" },
  "material.metal": { props: P.Conductive | P.Heavy, material: "metal" },
  "material.stone": { props: P.Heavy, material: "stone" },
  "material.paper": { props: P.Flammable | P.Light, material: "paper" },
  "material.cloth": { props: P.Flammable | P.Light, material: "cloth" },
  "element.fire": { props: P.Hot | P.Light, material: "fire" },
  "element.water": { props: P.Wet | P.Liquid | P.Buoyant, material: "water" },
  "element.ice": { props: P.Cold | P.Wet, material: "ice" },
};

function o(
  id: string,
  names: string[],
  category: string,
  w: number,
  h: number,
  mass: number,
  color: string,
  shape: ShapeKind,
  draw: DrawKind,
  extra: Partial<ObjectDef> = {},
): ObjectDef {
  return { id, names, category, w, h, mass, color, shape, draw, ...extra };
}

export const OBJECTS: ObjectDef[] = [
  o("ladder", ["ladder", "stepladder"], "role.tool.material.wood", 28, 110, 1.4, "#C4A574", "box", "ladder", { extra: P.Tool | P.Flammable | P.Buoyant }),
  o("rope", ["rope", "cord", "line"], "role.tool.material.cloth", 90, 10, 0.4, "#8A6A44", "box", "rope", { extra: P.Tool | P.Sticky }),
  o("chain", ["chain"], "role.tool.material.metal", 90, 10, 1.8, "#8A8680", "box", "rope", { extra: P.Tool | P.Conductive | P.Heavy }),
  o("glue", ["glue", "adhesive"], "role.tool", 22, 28, 0.5, "#E8D9A8", "box", "box", { extra: P.Sticky | P.Tool }),
  o("balloon", ["balloon", "helium balloon", "hot air balloon"], "role.tool", 36, 48, 0.12, "#C45C3E", "circle", "balloon", { extra: P.Light | P.Buoyant | P.Flying }),
  o("anvil", ["anvil"], "material.metal", 54, 36, 8, "#4A4642", "box", "anvil", { extra: P.Heavy | P.Conductive }),
  o("rock", ["rock", "stone"], "material.stone", 36, 30, 3.2, "#8A8478", "circle", "round"),
  o("boulder", ["boulder"], "material.stone", 72, 62, 9, "#6E6860", "circle", "round", { extra: P.Heavy }),
  o("brick", ["brick"], "material.stone", 34, 18, 1.6, "#A45C48", "box", "box"),
  o("box", ["box", "crate"], "material.wood", 42, 42, 1.2, "#C4A06A", "box", "box", { extra: P.Container | P.Flammable | P.Buoyant }),
  o("plank", ["plank", "board", "wood"], "material.wood", 110, 16, 1.1, "#C4A574", "box", "plank"),
  o("log", ["log"], "material.wood", 80, 28, 2.2, "#8A5A38", "box", "plank"),
  o("stick", ["stick", "branch"], "material.wood", 70, 10, 0.3, "#8A6238", "box", "plank", { extra: P.Light }),
  o("fire", ["fire", "flame", "campfire"], "element.fire", 34, 40, 0.2, "#C45C3E", "circle", "flame", { extra: P.Hot | P.Light }),
  o("water", ["water"], "element.water", 48, 28, 1, "#6A8E9E", "box", "drop"),
  o("ice", ["ice", "ice cube"], "element.ice", 36, 36, 1.1, "#D8E4EA", "box", "box", { extra: P.Cold }),
  o("snow", ["snow"], "element.ice", 40, 22, 0.4, "#F2EEE4", "circle", "round", { extra: P.Cold | P.Light }),
  o("axe", ["axe", "hatchet"], "role.weapon.material.metal", 48, 22, 1.4, "#8A8680", "box", "weapon", { extra: P.Sharp | P.Tool }),
  o("sword", ["sword", "blade"], "role.weapon.material.metal", 70, 14, 1.3, "#C8C4BC", "box", "weapon"),
  o("hammer", ["hammer"], "role.tool.material.metal", 40, 22, 1.5, "#6A6660", "box", "weapon", { extra: P.Tool | P.Heavy }),
  o("shovel", ["shovel"], "role.tool.material.metal", 18, 70, 1.2, "#8A8680", "box", "weapon", { extra: P.Tool }),
  o("gun", ["gun", "pistol"], "role.weapon.material.metal", 40, 18, 1, "#3A3836", "box", "weapon"),
  o("bomb", ["bomb", "dynamite"], "role.weapon", 28, 36, 1.1, "#3A3836", "circle", "round", { extra: P.Explosive }),
  o("boat", ["boat", "raft", "canoe"], "role.vehicle.material.wood", 96, 32, 2.4, "#C4A06A", "box", "boat", { extra: P.Buoyant | P.Rideable | P.Vehicle }),
  o("car", ["car", "truck"], "role.vehicle.material.metal", 90, 40, 4, "#C45C3E", "box", "vehicle"),
  o("bike", ["bike", "bicycle"], "role.vehicle.material.metal", 64, 36, 1.6, "#4A4642", "box", "vehicle", { extra: P.Rideable }),
  o("plane", ["plane", "airplane"], "role.vehicle", 110, 36, 2.8, "#E8DCC8", "box", "plane", { extra: P.Flying | P.Rideable | P.Vehicle }),
  o("helicopter", ["helicopter"], "role.vehicle", 90, 40, 3, "#4F6F5A", "box", "plane", { extra: P.Flying | P.Rideable | P.Vehicle }),
  o("jetpack", ["jetpack", "rocket pack"], "role.tool", 28, 36, 1, "#8A8680", "box", "box", { extra: P.Flying | P.Tool }),
  o("wings", ["wings"], "role.tool.material.cloth", 70, 24, 0.4, "#E8DCC8", "box", "bird", { extra: P.Flying | P.Light }),
  o("lion", ["lion"], "living.animal.mammal.predator", 70, 44, 3.4, "#C4A06A", "box", "quad", { extra: P.Predator, hunt: ["living.animal.mammal.prey", "living.person"], fear: [] }),
  o("tiger", ["tiger"], "living.animal.mammal.predator", 72, 42, 3.3, "#C45C3E", "box", "quad", { extra: P.Predator, hunt: ["living.animal.mammal.prey", "living.person"] }),
  o("cat", ["cat", "kitty"], "living.animal.mammal.predator", 40, 28, 0.9, "#8A7A64", "box", "quad", { extra: P.Predator, hunt: ["living.animal.bug", "mouse"] }),
  o("dog", ["dog"], "living.animal.mammal", 48, 34, 1.4, "#8A6238", "box", "quad", { extra: P.Prey, like: ["living.person"], hunt: ["living.animal.mammal.prey"] }),
  o("mouse", ["mouse", "rat"], "living.animal.mammal.prey", 24, 16, 0.25, "#A09890", "box", "quad", { extra: P.Prey, fear: ["living.animal.mammal.predator", "cat", "living.person"] }),
  o("bird", ["bird"], "living.animal.bird", 28, 22, 0.3, "#4F6F5A", "circle", "bird"),
  o("fish", ["fish"], "living.animal.fish", 34, 18, 0.4, "#6A8E9E", "box", "fish", { extra: P.Edible | P.Food }),
  o("shark", ["shark"], "living.animal.fish", 80, 32, 3, "#6A7078", "box", "fish", { extra: P.Predator, hunt: ["living.animal.fish", "living.person"] }),
  o("bee", ["bee"], "living.animal.bug", 18, 14, 0.1, "#C4A06A", "circle", "bug", { extra: P.Flying }),
  o("elephant", ["elephant"], "living.animal.mammal", 100, 70, 8, "#A09890", "box", "quad", { extra: P.Heavy, fear: ["mouse"] }),
  o("horse", ["horse"], "living.animal.mammal", 78, 56, 4, "#8A6238", "box", "quad", { extra: P.Rideable }),
  o("wolf", ["wolf"], "living.animal.mammal.predator", 58, 38, 2.2, "#6A6660", "box", "quad", { extra: P.Predator, hunt: ["living.animal.mammal.prey", "living.person"] }),
  o("duck", ["duck"], "living.animal.bird", 32, 24, 0.5, "#C4A06A", "box", "bird", { extra: P.Buoyant | P.Prey }),
  o("bear", ["bear"], "living.animal.mammal.predator", 70, 52, 5, "#8A6238", "box", "quad", { extra: P.Predator | P.Heavy, hunt: ["living.person", "living.animal.mammal.prey"] }),
  o("cop", ["cop", "officer", "policeman", "police"], "living.person", 28, 56, 1.6, "#3A4A6A", "box", "person", { extra: P.Human, like: ["donut"], hunt: ["role.monster", "pirate"], fear: [] }),
  o("orphan", ["orphan", "child"], "living.person", 22, 44, 1.1, "#C4A06A", "box", "person", { fear: ["role.monster", "living.animal.mammal.predator", "gun"] }),
  o("scientist", ["scientist"], "living.person", 28, 56, 1.5, "#E8DCC8", "box", "person", { like: ["role.tool"] }),
  o("pirate", ["pirate"], "living.person", 28, 56, 1.6, "#4A3830", "box", "person", { extra: P.Predator, hunt: ["living.person"] }),
  o("chef", ["chef", "cook"], "living.person", 28, 56, 1.5, "#F2EEE4", "box", "person", { like: ["role.food"], eat: ["role.food"] }),
  o("hunter", ["hunter"], "living.person", 28, 56, 1.6, "#4F6F5A", "box", "person", { hunt: ["living.animal"] }),
  o("vampire", ["vampire"], "role.monster.living.person", 28, 56, 1.6, "#4A3830", "box", "person", { extra: P.Monster | P.Predator, hunt: ["living.person"], fear: ["role.food"] }),
  o("donut", ["donut", "doughnut"], "role.food", 28, 16, 0.3, "#C4A06A", "circle", "food"),
  o("steak", ["steak", "meat"], "role.food", 34, 16, 0.5, "#A45C48", "box", "food"),
  o("hamburger", ["hamburger", "burger"], "role.food", 30, 22, 0.5, "#C4A06A", "box", "food"),
  o("apple", ["apple"], "role.food.living.plant", 22, 22, 0.3, "#C45C3E", "circle", "food"),
  o("bread", ["bread"], "role.food", 32, 18, 0.3, "#D8C4A0", "box", "food"),
  o("tree", ["tree"], "living.plant", 72, 148, 4, "#4F6F5A", "box", "tree", { extra: P.Flammable | P.Static, hp: 10 }),
  o("flower", ["flower"], "living.plant", 18, 32, 0.2, "#C45C3E", "box", "plant", { extra: P.Light }),
  o("bush", ["bush"], "living.plant", 48, 32, 0.8, "#4F6F5A", "box", "plant"),
  o("magnet", ["magnet"], "material.metal", 30, 30, 1.2, "#C45C3E", "box", "magnet", { extra: P.Magnetic | P.Conductive }),
  o("battery", ["battery"], "material.metal", 16, 28, 0.5, "#4F6F5A", "box", "box", { extra: P.Electric | P.Conductive }),
  o("toaster", ["toaster"], "material.metal", 36, 24, 1.4, "#C8C4BC", "box", "box", { extra: P.Electric | P.Hot | P.Conductive }),
  o("fan", ["fan"], "role.tool.material.metal", 40, 40, 1.1, "#C8C4BC", "circle", "round", { extra: P.Tool }),
  o("umbrella", ["umbrella"], "role.tool.material.cloth", 54, 40, 0.5, "#C45C3E", "box", "plant", { extra: P.Tool | P.Light }),
  o("sponge", ["sponge"], "role.tool", 28, 22, 0.3, "#C4A06A", "box", "box", { extra: P.Wet | P.Light | P.Buoyant }),
  o("paper", ["paper", "notebook", "book"], "material.paper", 28, 34, 0.2, "#F2EEE4", "box", "box"),
  o("handcuffs", ["handcuffs", "cuffs"], "role.tool.material.metal", 34, 16, 0.7, "#8A8680", "box", "rope", { extra: P.Sticky | P.Tool }),
  o("cloud", ["cloud", "raincloud", "rain cloud"], "element.water", 70, 32, 0.2, "#E8E4DC", "circle", "cloud", { extra: P.Flying | P.Light | P.Wet }),
];

export const ADJECTIVES: Adjective[] = [
  {
    id: "giant",
    names: ["giant", "huge", "colossal", "big", "large"],
    apply: (d) => {
      d.w *= 2.15;
      d.h *= 2.15;
      d.mass *= 3.2;
      d.props |= P.Heavy;
    },
  },
  {
    id: "tiny",
    names: ["tiny", "small", "mini", "little"],
    apply: (d) => {
      d.w *= 0.48;
      d.h *= 0.48;
      d.mass *= 0.35;
      d.props |= P.Light;
    },
  },
  {
    id: "flying",
    names: ["flying", "winged", "airborne"],
    apply: (d) => {
      d.props |= P.Flying | P.Light;
    },
  },
  {
    id: "flammable",
    names: ["flammable", "burnable"],
    apply: (d) => {
      d.props |= P.Flammable;
    },
  },
  {
    id: "frozen",
    names: ["frozen", "icy"],
    apply: (d) => {
      d.props |= P.Cold | P.Wet;
      d.color = "#D8E4EA";
    },
  },
  {
    id: "hot",
    names: ["hot", "burning", "fiery"],
    apply: (d) => {
      d.props |= P.Hot;
    },
  },
  {
    id: "heavy",
    names: ["heavy"],
    apply: (d) => {
      d.mass *= 2.6;
      d.props |= P.Heavy;
    },
  },
  {
    id: "wooden",
    names: ["wooden", "wood"],
    apply: (d) => {
      d.props |= P.Flammable | P.Buoyant;
      d.material = "wood";
      d.color = "#C4A574";
    },
  },
  {
    id: "metal",
    names: ["metal", "steel", "iron"],
    apply: (d) => {
      d.props |= P.Conductive | P.Heavy;
      d.material = "metal";
      d.color = "#8A8680";
    },
  },
  {
    id: "hungry",
    names: ["hungry"],
    apply: (d) => {
      d.props |= P.Predator;
      d.hunt = [...d.hunt, "role.food", "living.person"];
    },
  },
  {
    id: "friendly",
    names: ["friendly", "kind"],
    apply: (d) => {
      d.props &= ~P.Predator;
      d.hunt = [];
      d.fear = [];
    },
  },
  {
    id: "sleeping",
    names: ["sleeping", "asleep"],
    apply: () => {
      /* Entity.sleeping is set at spawn. Do not strip hunt/fear here or Wake is a no-op. */
    },
  },
  {
    id: "wet",
    names: ["wet"],
    apply: (d) => {
      d.props |= P.Wet;
    },
  },
  {
    id: "electric",
    names: ["electric", "electric", "charged"],
    apply: (d) => {
      d.props |= P.Electric | P.Conductive;
    },
  },
  {
    id: "sticky",
    names: ["sticky"],
    apply: (d) => {
      d.props |= P.Sticky;
    },
  },
  {
    id: "sharp",
    names: ["sharp"],
    apply: (d) => {
      d.props |= P.Sharp;
    },
  },
  {
    id: "buoyant",
    names: ["buoyant", "floating"],
    apply: (d) => {
      d.props |= P.Buoyant;
    },
  },
];

const nameIndex = new Map<string, ObjectDef>();
for (const def of OBJECTS) {
  for (const n of def.names) nameIndex.set(n.toLowerCase(), def);
}

const adjIndex = new Map<string, Adjective>();
for (const a of ADJECTIVES) {
  for (const n of a.names) adjIndex.set(n.toLowerCase(), a);
}

export function allWords(): string[] {
  const set = new Set<string>();
  for (const d of OBJECTS) for (const n of d.names) set.add(n);
  for (const a of ADJECTIVES) for (const n of a.names) set.add(n);
  return [...set].sort();
}

function mergeCategory(path: string, acc: CategoryNode) {
  const parts = path.split(".");
  let walk = "";
  for (const part of parts) {
    walk = walk ? `${walk}.${part}` : part;
    const node = CATEGORIES[walk];
    if (!node) continue;
    acc.props = (acc.props ?? 0) | (node.props ?? 0);
    if (node.material) acc.material = node.material;
    if (node.hunt) acc.hunt = [...(acc.hunt ?? []), ...node.hunt];
    if (node.fear) acc.fear = [...(acc.fear ?? []), ...node.fear];
    if (node.eat) acc.eat = [...(acc.eat ?? []), ...node.eat];
    if (node.like) acc.like = [...(acc.like ?? []), ...node.like];
  }
}

/** Merge every dotted prefix of a category path into acc (Objectnaut inheritance). */
export function resolveObject(def: ObjectDef, adjectives: Adjective[] = []): ResolvedDef {
  const acc: CategoryNode = { props: 0, hunt: [], fear: [], eat: [], like: [] };
  for (const chunk of def.category.split(/(?=\b(?:living|role|material|element)\b)/).filter(Boolean)) {
    mergeCategory(chunk.replace(/^\./, ""), acc);
  }
  mergeCategory(def.category, acc);

  const resolved: ResolvedDef = {
    ...def,
    props: (acc.props ?? 0) | (def.extra ?? 0),
    material: acc.material ?? "stuff",
    path: def.category.split("."),
    hunt: [...new Set([...(acc.hunt ?? []), ...(def.hunt ?? [])])],
    fear: [...new Set([...(acc.fear ?? []), ...(def.fear ?? [])])],
    eat: [...new Set([...(acc.eat ?? []), ...(def.eat ?? [])])],
    like: [...new Set([...(acc.like ?? []), ...(def.like ?? [])])],
    hp: def.hp ?? (has((acc.props ?? 0) | (def.extra ?? 0), P.Alive) ? 4 : 6),
    w: def.w,
    h: def.h,
    mass: def.mass,
    color: def.color,
  };

  for (const a of adjectives) a.apply(resolved);
  resolved.w = Math.max(10, resolved.w);
  resolved.h = Math.max(10, resolved.h);
  resolved.mass = Math.max(0.05, resolved.mass);
  return resolved;
}

export type ParseResult =
  | { ok: true; def: ObjectDef; adjectives: Adjective[]; query: string }
  | { ok: false; query: string; suggestions: string[] };

/** Longest suffix that is a known noun; tokens before it are adjectives. */
export function parseQuery(raw: string): ParseResult {
  const query = raw.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  if (!query) return { ok: false, query, suggestions: ["ladder", "balloon", "lion", "fire"] };

  const tokens = query.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const noun = tokens.slice(i).join(" ");
    const def = nameIndex.get(noun);
    if (!def) continue;
    const adjectives: Adjective[] = [];
    for (const t of tokens.slice(0, i)) {
      const a = adjIndex.get(t);
      if (a) adjectives.push(a);
    }
    return { ok: true, def, adjectives, query };
  }

  const last = tokens[tokens.length - 1] ?? "";
  const suggestions = [...nameIndex.keys()]
    .filter((n) => n.startsWith(last) || n.includes(last))
    .slice(0, 6);
  if (suggestions.length === 0) {
    suggestions.push("ladder", "balloon", "water", "lion");
  }
  return { ok: false, query, suggestions };
}

export function suggest(prefix: string, limit = 8): string[] {
  const p = prefix.toLowerCase().trim();
  if (!p) return ["ladder", "balloon", "lion", "fire", "giant lion", "tiny boat"];
  const out: string[] = [];
  for (const n of nameIndex.keys()) {
    if (n.startsWith(p) && !out.includes(n)) out.push(n);
    if (out.length >= limit) return out;
  }
  for (const a of adjIndex.keys()) {
    if (a.startsWith(p.split(" ")[0] ?? "")) {
      for (const n of ["lion", "balloon", "box", "cop"]) {
        const q = `${a} ${n}`;
        if (!out.includes(q)) out.push(q);
        if (out.length >= limit) return out;
      }
    }
  }
  for (const n of nameIndex.keys()) {
    if (n.includes(p) && !out.includes(n)) out.push(n);
    if (out.length >= limit) break;
  }
  return out;
}
