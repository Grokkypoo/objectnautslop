/**
 * Objectnaut simulation.
 *
 * Matter.js at 60 Hz. Otto is a short capsule that raycasts for ground.
 * Spawned catalog objects carry a ResolvedDef. Living bodies use collision
 * category LIVING (hits ground+things, not other living). Things hit all.
 *
 * Design constraints the player already signed off on — do not regress:
 * - W jumps without adding walk acceleration.
 * - Living stay upright (inertia Infinity, angle 0). Walk only if grounded
 *   (or flying / fish in water).
 * - Sleep is e.sleeping. Wake must restore hunt/fear (restoreTemperament).
 * - Animals do not fear Otto unless their def.fear lists him.
 * - Water: submersion buoyancy, not a constant lift. Density per material.
 * - Roam when idle; predators loiter inside ~54px instead of skating through Otto.
 *
 * See DESIGN.md for the full Objectnaut match list.
 */
import Matter from "matter-js";
import { sfx } from "./audio";
import { parseQuery, resolveObject, OBJECTS, ADJECTIVES, type Adjective, type ResolvedDef } from "./catalog";
import { has, P, propList } from "./flags";
import { LEVELS, type Level, type Scenery } from "./levels";

const { Engine, Bodies, Body, Composite, Events, Query, Constraint } = Matter;

const STEP_MS = 1000 / 60;
const TURN_RATE = 3.2;
const WALK_V = 4.15;
const JUMP_V = -9.2;
const G_SCALE = 0.001;

const COL = {
  GROUND: 0x0001,
  LIVING: 0x0002,
  THING: 0x0004,
} as const;

function filterLiving(): Matter.ICollisionFilter {
  return { category: COL.LIVING, mask: COL.GROUND | COL.THING, group: 0 };
}

function filterThing(): Matter.ICollisionFilter {
  return { category: COL.THING, mask: COL.GROUND | COL.LIVING | COL.THING, group: 0 };
}

function filterGround(): Matter.ICollisionFilter {
  return { category: COL.GROUND, mask: 0xffffffff, group: 0 };
}

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};

export type EntKind = "object" | "player" | "spark" | "scenery" | "water" | "gate" | "button";

export type Entity = {
  id: number;
  kind: EntKind;
  body: Matter.Body;
  def: ResolvedDef | null;
  adjectives: string[];
  label: string;
  hp: number;
  onFire: boolean;
  inWater: boolean;
  sleeping: boolean;
  age: number;
  face: number;
  /** Set at drop/spawn. Roam leashes back toward this x. */
  homeX: number;
  /** -1 / 0 / 1 while wandering. 0 is an idle pause (shows idle sprites). */
  roamDir: number;
  roamUntil: number;
  gateId?: string;
  opens?: string;
  spawnCost: number;
};

export type InspectInfo = {
  label: string;
  path: string[];
  adjectives: string[];
  props: string[];
  material: string;
  hunt: string[];
  fear: string[];
  eat: string[];
  like: string[];
  hp: number;
  onFire: boolean;
};

export type HudState = {
  mode: "title" | "play" | "paused" | "win";
  level: Level;
  used: number;
  budget: number;
  selected: InspectInfo | null;
  held: string | null;
  messages: string[];
  won: boolean;
  grounded: boolean;
  hasSpark: boolean;
  inspecting: boolean;
};

export type DrawItem = {
  id: number;
  kind: EntKind;
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  color: string;
  ink: string;
  draw: string;
  label: string;
  onFire: boolean;
  sleeping: boolean;
  flip: boolean;
  anim: number;
  sprite: "otto" | "spark" | "fire" | "cat" | "lion" | "none";
  walking: boolean;
  selected: boolean;
};

export type WorldView = {
  camX: number;
  camY: number;
  width: number;
  height: number;
  shake: number;
  items: DrawItem[];
  waters: { x: number; y: number; w: number; h: number }[];
  platforms: { x: number; y: number; w: number; h: number }[];
  particles: Particle[];
  ghost: { x: number; y: number; w: number; h: number; color: string; label: string } | null;
  time: number;
  inspecting: boolean;
};

export type ObjectActionInfo = {
  id: number;
  label: string;
  holding: boolean;
  canGrab: boolean;
  canSleep: boolean;
  sleeping: boolean;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer: (v: number) => void;
  setKeys: (codes: string[]) => void;
  spawn: (query: string) => { ok: boolean; error?: string };
  sleep: (label: string) => void;
  snapshot: () => {
    player: { x: number; y: number; vy: number; inWater: boolean };
    objects: {
      label: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      inWater: boolean;
      fear: string[];
      hunt: string[];
      sleeping: boolean;
      adjectives: string[];
    }[];
  };
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

function matchesTag(ent: Entity, tag: string): boolean {
  if (!ent.def) return false;
  if (ent.def.id === tag || ent.def.names.includes(tag)) return true;
  if (ent.def.category === tag || ent.def.category.startsWith(tag + ".") || ent.def.category.includes(tag)) {
    return true;
  }
  if (tag.startsWith("role.") || tag.startsWith("living.") || tag.startsWith("material.") || tag.startsWith("element.")) {
    return ent.def.category.includes(tag) || ent.def.path.some((_, i, arr) => arr.slice(0, i + 1).join(".") === tag);
  }
  return false;
}

function labelOf(def: ResolvedDef, adjs: Adjective[]) {
  const prefix = adjs.map((a) => a.id).join(" ");
  return (prefix ? prefix + " " : "") + def.names[0];
}

export class ObjectnautGame {
  engine: Matter.Engine;
  level: Level;
  entities = new Map<number, Entity>();
  particles: Particle[] = [];
  messages: string[] = [];
  used = 0;
  selectedId: number | null = null;
  heldId: number | null = null;
  holdConstraint: Matter.Constraint | null = null;
  mode: HudState["mode"] = "title";
  won = false;
  grounded = false;
  yaw = 0;
  camX = 0;
  camY = 80;
  shake = 0;
  time = 0;
  walkTarget: number | null = null;
  pointerWorld = { x: 0, y: 0 };
  pendingGhost: { def: ResolvedDef; adjectives: Adjective[]; query: string } | null = null;
  keys = new Set<string>();
  injectedKeys: Set<string> | null = null;
  injectedSteer: number | null = null;
  jumpWasDown = false;
  playerId = 0;
  openGates = new Set<string>();
  cursor: "default" | "grab" | "grabbing" = "default";
  inspecting = false;
  private drag: {
    id: number;
    grabX: number;
    grabY: number;
    vx: number;
    vy: number;
    wasStatic: boolean;
    wasSensor: boolean;
    active: boolean;
    downX: number;
    downY: number;
  } | null = null;
  private lastHud: HudState | null = null;
  private unbind: (() => void) | null = null;

  constructor() {
    this.engine = Engine.create({ enableSleeping: false });
    this.engine.gravity.y = 1.15;
    this.engine.gravity.scale = G_SCALE;
    this.level = LEVELS[0]!;
    this.bindInput();
    this.installProbe();
  }

  private installProbe() {
    if (typeof window === "undefined") return;
    window.__controlsTest = {
      getYaw: () => this.yaw,
      getSpeed: () => {
        const p = this.player();
        if (!p) return 0;
        const v = p.body.velocity;
        return Math.hypot(v.x, v.y);
      },
      setSteer: (v) => {
        this.injectedSteer = v;
      },
      setKeys: (codes) => {
        this.injectedKeys = new Set(codes);
      },
      spawn: (query) => this.spawnInFront(query),
      sleep: (label: string) => {
        const e = [...this.entities.values()].find((ent) => ent.kind === "object" && ent.label.includes(label));
        if (e) this.actSleep(e.id);
      },
      snapshot: () => {
        const p = this.player();
        return {
          player: {
            x: p?.body.position.x ?? 0,
            y: p?.body.position.y ?? 0,
            vy: p?.body.velocity.y ?? 0,
            inWater: p?.inWater ?? false,
          },
          objects: [...this.entities.values()]
            .filter((e) => e.kind === "object")
            .map((e) => ({
              label: e.label,
              x: Math.round(e.body.position.x),
              y: Math.round(e.body.position.y),
              vx: Math.round(e.body.velocity.x * 10) / 10,
              vy: Math.round(e.body.velocity.y * 10) / 10,
              angle: Math.round(e.body.angle * 100) / 100,
              inWater: e.inWater,
              fear: e.def?.fear ?? [],
              hunt: e.def?.hunt ?? [],
              sleeping: e.sleeping,
              adjectives: e.adjectives,
            })),
        };
      },
    };
  }

  private bindInput() {
    if (typeof window === "undefined") return;
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      this.keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      if (e.code === "KeyE" || e.code === "KeyF") this.tryPickup();
      if (e.code === "KeyR") this.restart();
      if (e.code === "Escape") this.mode = this.mode === "paused" ? "play" : this.mode === "play" ? "paused" : this.mode;
    };
    const up = (e: KeyboardEvent) => this.keys.delete(e.code);
    const blur = () => this.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", blur);
    this.unbind = () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", blur);
    };
  }

  destroy() {
    this.unbind?.();
    if (typeof window !== "undefined" && window.__controlsTest) delete window.__controlsTest;
    Composite.clear(this.engine.world, false, true);
  }

  player(): Entity | undefined {
    return this.entities.get(this.playerId);
  }

  startLevel(id: string) {
    const level = LEVELS.find((l) => l.id === id) ?? LEVELS[0]!;
    this.build(level);
    this.mode = "play";
    this.won = false;
  }

  restart() {
    this.build(this.level);
    this.mode = "play";
    this.won = false;
  }

  pauseToggle() {
    if (this.mode === "play") this.mode = "paused";
    else if (this.mode === "paused") this.mode = "play";
  }

  toggleInspect() {
    this.inspecting = !this.inspecting;
    if (!this.inspecting) this.selectedId = null;
  }

  private build(level: Level) {
    Composite.clear(this.engine.world, false, true);
    this.entities.clear();
    this.particles = [];
    this.messages = [];
    this.used = 0;
    this.selectedId = null;
    this.heldId = null;
    this.holdConstraint = null;
    this.drag = null;
    this.cursor = "default";
    this.openGates.clear();
    this.won = false;
    this.yaw = 0;
    this.walkTarget = null;
    this.keys.clear();
    this.jumpWasDown = false;
    this.level = level;
    this.camX = Math.max(0, level.startX - 280);
    this.camY = 80;

    const wallH = 1400;
    const walls = [
      Bodies.rectangle(-40, 400, 80, wallH, { isStatic: true, friction: 0.8, collisionFilter: filterGround() }),
      Bodies.rectangle(level.width + 40, 400, 80, wallH, { isStatic: true, friction: 0.8, collisionFilter: filterGround() }),
    ];
    Composite.add(this.engine.world, walls);

    for (const s of level.scenery) this.addScenery(s);

    const player = this.makePlayer(level.startX, level.startY);
    this.playerId = player.id;
    this.log(level.blurb);
  }

  private addScenery(s: Scenery) {
    if (s.kind === "platform") {
      const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
        isStatic: true,
        friction: 0.85,
        restitution: 0,
        label: "platform",
        collisionFilter: filterGround(),
      });
      Composite.add(this.engine.world, b);
      this.track({
        kind: "scenery",
        body: b,
        def: null,
        adjectives: [],
        label: "",
        hp: 99,
        onFire: false,
        inWater: false,
        sleeping: false,
        age: 0,
        spawnCost: 0,
      });
    } else if (s.kind === "water") {
      const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
        isStatic: true,
        isSensor: true,
        label: "water",
      });
      Composite.add(this.engine.world, b);
      this.track({
        kind: "water",
        body: b,
        def: null,
        adjectives: [],
        label: "water",
        hp: 99,
        onFire: false,
        inWater: false,
        sleeping: false,
        age: 0,
        spawnCost: 0,
      });
    } else if (s.kind === "gate") {
      const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
        isStatic: true,
        friction: 0.8,
        label: "gate",
        collisionFilter: filterGround(),
      });
      Composite.add(this.engine.world, b);
      this.track({
        kind: "gate",
        body: b,
        def: null,
        adjectives: [],
        label: "",
        hp: 99,
        onFire: false,
        inWater: false,
        sleeping: false,
        age: 0,
        gateId: s.id,
        spawnCost: 0,
      });
    } else if (s.kind === "button") {
      const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
        isStatic: true,
        isSensor: true,
        label: "button",
      });
      Composite.add(this.engine.world, b);
      this.track({
        kind: "button",
        body: b,
        def: null,
        adjectives: [],
        label: "switch",
        hp: 99,
        onFire: false,
        inWater: false,
        sleeping: false,
        age: 0,
        opens: s.opens,
        spawnCost: 0,
      });
    } else if (s.kind === "spark") {
      this.makeSpark(s.x, s.y);
    } else if (s.kind === "spawn") {
      this.spawnAt(s.name, s.x, s.y, true);
    }
  }

  private track(partial: Omit<Entity, "id" | "face" | "homeX" | "roamDir" | "roamUntil"> & { face?: number; homeX?: number }): Entity {
    const e: Entity = {
      face: 1,
      homeX: partial.body.position.x,
      roamDir: 0,
      roamUntil: this.time + (partial.body.id % 9) * 0.2,
      ...partial,
      id: partial.body.id,
    };
    this.entities.set(e.id, e);
    return e;
  }

  private makePlayer(x: number, y: number) {
    const b = Bodies.rectangle(x, y, 20, 44, {
      inertia: Infinity,
      friction: 0.02,
      frictionAir: 0.02,
      frictionStatic: 0,
      restitution: 0,
      label: "player",
      chamfer: { radius: 4 },
      collisionFilter: filterLiving(),
    });
    Body.setMass(b, 1.7);
    Composite.add(this.engine.world, b);
    return this.track({
      kind: "player",
      body: b,
      def: {
        id: "otto",
        names: ["otto"],
        category: "living.person",
        w: 20,
        h: 44,
        mass: 1.7,
        color: "#C45C3E",
        shape: "box",
        draw: "person",
        props: P.Alive | P.Human | P.Organic,
        material: "flesh",
        path: ["living", "person"],
        hunt: [],
        fear: ["role.monster", "living.animal.mammal.predator"],
        eat: [],
        like: [],
        hp: 8,
      },
      adjectives: [],
      label: "Otto",
      hp: 8,
      onFire: false,
      inWater: false,
      sleeping: false,
      age: 0,
      spawnCost: 0,
    });
  }

  private makeSpark(x: number, y: number) {
    const b = Bodies.circle(x, y, 16, {
      isStatic: true,
      isSensor: true,
      label: "spark",
    });
    Composite.add(this.engine.world, b);
    return this.track({
      kind: "spark",
      body: b,
      def: null,
      adjectives: [],
      label: "spark",
      hp: 1,
      onFire: false,
      inWater: false,
      sleeping: false,
      age: 0,
      spawnCost: 0,
    });
  }

  spawnAt(query: string, x: number, y: number, free = false): { ok: boolean; error?: string } {
    const parsed = parseQuery(query);
    if (!parsed.ok) {
      sfx.error();
      return { ok: false, error: `Unknown word. Try ${parsed.suggestions[0] ?? "ladder"}.` };
    }
    if (!free && this.used >= this.level.budget) {
      sfx.error();
      return { ok: false, error: "Notebook is full for this page." };
    }
    const def = resolveObject(parsed.def, parsed.adjectives);
    const sleeping = parsed.adjectives.some((a) => a.id === "sleeping");
    const w = def.w;
    const h = def.h;
    const isTree = def.draw === "tree";
    const alive = has(def.props, P.Alive);
    const flying = has(def.props, P.Flying);
    const bw = isTree ? 14 : w;
    const bh = h;
    const isStatic = has(def.props, P.Static);
    const body =
      def.shape === "circle" && !isTree && !alive
        ? Bodies.circle(x, y, Math.max(w, h) * 0.42, {
            friction: 0.25,
            restitution: 0.12,
            frictionAir: flying ? 0.05 : 0.01,
            isStatic,
            label: def.id,
            collisionFilter: filterThing(),
          })
        : Bodies.rectangle(x, y, bw, bh, {
            friction: isTree ? 0.95 : alive ? 0.08 : 0.28,
            restitution: 0,
            frictionAir: flying ? 0.05 : alive ? 0.02 : 0.01,
            frictionStatic: alive ? 0 : 0.5,
            inertia: alive ? Infinity : undefined,
            isStatic,
            isSensor: isTree,
            label: def.id,
            chamfer: alive ? { radius: Math.min(6, bw * 0.2, bh * 0.2) } : undefined,
            collisionFilter: alive ? filterLiving() : filterThing(),
          });
    Body.setMass(body, def.mass);
    if (has(def.props, P.Heavy)) Body.setMass(body, Math.max(def.mass, 5));
    if (alive) {
      Body.setInertia(body, Infinity);
      Body.setAngle(body, 0);
      Body.setAngularVelocity(body, 0);
    }
    Composite.add(this.engine.world, body);
    this.track({
      kind: "object",
      body,
      def,
      adjectives: parsed.adjectives.map((a) => a.id),
      label: labelOf(def, parsed.adjectives),
      hp: def.hp,
      onFire: has(def.props, P.Hot) && def.id === "fire",
      inWater: false,
      sleeping,
      age: 0,
      spawnCost: free ? 0 : 1,
    });
    if (!free) {
      this.used += 1;
      sfx.spawn();
      this.burst(x, y, def.color, 8);
      if (this.inspecting) this.selectedId = body.id;
    }
    return { ok: true };
  }

  setPendingQuery(raw: string) {
    const parsed = parseQuery(raw);
    if (!parsed.ok) {
      this.pendingGhost = null;
      return;
    }
    this.pendingGhost = {
      def: resolveObject(parsed.def, parsed.adjectives),
      adjectives: parsed.adjectives,
      query: parsed.query,
    };
  }

  spawnPendingAtPointer(): { ok: boolean; error?: string } {
    if (!this.pendingGhost) return { ok: false, error: "Write a word first." };
    const g = this.pendingGhost;
    const y = this.pointerWorld.y;
    return this.spawnAt(g.query, this.pointerWorld.x, y);
  }

  spawnInFront(query: string): { ok: boolean; error?: string } {
    const p = this.player();
    if (!p) return { ok: false, error: "Otto isn't here." };
    const dir = Math.cos(this.yaw) >= 0 ? 1 : -1;
    const parsed = parseQuery(query);
    const resolved = parsed.ok ? resolveObject(parsed.def, parsed.adjectives) : null;
    const w = resolved?.w ?? 40;
    const h = resolved?.h ?? 40;
    return this.spawnAt(query, p.body.position.x + dir * (52 + w * 0.55), p.body.position.y - h * 0.35 - 12);
  }

  private log(msg: string) {
    this.messages = [msg, ...this.messages].slice(0, 4);
  }

  private burst(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.6 + Math.random() * 2.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1,
        life: 18 + Math.random() * 16,
        max: 34,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  private heldKeys(): Set<string> {
    return this.injectedKeys ?? this.keys;
  }

  setAction(code: string, down: boolean) {
    if (down) this.keys.add(code);
    else this.keys.delete(code);
  }

  pointerMove(worldX: number, worldY: number) {
    this.pointerWorld = { x: worldX, y: worldY };
    if (this.drag) {
      const dx = worldX - this.drag.downX;
      const dy = worldY - this.drag.downY;
      if (!this.drag.active && dx * dx + dy * dy > 64) this.beginDrag();
      if (this.drag.active) this.cursor = "grabbing";
    } else {
      const hit = this.hitObject(worldX, worldY);
      this.cursor = hit ? "grab" : "default";
    }
  }

  pointerDown(worldX: number, worldY: number, place: boolean) {
    if (this.mode !== "play") return;
    this.pointerWorld = { x: worldX, y: worldY };
    const hit = this.hitObject(worldX, worldY);
    if (hit) {
      this.selectedId = hit.id;
      this.drag = {
        id: hit.id,
        grabX: worldX - hit.body.position.x,
        grabY: worldY - hit.body.position.y,
        vx: 0,
        vy: 0,
        wasStatic: !!hit.body.isStatic,
        wasSensor: !!hit.body.isSensor,
        active: false,
        downX: worldX,
        downY: worldY,
      };
      this.cursor = "grab";
      this.walkTarget = null;
      return;
    }
    if (place && this.pendingGhost) {
      this.spawnAt(this.pendingGhost.query, worldX, worldY);
      return;
    }
    this.walkTarget = worldX;
  }

  pointerUp() {
    if (!this.drag) return;
    const d = this.drag;
    const e = this.entities.get(d.id);
    this.drag = null;
    this.cursor = e ? "grab" : "default";
    if (!e || !d.active) return;
    e.body.isSensor = d.wasSensor;
    const freeze = d.wasStatic || !!(e.def && has(e.def.props, P.Static));
    if (freeze) {
      Body.setVelocity(e.body, { x: 0, y: 0 });
      Body.setAngularVelocity(e.body, 0);
      Body.setStatic(e.body, true);
    } else {
      Body.setStatic(e.body, false);
      if (this.isLiving(e)) {
        Body.setInertia(e.body, Infinity);
        Body.setAngle(e.body, 0);
        Body.setAngularVelocity(e.body, 0);
      }
      Body.setVelocity(e.body, {
        x: Math.max(-14, Math.min(14, d.vx * 0.92)),
        y: Math.max(-14, Math.min(14, d.vy * 0.92)),
      });
    }
    sfx.drop();
    if (e && this.isLiving(e)) {
      e.homeX = e.body.position.x;
      e.roamUntil = this.time + 0.4;
      e.roamDir = 0;
    }
  }

  private beginDrag() {
    if (!this.drag || this.drag.active) return;
    const e = this.entities.get(this.drag.id);
    if (!e) {
      this.drag = null;
      return;
    }
    this.drag.active = true;
    this.cursor = "grabbing";
    if (this.heldId === e.id) this.heldId = null;
    Body.setStatic(e.body, true);
    e.body.isSensor = true;
    Body.setVelocity(e.body, { x: 0, y: 0 });
    Body.setAngularVelocity(e.body, 0);
    this.selectedId = e.id;
    this.walkTarget = null;
  }

  private hitObject(x: number, y: number): Entity | null {
    let best: Entity | null = null;
    let bestArea = Infinity;
    for (const e of this.entities.values()) {
      if (e.kind !== "object" || !e.def) continue;
      const w = e.def.w;
      const h = e.def.h;
      if (Math.abs(x - e.body.position.x) <= w * 0.5 + 6 && Math.abs(y - e.body.position.y) <= h * 0.5 + 6) {
        const area = w * h;
        if (area < bestArea) {
          bestArea = area;
          best = e;
        }
      }
    }
    return best;
  }

  objectActionsAt(x: number, y: number): ObjectActionInfo | null {
    if (this.mode !== "play") return null;
    const e = this.hitObject(x, y);
    if (!e?.def) return null;
    const heavy = has(e.def.props, P.Heavy) && e.def.mass > 5.5;
    return {
      id: e.id,
      label: e.label,
      holding: this.heldId === e.id,
      canGrab: !heavy,
      canSleep: has(e.def.props, P.Alive),
      sleeping: e.sleeping,
    };
  }

  cancelPointer() {
    if (this.drag && !this.drag.active) this.drag = null;
    this.walkTarget = null;
  }

  actGrab(id: number) {
    const e = this.entities.get(id);
    if (!e || e.kind !== "object") return;
    if (this.heldId === e.id) {
      this.dropHeld();
      return;
    }
    this.pickEntity(e);
  }

  actDelete(id: number) {
    const e = this.entities.get(id);
    if (!e || e.kind !== "object") return;
    this.used = Math.max(0, this.used - e.spawnCost);
    this.log(`Otto erased the ${e.label}.`);
    this.destroyEntity(e, "erased");
  }

  actDuplicate(id: number): { ok: boolean; error?: string } {
    const e = this.entities.get(id);
    if (!e?.def) return { ok: false, error: "Nothing to copy." };
    const word = [...e.adjectives, e.def.names[0]].filter(Boolean).join(" ");
    return this.spawnAt(word, e.body.position.x + Math.max(24, e.def.w * 0.7), e.body.position.y - 6);
  }

  actSleep(id: number) {
    const e = this.entities.get(id);
    if (!e?.def || !has(e.def.props, P.Alive)) return;
    const noun = e.def.names[0];
    this.setSleeping(e, !e.sleeping);
    this.log(e.sleeping ? `The ${noun} dozed off.` : `The ${noun} woke up.`);
  }

  /** Sleep is runtime state. Adjectives + label follow; hunt is restored on wake. */
  private setSleeping(e: Entity, asleep: boolean) {
    e.sleeping = asleep;
    e.adjectives = e.adjectives.filter((a) => a !== "sleeping");
    if (asleep) e.adjectives = ["sleeping", ...e.adjectives];
    if (!asleep) this.restoreTemperament(e);
    if (e.def) {
      const prefix = e.adjectives.join(" ");
      e.label = (prefix ? prefix + " " : "") + e.def.names[0];
    }
  }

  private restoreTemperament(e: Entity) {
    if (!e.def) return;
    const base = OBJECTS.find((o) => o.id === e.def!.id);
    if (!base) return;
    const adjs = ADJECTIVES.filter((a) => e.adjectives.includes(a.id) && a.id !== "sleeping");
    const fresh = resolveObject(base, adjs);
    e.def.hunt = fresh.hunt;
    e.def.fear = fresh.fear;
    e.def.eat = fresh.eat;
    e.def.like = fresh.like;
  }

  private draggingId() {
    return this.drag?.active ? this.drag.id : null;
  }

  tryPickup() {
    const p = this.player();
    if (!p) return;
    if (this.heldId) {
      this.dropHeld();
      return;
    }
    let best: Entity | null = null;
    let bestD = 70;
    for (const e of this.entities.values()) {
      if (e.kind !== "object" || !e.def) continue;
      const d = Matter.Vector.magnitude(Matter.Vector.sub(p.body.position, e.body.position));
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (best) this.pickEntity(best);
  }

  private pickEntity(e: Entity) {
    if (!e.def) return;
    if (has(e.def.props, P.Heavy) && e.def.mass > 5.5) {
      this.log("Too heavy to lift.");
      sfx.error();
      return;
    }
    this.dropHeld();
    this.heldId = e.id;
    this.selectedId = e.id;
    e.body.isSensor = true;
    sfx.pickup();
    this.log(`Otto grabbed the ${e.label}.`);
  }

  private dropHeld() {
    if (!this.heldId) return;
    const e = this.entities.get(this.heldId);
    this.heldId = null;
    if (this.holdConstraint) {
      Composite.remove(this.engine.world, this.holdConstraint);
      this.holdConstraint = null;
    }
    if (e) {
      e.body.isSensor = false;
      if (this.isLiving(e)) {
        Body.setInertia(e.body, Infinity);
        Body.setAngle(e.body, 0);
        Body.setAngularVelocity(e.body, 0);
      }
      Body.setVelocity(e.body, { x: (Math.cos(this.yaw) >= 0 ? 1 : -1) * 2.2, y: -2 });
      if (this.isLiving(e)) {
        e.homeX = e.body.position.x;
        e.roamDir = 0;
        e.roamUntil = this.time + 0.5;
      }
      sfx.drop();
    }
  }

  step(dt: number) {
    if (this.mode !== "play") {
      this.time += dt;
      return;
    }
    this.time += dt;
    this.shake *= 0.86;
    this.updatePlayer(dt);
    this.updateHeld();
    this.updateDrag();
    Engine.update(this.engine, STEP_MS);
    this.stabilizeLiving();
    this.updateDrag();
    this.updateWater();
    this.updateButtons();
    this.updateAI(dt);
    this.updateReactions();
    this.updateForces();
    this.updateParticles();
    this.cullFallen();
    this.updateCamera();
    this.checkWin();
  }

  private updatePlayer(dt: number) {
    const p = this.player();
    if (!p) return;
    this.refreshGrounded(p);
    const keys = this.heldKeys();
    const left = keys.has("KeyA") || keys.has("ArrowLeft");
    const right = keys.has("KeyD") || keys.has("ArrowRight");
    const jumpDown = keys.has("KeyW") || keys.has("ArrowUp") || keys.has("Space");
    const down = keys.has("KeyS") || keys.has("ArrowDown");

    let steer = 0;
    if (left) steer += 1;
    if (right) steer -= 1;
    if (this.injectedSteer != null) steer = this.injectedSteer;
    this.yaw += steer * TURN_RATE * dt;

    let ax = 0;
    if (left) ax -= 1;
    if (right) ax += 1;

    if (ax === 0 && this.walkTarget != null) {
      const dx = this.walkTarget - p.body.position.x;
      if (Math.abs(dx) < 10) this.walkTarget = null;
      else {
        ax = Math.sign(dx);
        this.yaw += (ax < 0 ? 1 : -1) * TURN_RATE * dt;
      }
    } else if (ax !== 0) {
      this.walkTarget = null;
    }

    const climbing = this.touchingLadder(p);
    const flyingHold = this.heldFlying();
    const riding = this.ridingBody(p);
    const swimming = p.inWater && !climbing && !this.grounded;

    let vx = p.body.velocity.x;
    const swimMul = p.inWater && !climbing ? 0.58 : 1;
    if (ax !== 0) vx = ax * WALK_V * swimMul;
    else if (this.grounded && !climbing) vx = 0;
    if (riding && ax === 0) vx = riding.velocity.x;
    Body.setVelocity(p.body, { x: vx, y: p.body.velocity.y });

    const jumpEdge = jumpDown && !this.jumpWasDown;
    this.jumpWasDown = jumpDown;
    if (climbing) {
      Body.setVelocity(p.body, {
        x: vx * 0.6,
        y: jumpDown ? -3.2 : down ? 3.2 : 0,
      });
    } else if (swimming) {
      const g = p.body.mass * G_SCALE;
      if (jumpDown) Body.applyForce(p.body, p.body.position, { x: 0, y: -g * 3.1 });
      else if (down) Body.applyForce(p.body, p.body.position, { x: 0, y: g * 2.2 });
    } else if (jumpEdge && this.grounded) {
      Body.setVelocity(p.body, { x: p.body.velocity.x, y: JUMP_V });
      this.grounded = false;
    }

    if (flyingHold) {
      Body.applyForce(p.body, p.body.position, { x: 0, y: -p.body.mass * 1.15 * G_SCALE * 1.35 });
    }
    if (has(p.def?.props ?? 0, P.Flying)) {
      Body.applyForce(p.body, p.body.position, { x: 0, y: -p.body.mass * 1.15 * G_SCALE });
    }

    if (p.onFire) {
      p.hp -= dt * 0.7;
      if (Math.random() < 0.2) this.burst(p.body.position.x, p.body.position.y, "#C45C3E", 1);
    }
    if (p.hp <= 0) {
      this.log("Otto got knocked out.");
      this.shake = 10;
      Body.setPosition(p.body, { x: this.level.startX, y: this.level.startY });
      Body.setVelocity(p.body, { x: 0, y: 0 });
      p.hp = 8;
      p.onFire = false;
    }
  }

  private heldFlying() {
    if (!this.heldId) return false;
    const e = this.entities.get(this.heldId);
    return !!(e?.def && has(e.def.props, P.Flying | P.Buoyant) && (has(e.def.props, P.Flying) || e.def.id === "balloon"));
  }

  private touchingLadder(p: Entity) {
    for (const e of this.entities.values()) {
      if (!e.def) continue;
      if (e.def.draw !== "ladder" && e.def.id !== "rope" && e.def.id !== "chain") continue;
      const dx = Math.abs(p.body.position.x - e.body.position.x);
      const dy = Math.abs(p.body.position.y - e.body.position.y);
      if (dx < e.def.w * 0.7 + 16 && dy < e.def.h * 0.55 + 28) return true;
    }
    return false;
  }

  private ridingBody(p: Entity): Matter.Body | null {
    for (const e of this.entities.values()) {
      if (!e.def || !has(e.def.props, P.Rideable)) continue;
      const onTop =
        Math.abs(p.body.position.x - e.body.position.x) < e.def.w * 0.5 &&
        p.body.position.y < e.body.position.y &&
        e.body.position.y - p.body.position.y < e.def.h * 0.7 + 40;
      if (onTop) return e.body;
    }
    return null;
  }

  private refreshGrounded(p: Entity) {
    const hh = (p.def?.h ?? 44) * 0.5;
    const start = { x: p.body.position.x, y: p.body.position.y + hh - 2 };
    const end = { x: p.body.position.x, y: p.body.position.y + hh + 8 };
    const hits = Query.ray(this.solidBodies(p), start, end);
    this.grounded = hits.length > 0;
  }

  private updateHeld() {
    if (this.heldId && this.heldId === this.draggingId()) return;
    const p = this.player();
    if (!p || !this.heldId) return;
    const e = this.entities.get(this.heldId);
    if (!e) {
      this.heldId = null;
      return;
    }
    const dir = Math.cos(this.yaw) >= 0 ? 1 : -1;
    const target = {
      x: p.body.position.x + dir * 22,
      y: p.body.position.y - 28,
    };
    Body.setPosition(e.body, target);
    Body.setVelocity(e.body, p.body.velocity);
    Body.setAngularVelocity(e.body, 0);
  }

  private updateDrag() {
    const d = this.drag;
    if (!d?.active) return;
    const e = this.entities.get(d.id);
    if (!e) {
      this.drag = null;
      this.cursor = "default";
      return;
    }
    const tx = this.pointerWorld.x - d.grabX;
    const ty = this.pointerWorld.y - d.grabY;
    d.vx = tx - e.body.position.x;
    d.vy = ty - e.body.position.y;
    Body.setPosition(e.body, { x: tx, y: ty });
    Body.setVelocity(e.body, { x: 0, y: 0 });
    Body.setAngularVelocity(e.body, 0);
  }

  private updateWater() {
    const waters = [...this.entities.values()].filter((e) => e.kind === "water");
    const dragging = this.draggingId();
    for (const e of this.entities.values()) {
      if (e.id === dragging) continue;
      if (e.kind === "water" || e.kind === "scenery" || e.kind === "gate") continue;
      const sub = submergedRatio(e.body, waters);
      const wet = sub > 0.04;
      const was = e.inWater;
      e.inWater = wet;
      if (wet && !was) {
        sfx.splash();
        this.burst(e.body.position.x, e.body.position.y, "#6A8E9E", 6);
        if (e.onFire) {
          e.onFire = false;
          this.log(`Water doused the ${e.label}.`);
        }
        if (e.def) e.def.props |= P.Wet;
      }
      if (!wet) continue;

      const density = waterDensityOf(e);
      const mass = Math.max(0.05, e.body.mass);
      const g = (this.engine.gravity.y || 1) * G_SCALE;
      const buoyancy = (mass / density) * sub * g;
      Body.applyForce(e.body, e.body.position, { x: 0, y: -buoyancy });

      const dragX = 1 - 0.08 * sub;
      const dragY = 1 - 0.16 * sub;
      Body.setVelocity(e.body, {
        x: e.body.velocity.x * dragX,
        y: e.body.velocity.y * dragY,
      });

      let deepest = waters[0];
      let maxSub = 0;
      for (const w of waters) {
        const s = submergedRatio(e.body, [w]);
        if (s > maxSub) {
          maxSub = s;
          deepest = w;
        }
      }
      if (deepest && e.body.velocity.y > 0) {
        const bed = deepest.body.bounds.max.y;
        const feet = e.body.bounds.max.y;
        if (feet > bed - 1) {
          Body.setPosition(e.body, {
            x: e.body.position.x,
            y: e.body.position.y - (feet - bed + 1),
          });
          Body.setVelocity(e.body, { x: e.body.velocity.x, y: 0 });
        }
      }
    }
  }

  private updateButtons() {
    for (const btn of this.entities.values()) {
      if (btn.kind !== "button" || !btn.opens) continue;
      let pressed = false;
      for (const e of this.entities.values()) {
        if (e.id === btn.id) continue;
        if (e.kind === "water" || e.kind === "scenery" || e.kind === "gate" || e.kind === "spark") continue;
        if (!overlaps(e.body, btn.body) && Math.abs(e.body.position.x - btn.body.position.x) > 40) continue;
        const above =
          Math.abs(e.body.position.x - btn.body.position.x) < 48 &&
          e.body.position.y < btn.body.position.y + 20 &&
          btn.body.position.y - e.body.position.y < 70;
        if (above && (e.kind === "player" || (e.body.mass ?? 1) >= 1.1)) {
          pressed = true;
          break;
        }
      }
      if (pressed && !this.openGates.has(btn.opens)) {
        this.openGates.add(btn.opens);
        this.log("The switch clicked. Bars lifted.");
        sfx.pickup();
        for (const g of this.entities.values()) {
          if (g.kind === "gate" && g.gateId === btn.opens) {
            Composite.remove(this.engine.world, g.body);
            this.entities.delete(g.id);
          }
        }
      }
    }
  }

  /**
   * Fear > hunt > food > like > roam.
   * Hunt range is 220 so lions idle when Otto is far. Inside 54px they face
   * the target and stop (living-living is non-solid, otherwise they moonwalk
   * in place forever).
   */
  private updateAI(dt: number) {
    const dragging = this.draggingId();
    const list = [...this.entities.values()].filter((e) => e.kind === "object" && e.def && has(e.def.props, P.Alive));
    for (const e of list) {
      if (!e.def || e.sleeping || e.id === dragging) continue;
      e.age += dt;
      const seek = this.nearestMatch(e, e.def.hunt, 220);
      const fear = this.nearestMatch(e, e.def.fear, 280);
      const food = this.nearestMatch(e, e.def.eat, 260);
      const like = this.nearestMatch(e, e.def.like, 300);
      const busy = !!(fear || seek || food || like);
      let wish = 0;
      if (fear) wish = Math.sign(e.body.position.x - fear.body.position.x);
      else if (seek) {
        const dx = seek.body.position.x - e.body.position.x;
        if (Math.abs(dx) < 54) {
          e.face = dx >= 0 ? 1 : -1;
          wish = 0;
        } else wish = Math.sign(dx);
      } else if (food) wish = Math.sign(food.body.position.x - e.body.position.x);
      else if (like) wish = Math.sign(like.body.position.x - e.body.position.x);
      else wish = this.roamWish(e);

      const flying = has(e.def.props, P.Flying);
      const fish = e.def.draw === "fish" || e.def.category.includes(".fish");
      const grounded = this.entityGrounded(e);
      const canStep = grounded || flying || (fish && e.inWater);
      const speed = busy ? (has(e.def.props, P.Predator) ? 2.55 : 1.85) : flying ? 1.35 : 1.05;
      if (!has(e.def.props, P.Static)) {
        let vx = e.body.velocity.x;
        if (wish) {
          e.face = wish > 0 ? 1 : -1;
          if (canStep) vx = wish * speed;
          else vx = vx * 0.98 + wish * 0.12;
        } else if (grounded && !flying) {
          vx *= 0.18;
          if (Math.abs(vx) < 0.12) vx = 0;
        }
        Body.setVelocity(e.body, { x: vx, y: e.body.velocity.y });
      }
      if (flying && !e.inWater) {
        const hover = Math.sin(this.time * 2 + e.id) * 0.004;
        Body.applyForce(e.body, e.body.position, {
          x: 0,
          y: -e.body.mass * 1.15 * G_SCALE * 1.05 + hover,
        });
      }
    }
  }

  private roamWish(e: Entity): number {
    if (!e.def || has(e.def.props, P.Static)) return 0;
    const fish = e.def.draw === "fish" || e.def.category.includes(".fish");
    if (fish && !e.inWater) return 0;
    if (this.time >= e.roamUntil) this.pickRoam(e);
    const x = e.body.position.x;
    if (x < 48 && e.roamDir < 0) {
      e.roamDir = 1;
      e.roamUntil = this.time + 1.1;
    } else if (x > this.level.width - 48 && e.roamDir > 0) {
      e.roamDir = -1;
      e.roamUntil = this.time + 1.1;
    }
    return e.roamDir;
  }

  private pickRoam(e: Entity) {
    const leash = e.body.position.x - e.homeX;
    if (Math.abs(leash) > 220) {
      e.roamDir = leash > 0 ? -1 : 1;
      e.roamUntil = this.time + 1.2 + Math.random() * 0.8;
      return;
    }
    const r = Math.random();
    if (r < 0.38) {
      e.roamDir = 0;
      e.roamUntil = this.time + 0.7 + Math.random() * 1.8;
    } else {
      e.roamDir = r < 0.69 ? -1 : 1;
      e.roamUntil = this.time + 0.8 + Math.random() * 1.7;
    }
  }

  private isLiving(e: Entity) {
    return e.kind === "player" || !!(e.def && has(e.def.props, P.Alive));
  }

  private stabilizeLiving() {
    for (const e of this.entities.values()) {
      if (!this.isLiving(e)) continue;
      if (this.draggingId() === e.id) continue;
      Body.setAngle(e.body, 0);
      Body.setAngularVelocity(e.body, 0);
    }
  }

  private entityGrounded(e: Entity) {
    const h = e.def?.h ?? e.body.bounds.max.y - e.body.bounds.min.y;
    const start = { x: e.body.position.x, y: e.body.position.y + h * 0.42 };
    const end = { x: e.body.position.x, y: e.body.position.y + h * 0.55 + 5 };
    const hits = Query.ray(this.solidBodies(e), start, end);
    return hits.length > 0;
  }

  private solidBodies(from: Entity) {
    return Composite.allBodies(this.engine.world).filter((b) => {
      if (b === from.body || b.isSensor) return false;
      if (!this.isLiving(from)) return true;
      const other = this.entities.get(b.id);
      return !(other && this.isLiving(other));
    });
  }

  private nearestMatch(from: Entity, tags: string[], range: number): Entity | null {
    if (!tags.length) return null;
    let best: Entity | null = null;
    let bestD = range;
    for (const e of this.entities.values()) {
      if (e.id === from.id) continue;
      if (e.kind !== "object" && e.kind !== "player") continue;
      if (!tags.some((t) => (e.kind === "player" ? t.includes("person") || t === "living.person" : matchesTag(e, t)))) {
        continue;
      }
      const d = Matter.Vector.magnitude(Matter.Vector.sub(from.body.position, e.body.position));
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private updateReactions() {
    const dragging = this.draggingId();
    const objs = [...this.entities.values()].filter(
      (e) => (e.kind === "object" || e.kind === "player") && e.id !== dragging,
    );
    for (let i = 0; i < objs.length; i++) {
      const a = objs[i]!;
      for (let j = i + 1; j < objs.length; j++) {
        const b = objs[j]!;
        if (!near(a, b, 8)) continue;
        this.react(a, b);
      }
    }
    for (const e of objs) {
      if (!e.def) continue;
      if (e.onFire && has(e.def.props, P.Flammable) && e.kind === "object") {
        e.hp -= 0.03;
        if (e.hp <= 0) this.destroyEntity(e, "burned");
      }
      if (has(e.def.props, P.Flying) && e.kind === "object" && !has(e.def.props, P.Alive) && !e.inWater) {
        Body.applyForce(e.body, e.body.position, { x: 0, y: -e.body.mass * 1.15 * G_SCALE * 1.25 });
      }
      if (has(e.def.props, P.Magnetic)) {
        for (const o of objs) {
          if (o.id === e.id || !o.def) continue;
          if (!has(o.def.props, P.Conductive) && o.def.material !== "metal") continue;
          const dx = e.body.position.x - o.body.position.x;
          const dy = e.body.position.y - o.body.position.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 220 * 220 || d2 < 16) continue;
          const f = 0.00004 * o.body.mass;
          Body.applyForce(o.body, o.body.position, { x: dx * f, y: dy * f });
        }
      }
    }
  }

  private react(a: Entity, b: Entity) {
    const pair = [a, b];
    const hot = pair.find((e) => e.onFire || (e.def && has(e.def.props, P.Hot)));
    const flammable = pair.find((e) => e !== hot && e.def && has(e.def.props, P.Flammable));
    if (hot && flammable && !flammable.onFire) {
      flammable.onFire = true;
      if (flammable.def) flammable.def.props |= P.Hot;
      sfx.ignite();
      this.log(`The ${hot.label} ignited the ${flammable.label}.`);
      this.burst(flammable.body.position.x, flammable.body.position.y, "#C45C3E", 10);
    }
    const wet = pair.find((e) => e.inWater || (e.def && has(e.def.props, P.Wet | P.Liquid)));
    const fire = pair.find((e) => e.onFire || e.def?.id === "fire");
    if (wet && fire && fire !== wet) {
      if (fire.def?.id === "fire") this.destroyEntity(fire, "doused");
      else fire.onFire = false;
    }
    const cold = pair.find((e) => e.def && has(e.def.props, P.Cold));
    const waterish = pair.find((e) => e !== cold && e.def && (has(e.def.props, P.Liquid) || e.def.id === "water"));
    if (cold && waterish && waterish.def) {
      waterish.def.props |= P.Cold;
      waterish.def.color = "#D8E4EA";
    }
    const hot2 = pair.find((e) => e.def && has(e.def.props, P.Hot));
    const ice = pair.find((e) => e !== hot2 && e.def && (e.def.id === "ice" || has(e.def.props, P.Cold)));
    if (hot2 && ice && ice.def && ice.def.id === "ice") {
      this.destroyEntity(ice, "melted");
      this.log("The ice melted.");
    }
    const predator = pair.find((e) => e.def && has(e.def.props, P.Predator) && !e.sleeping);
    const prey = pair.find((e) => e !== predator && e.def && (has(e.def.props, P.Prey | P.Food | P.Edible | P.Human)));
    if (predator && prey && predator.def && prey.def) {
      const hunts =
        predator.def.hunt.some((t) => matchesTag(prey, t) || (prey.kind === "player" && t.includes("person"))) ||
        has(prey.def.props, P.Food);
      if (hunts && near(predator, prey, -4)) {
        if (prey.kind === "player") {
          prey.hp -= 0.08;
          const push = Math.sign(prey.body.position.x - predator.body.position.x) || 1;
          Body.setVelocity(prey.body, { x: push * 6, y: -4 });
        } else if (has(prey.def.props, P.Food | P.Edible) || predator.def.eat.some((t) => matchesTag(prey, t))) {
          this.log(`The ${predator.label} ate the ${prey.label}.`);
          sfx.eat();
          this.destroyEntity(prey, "eaten");
          this.setSleeping(predator, true);
        } else {
          prey.hp -= 0.12;
          if (prey.hp <= 0) this.destroyEntity(prey, "eaten");
        }
      }
    }
    const sharp = pair.find((e) => e.def && has(e.def.props, P.Sharp));
    const plant = pair.find((e) => e !== sharp && e.def && has(e.def.props, P.Plant));
    if (sharp && plant && plant.def) {
      plant.hp -= 0.08;
      if (plant.hp <= 0) {
        this.log(`The ${sharp.label} felled the ${plant.label}.`);
        this.destroyEntity(plant, "chopped");
      }
    }
    const boom = pair.find((e) => e.def && has(e.def.props, P.Explosive));
    const spark = pair.find((e) => e !== boom && (e.onFire || (e.def && has(e.def.props, P.Hot | P.Sharp | P.Electric))));
    if (boom && spark) this.explode(boom);
    const sticky = pair.find((e) => e.def && has(e.def.props, P.Sticky));
    const other = pair.find((e) => e !== sticky);
    if (sticky && other && other.kind === "object" && !sticky.sleeping) {
      // brief stick impulse
      Body.setVelocity(other.body, {
        x: (sticky.body.velocity.x + other.body.velocity.x) * 0.5,
        y: (sticky.body.velocity.y + other.body.velocity.y) * 0.5,
      });
    }
    const zap = pair.find((e) => e.def && has(e.def.props, P.Electric));
    const cond = pair.find((e) => e !== zap && e.def && (has(e.def.props, P.Conductive) || has(e.def.props, P.Alive)));
    if (zap && cond && cond.kind === "player") {
      cond.hp -= 0.05;
    }
  }

  private explode(e: Entity) {
    const { x, y } = e.body.position;
    this.log("Boom.");
    sfx.boom();
    this.shake = 14;
    this.burst(x, y, "#2C2416", 22);
    this.burst(x, y, "#C45C3E", 14);
    for (const o of this.entities.values()) {
      if (o.id === e.id || o.kind === "scenery" || o.kind === "water" || o.kind === "gate") continue;
      const dx = o.body.position.x - x;
      const dy = o.body.position.y - y;
      const d = Math.max(24, Math.hypot(dx, dy));
      if (d > 180) continue;
      const f = 0.12 * (1 - d / 180);
      Body.setVelocity(o.body, { x: o.body.velocity.x + (dx / d) * f * 18, y: o.body.velocity.y + (dy / d) * f * 18 - 3 });
      o.hp -= 3;
      if (o.def && has(o.def.props, P.Flammable)) o.onFire = true;
    }
    this.destroyEntity(e, "exploded");
  }

  private destroyEntity(e: Entity, why: string) {
    if (e.kind === "player") return;
    if (this.drag?.id === e.id) this.drag = null;
    if (this.heldId === e.id) this.heldId = null;
    if (this.selectedId === e.id) this.selectedId = null;
    this.burst(e.body.position.x, e.body.position.y, e.def?.color ?? "#2C2416", 8);
    Composite.remove(this.engine.world, e.body);
    this.entities.delete(e.id);
    if (why === "chopped" || why === "burned") this.releaseSparks(e.body.position.x, e.body.position.y);
    void why;
  }

  private releaseSparks(x: number, y: number) {
    for (const e of this.entities.values()) {
      if (e.kind !== "spark") continue;
      const d = Math.hypot(e.body.position.x - x, e.body.position.y - y);
      if (d < 120 && e.body.isStatic) {
        Body.setStatic(e.body, false);
        e.body.isSensor = true;
        Body.setMass(e.body, 0.4);
      }
    }
  }

  private updateForces() {
    /* flying / water handled elsewhere */
  }

  private updateParticles() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life -= 1;
    }
    if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180);
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private cullFallen() {
    const dragging = this.draggingId();
    for (const e of [...this.entities.values()]) {
      if (e.id === dragging) continue;
      if (e.body.position.y > 1100) {
        if (e.kind === "player") {
          Body.setPosition(e.body, { x: this.level.startX, y: this.level.startY });
          Body.setVelocity(e.body, { x: 0, y: 0 });
        } else if (e.kind === "object") this.destroyEntity(e, "fell");
      }
    }
  }

  private updateCamera() {
    const p = this.player();
    if (!p) return;
    const viewW = 960;
    const viewH = 540;
    const tx = p.body.position.x - viewW * 0.38;
    const ty = p.body.position.y - viewH * 0.62;
    this.camX += (tx - this.camX) * 0.08;
    this.camY += (ty - this.camY) * 0.08;
    this.camX = Math.max(0, Math.min(this.camX, Math.max(0, this.level.width - viewW)));
    this.camY = Math.max(0, Math.min(this.camY, 280));
  }

  private checkWin() {
    if (this.won) return;
    const p = this.player();
    if (!p) return;
    for (const e of this.entities.values()) {
      if (e.kind !== "spark") continue;
      if (Math.hypot(p.body.position.x - e.body.position.x, p.body.position.y - e.body.position.y) < 40) {
        this.won = true;
        this.mode = "win";
        sfx.win();
        this.burst(e.body.position.x, e.body.position.y, "#C45C3E", 24);
        this.log("Otto caught the spark.");
      }
    }
  }

  inspect(id: number | null): InspectInfo | null {
    if (id == null) return null;
    const e = this.entities.get(id);
    if (!e?.def) return e?.kind === "spark" ? {
      label: "spark",
      path: ["goal"],
      adjectives: [],
      props: ["collectible"],
      material: "light",
      hunt: [],
      fear: [],
      eat: [],
      like: [],
      hp: 1,
      onFire: false,
    } : null;
    return {
      label: e.label,
      path: e.def.path,
      adjectives: e.adjectives,
      props: propList(e.def.props),
      material: e.def.material,
      hunt: e.def.hunt,
      fear: e.def.fear,
      eat: e.def.eat,
      like: e.def.like,
      hp: Math.max(0, Math.round(e.hp * 10) / 10),
      onFire: e.onFire,
    };
  }

  hud(): HudState {
    const selected = this.inspect(this.selectedId);
    const held = this.heldId ? this.entities.get(this.heldId)?.label ?? null : null;
    this.lastHud = {
      mode: this.mode,
      level: this.level,
      used: this.used,
      budget: this.level.budget,
      selected,
      held,
      messages: this.messages,
      won: this.won,
      grounded: this.grounded,
      hasSpark: [...this.entities.values()].some((e) => e.kind === "spark"),
      inspecting: this.inspecting,
    };
    return this.lastHud;
  }

  view(): WorldView {
    const items: DrawItem[] = [];
    const waters: WorldView["waters"] = [];
    const platforms: WorldView["platforms"] = [];
    const p = this.player();
    const walking = !!(p && Math.abs(p.body.velocity.x) > 0.4);
    for (const e of this.entities.values()) {
      const bb = e.body.bounds;
      const w = bb.max.x - bb.min.x;
      const h = bb.max.y - bb.min.y;
      if (e.kind === "water") {
        waters.push({ x: e.body.position.x, y: e.body.position.y, w, h });
        continue;
      }
      if (e.kind === "scenery" || e.kind === "gate" || e.kind === "button") {
        platforms.push({ x: e.body.position.x, y: e.body.position.y, w, h });
        if (e.kind === "button") {
          items.push({
            id: e.id,
            kind: e.kind,
            x: e.body.position.x,
            y: e.body.position.y,
            w,
            h,
            angle: e.body.angle,
            color: "#C45C3E",
            ink: "#2C2416",
            draw: "box",
            label: "switch",
            onFire: false,
            sleeping: false,
            flip: false,
            anim: this.time,
            sprite: "none",
            walking: false,
            selected: false,
          });
        }
        continue;
      }
      let flip = e.face < 0;
      if (e.kind === "player" && p) {
        if (p.body.velocity.x < -0.15) p.face = -1;
        else if (p.body.velocity.x > 0.15) p.face = 1;
        else p.face = Math.cos(this.yaw) < 0 ? -1 : 1;
        flip = p.face < 0;
      } else if (this.isLiving(e) && Math.abs(e.body.velocity.x) > 0.2) {
        e.face = e.body.velocity.x < 0 ? -1 : 1;
        flip = e.face < 0;
      }
      const sprite: DrawItem["sprite"] =
        e.kind === "player"
          ? "otto"
          : e.kind === "spark"
            ? "spark"
            : e.def?.id === "cat"
              ? "cat"
              : e.def?.id === "lion"
                ? "lion"
                : e.def?.id === "fire" || e.onFire
                ? "fire"
                : "none";
      items.push({
        id: e.id,
        kind: e.kind,
        x: e.body.position.x,
        y: e.body.position.y,
        w: e.def?.w ?? w,
        h: e.def?.h ?? h,
        angle: this.isLiving(e) ? 0 : e.body.angle,
        color: e.def?.color ?? "#C45C3E",
        ink: e.def?.ink ?? "#2C2416",
        draw: e.def?.draw ?? (e.kind === "spark" ? "star" : "box"),
        label: e.label,
        onFire: e.onFire,
        sleeping: e.sleeping,
        flip,
        anim: this.time,
        sprite,
        walking: e.kind === "player" ? walking : this.isLiving(e) && Math.abs(e.body.velocity.x) > 0.35,
        selected: e.id === this.selectedId,
      });
    }
    let ghost: WorldView["ghost"] = null;
    if (this.pendingGhost && this.mode === "play") {
      const d = this.pendingGhost.def;
      ghost = {
        x: this.pointerWorld.x,
        y: this.pointerWorld.y,
        w: d.w,
        h: d.h,
        color: d.color,
        label: labelOf(d, this.pendingGhost.adjectives),
      };
    }
    return {
      camX: this.camX + (Math.random() - 0.5) * this.shake,
      camY: this.camY + (Math.random() - 0.5) * this.shake * 0.5,
      width: this.level.width,
      height: 800,
      shake: this.shake,
      items,
      waters,
      platforms,
      particles: this.particles,
      ghost,
      time: this.time,
      inspecting: this.inspecting,
    };
  }
}

function overlaps(a: Matter.Body, b: Matter.Body) {
  return !(a.bounds.max.x < b.bounds.min.x || a.bounds.min.x > b.bounds.max.x || a.bounds.max.y < b.bounds.min.y || a.bounds.min.y > b.bounds.max.y);
}

function submergedRatio(body: Matter.Body, waters: Entity[]): number {
  const h = Math.max(1, body.bounds.max.y - body.bounds.min.y);
  let best = 0;
  for (const w of waters) {
    if (body.bounds.max.x < w.body.bounds.min.x || body.bounds.min.x > w.body.bounds.max.x) continue;
    const top = Math.max(body.bounds.min.y, w.body.bounds.min.y);
    const bot = Math.min(body.bounds.max.y, w.body.bounds.max.y);
    if (bot <= top) continue;
    best = Math.max(best, (bot - top) / h);
  }
  return Math.min(1, best);
}

function waterDensityOf(e: Entity): number {
  const props = e.def?.props ?? 0;
  const draw = e.def?.draw ?? "";
  const cat = e.def?.category ?? "";
  if (draw === "fish" || cat.includes(".fish")) return 1.06;
  if (has(props, P.Heavy)) return 2.6;
  if (has(props, P.Flying) && !has(props, P.Alive)) return 0.14;
  if (has(props, P.Buoyant)) return 0.4;
  if (e.kind === "player") return 0.96;
  if (has(props, P.Light)) return 0.62;
  return 1.12;
}

function near(a: Entity, b: Entity, pad: number) {
  const aw = (a.def?.w ?? a.body.bounds.max.x - a.body.bounds.min.x) * 0.5;
  const ah = (a.def?.h ?? a.body.bounds.max.y - a.body.bounds.min.y) * 0.5;
  const bw = (b.def?.w ?? b.body.bounds.max.x - b.body.bounds.min.x) * 0.5;
  const bh = (b.def?.h ?? b.body.bounds.max.y - b.body.bounds.min.y) * 0.5;
  return (
    Math.abs(a.body.position.x - b.body.position.x) < aw + bw + pad &&
    Math.abs(a.body.position.y - b.body.position.y) < ah + bh + pad
  );
}
