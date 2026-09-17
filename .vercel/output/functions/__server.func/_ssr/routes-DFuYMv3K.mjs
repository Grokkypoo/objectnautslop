import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Pause, i as Play, o as ChevronRight, r as RotateCcw, s as BookOpen, t as X } from "../_libs/lucide-react.mjs";
import { t as require_matter } from "../_libs/matter-js.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DFuYMv3K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_matter = /* @__PURE__ */ __toESM(require_matter());
var ctx = null;
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const C = window.AudioContext || window.webkitAudioContext;
		if (!C) return null;
		ctx = new C();
	}
	if (ctx.state === "suspended") ctx.resume();
	return ctx;
}
function unlockAudio() {
	ac();
}
function beep(freq, dur, type, gain = .06, slide = 0) {
	const c = ac();
	if (!c) return;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, c.currentTime);
	if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + dur);
	g.gain.setValueAtTime(gain, c.currentTime);
	g.gain.exponentialRampToValueAtTime(1e-4, c.currentTime + dur);
	o.connect(g);
	g.connect(c.destination);
	o.start();
	o.stop(c.currentTime + dur);
}
var sfx = {
	spawn: () => beep(520, .09, "triangle", .05, 180),
	drop: () => beep(180, .08, "sine", .04, -40),
	ignite: () => beep(240, .16, "sawtooth", .035, 80),
	splash: () => beep(420, .12, "sine", .04, -220),
	eat: () => beep(300, .1, "square", .03, -80),
	boom: () => beep(80, .28, "sawtooth", .07, -50),
	win: () => {
		beep(523, .12, "triangle", .05, 0);
		setTimeout(() => beep(659, .12, "triangle", .05, 0), 90);
		setTimeout(() => beep(784, .22, "triangle", .06, 40), 180);
	},
	error: () => beep(140, .14, "square", .04, -30),
	pickup: () => beep(660, .07, "triangle", .04, 120)
};
var P = {
	Flammable: 1,
	Buoyant: 2,
	Conductive: 4,
	Edible: 8,
	Alive: 16,
	Flying: 32,
	Heavy: 64,
	Sharp: 128,
	Explosive: 256,
	Container: 512,
	Vehicle: 1024,
	Hot: 2048,
	Cold: 4096,
	Wet: 8192,
	Magnetic: 16384,
	Organic: 32768,
	Tool: 65536,
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
	Static: 1 << 29
};
var PROP_LABELS = [
	{
		bit: P.Flammable,
		label: "flammable"
	},
	{
		bit: P.Buoyant,
		label: "buoyant"
	},
	{
		bit: P.Conductive,
		label: "conductive"
	},
	{
		bit: P.Edible,
		label: "edible"
	},
	{
		bit: P.Alive,
		label: "alive"
	},
	{
		bit: P.Flying,
		label: "flying"
	},
	{
		bit: P.Heavy,
		label: "heavy"
	},
	{
		bit: P.Sharp,
		label: "sharp"
	},
	{
		bit: P.Explosive,
		label: "explosive"
	},
	{
		bit: P.Container,
		label: "container"
	},
	{
		bit: P.Vehicle,
		label: "vehicle"
	},
	{
		bit: P.Hot,
		label: "hot"
	},
	{
		bit: P.Cold,
		label: "cold"
	},
	{
		bit: P.Wet,
		label: "wet"
	},
	{
		bit: P.Magnetic,
		label: "magnetic"
	},
	{
		bit: P.Organic,
		label: "organic"
	},
	{
		bit: P.Tool,
		label: "tool"
	},
	{
		bit: P.Weapon,
		label: "weapon"
	},
	{
		bit: P.Light,
		label: "light"
	},
	{
		bit: P.Predator,
		label: "predator"
	},
	{
		bit: P.Prey,
		label: "prey"
	},
	{
		bit: P.Human,
		label: "human"
	},
	{
		bit: P.Plant,
		label: "plant"
	},
	{
		bit: P.Liquid,
		label: "liquid"
	},
	{
		bit: P.Rideable,
		label: "rideable"
	},
	{
		bit: P.Sticky,
		label: "sticky"
	},
	{
		bit: P.Electric,
		label: "electric"
	},
	{
		bit: P.Monster,
		label: "monster"
	},
	{
		bit: P.Food,
		label: "food"
	}
];
function has(props, bit) {
	return (props & bit) !== 0;
}
function propList(props) {
	return PROP_LABELS.filter((p) => has(props, p.bit)).map((p) => p.label);
}
var CATEGORIES = {
	living: { props: P.Alive },
	"living.animal": {
		props: P.Alive | P.Organic,
		fear: ["living.person"]
	},
	"living.animal.mammal": {
		props: P.Alive | P.Organic | P.Edible,
		material: "flesh"
	},
	"living.animal.mammal.predator": {
		props: P.Predator,
		hunt: ["living.animal.mammal.prey", "living.animal.prey"]
	},
	"living.animal.mammal.prey": {
		props: P.Prey,
		fear: ["living.animal.mammal.predator", "role.predator"]
	},
	"living.animal.bird": { props: P.Alive | P.Organic | P.Flying | P.Prey },
	"living.animal.fish": { props: P.Alive | P.Organic | P.Buoyant },
	"living.animal.bug": { props: P.Alive | P.Organic | P.Flying | P.Prey },
	"living.person": {
		props: P.Alive | P.Human | P.Organic,
		eat: ["role.food"],
		fear: ["role.monster", "living.animal.mammal.predator"]
	},
	"living.plant": {
		props: P.Plant | P.Flammable | P.Organic,
		material: "wood"
	},
	"role.predator": { props: P.Predator },
	"role.prey": { props: P.Prey },
	"role.food": { props: P.Food | P.Edible | P.Organic },
	"role.monster": { props: P.Monster | P.Predator },
	"role.weapon": { props: P.Weapon | P.Sharp },
	"role.tool": { props: P.Tool },
	"role.vehicle": { props: P.Vehicle | P.Rideable },
	"material.wood": {
		props: P.Flammable | P.Buoyant,
		material: "wood"
	},
	"material.metal": {
		props: P.Conductive | P.Heavy,
		material: "metal"
	},
	"material.stone": {
		props: P.Heavy,
		material: "stone"
	},
	"material.paper": {
		props: P.Flammable | P.Light,
		material: "paper"
	},
	"material.cloth": {
		props: P.Flammable | P.Light,
		material: "cloth"
	},
	"element.fire": {
		props: P.Hot | P.Light,
		material: "fire"
	},
	"element.water": {
		props: P.Wet | P.Liquid | P.Buoyant,
		material: "water"
	},
	"element.ice": {
		props: P.Cold | P.Wet,
		material: "ice"
	}
};
function o(id, names, category, w, h, mass, color, shape, draw, extra = {}) {
	return {
		id,
		names,
		category,
		w,
		h,
		mass,
		color,
		shape,
		draw,
		...extra
	};
}
var OBJECTS = [
	o("ladder", ["ladder", "stepladder"], "role.tool.material.wood", 28, 110, 1.4, "#C4A574", "box", "ladder", { extra: P.Tool | P.Flammable | P.Buoyant }),
	o("rope", [
		"rope",
		"cord",
		"line"
	], "role.tool.material.cloth", 90, 10, .4, "#8A6A44", "box", "rope", { extra: P.Tool | P.Sticky }),
	o("chain", ["chain"], "role.tool.material.metal", 90, 10, 1.8, "#8A8680", "box", "rope", { extra: P.Tool | P.Conductive | P.Heavy }),
	o("glue", ["glue", "adhesive"], "role.tool", 22, 28, .5, "#E8D9A8", "box", "box", { extra: P.Sticky | P.Tool }),
	o("balloon", [
		"balloon",
		"helium balloon",
		"hot air balloon"
	], "role.tool", 36, 48, .12, "#C45C3E", "circle", "balloon", { extra: P.Light | P.Buoyant | P.Flying }),
	o("anvil", ["anvil"], "material.metal", 54, 36, 8, "#4A4642", "box", "anvil", { extra: P.Heavy | P.Conductive }),
	o("rock", ["rock", "stone"], "material.stone", 36, 30, 3.2, "#8A8478", "circle", "round"),
	o("boulder", ["boulder"], "material.stone", 72, 62, 9, "#6E6860", "circle", "round", { extra: P.Heavy }),
	o("brick", ["brick"], "material.stone", 34, 18, 1.6, "#A45C48", "box", "box"),
	o("box", ["box", "crate"], "material.wood", 42, 42, 1.2, "#C4A06A", "box", "box", { extra: P.Container | P.Flammable | P.Buoyant }),
	o("plank", [
		"plank",
		"board",
		"wood"
	], "material.wood", 110, 16, 1.1, "#C4A574", "box", "plank"),
	o("log", ["log"], "material.wood", 80, 28, 2.2, "#8A5A38", "box", "plank"),
	o("stick", ["stick", "branch"], "material.wood", 70, 10, .3, "#8A6238", "box", "plank", { extra: P.Light }),
	o("fire", [
		"fire",
		"flame",
		"campfire"
	], "element.fire", 34, 40, .2, "#C45C3E", "circle", "flame", { extra: P.Hot | P.Light }),
	o("water", ["water"], "element.water", 48, 28, 1, "#6A8E9E", "box", "drop"),
	o("ice", ["ice", "ice cube"], "element.ice", 36, 36, 1.1, "#D8E4EA", "box", "box", { extra: P.Cold }),
	o("snow", ["snow"], "element.ice", 40, 22, .4, "#F2EEE4", "circle", "round", { extra: P.Cold | P.Light }),
	o("axe", ["axe", "hatchet"], "role.weapon.material.metal", 48, 22, 1.4, "#8A8680", "box", "weapon", { extra: P.Sharp | P.Tool }),
	o("sword", ["sword", "blade"], "role.weapon.material.metal", 70, 14, 1.3, "#C8C4BC", "box", "weapon"),
	o("hammer", ["hammer"], "role.tool.material.metal", 40, 22, 1.5, "#6A6660", "box", "weapon", { extra: P.Tool | P.Heavy }),
	o("shovel", ["shovel"], "role.tool.material.metal", 18, 70, 1.2, "#8A8680", "box", "weapon", { extra: P.Tool }),
	o("gun", ["gun", "pistol"], "role.weapon.material.metal", 40, 18, 1, "#3A3836", "box", "weapon"),
	o("bomb", ["bomb", "dynamite"], "role.weapon", 28, 36, 1.1, "#3A3836", "circle", "round", { extra: P.Explosive }),
	o("boat", [
		"boat",
		"raft",
		"canoe"
	], "role.vehicle.material.wood", 96, 32, 2.4, "#C4A06A", "box", "boat", { extra: P.Buoyant | P.Rideable | P.Vehicle }),
	o("car", ["car", "truck"], "role.vehicle.material.metal", 90, 40, 4, "#C45C3E", "box", "vehicle"),
	o("bike", ["bike", "bicycle"], "role.vehicle.material.metal", 64, 36, 1.6, "#4A4642", "box", "vehicle", { extra: P.Rideable }),
	o("plane", ["plane", "airplane"], "role.vehicle", 110, 36, 2.8, "#E8DCC8", "box", "plane", { extra: P.Flying | P.Rideable | P.Vehicle }),
	o("helicopter", ["helicopter"], "role.vehicle", 90, 40, 3, "#4F6F5A", "box", "plane", { extra: P.Flying | P.Rideable | P.Vehicle }),
	o("jetpack", ["jetpack", "rocket pack"], "role.tool", 28, 36, 1, "#8A8680", "box", "box", { extra: P.Flying | P.Tool }),
	o("wings", ["wings"], "role.tool.material.cloth", 70, 24, .4, "#E8DCC8", "box", "bird", { extra: P.Flying | P.Light }),
	o("lion", ["lion"], "living.animal.mammal.predator", 70, 44, 3.4, "#C4A06A", "box", "quad", {
		extra: P.Predator,
		hunt: ["living.animal.mammal.prey", "living.person"],
		fear: []
	}),
	o("tiger", ["tiger"], "living.animal.mammal.predator", 72, 42, 3.3, "#C45C3E", "box", "quad", {
		extra: P.Predator,
		hunt: ["living.animal.mammal.prey", "living.person"]
	}),
	o("cat", ["cat", "kitty"], "living.animal.mammal.predator", 40, 28, .9, "#8A7A64", "box", "quad", {
		extra: P.Predator,
		hunt: ["living.animal.bug", "mouse"]
	}),
	o("dog", ["dog"], "living.animal.mammal", 48, 34, 1.4, "#8A6238", "box", "quad", {
		extra: P.Prey,
		like: ["living.person"],
		hunt: ["living.animal.mammal.prey"]
	}),
	o("mouse", ["mouse", "rat"], "living.animal.mammal.prey", 24, 16, .25, "#A09890", "box", "quad", {
		extra: P.Prey,
		fear: [
			"living.animal.mammal.predator",
			"cat",
			"living.person"
		]
	}),
	o("bird", ["bird"], "living.animal.bird", 28, 22, .3, "#4F6F5A", "circle", "bird"),
	o("fish", ["fish"], "living.animal.fish", 34, 18, .4, "#6A8E9E", "box", "fish", { extra: P.Edible | P.Food }),
	o("shark", ["shark"], "living.animal.fish", 80, 32, 3, "#6A7078", "box", "fish", {
		extra: P.Predator,
		hunt: ["living.animal.fish", "living.person"]
	}),
	o("bee", ["bee"], "living.animal.bug", 18, 14, .1, "#C4A06A", "circle", "bug", { extra: P.Flying }),
	o("elephant", ["elephant"], "living.animal.mammal", 100, 70, 8, "#A09890", "box", "quad", {
		extra: P.Heavy,
		fear: ["mouse"]
	}),
	o("horse", ["horse"], "living.animal.mammal", 78, 56, 4, "#8A6238", "box", "quad", { extra: P.Rideable }),
	o("wolf", ["wolf"], "living.animal.mammal.predator", 58, 38, 2.2, "#6A6660", "box", "quad", {
		extra: P.Predator,
		hunt: ["living.animal.mammal.prey", "living.person"]
	}),
	o("duck", ["duck"], "living.animal.bird", 32, 24, .5, "#C4A06A", "box", "bird", { extra: P.Buoyant | P.Prey }),
	o("bear", ["bear"], "living.animal.mammal.predator", 70, 52, 5, "#8A6238", "box", "quad", {
		extra: P.Predator | P.Heavy,
		hunt: ["living.person", "living.animal.mammal.prey"]
	}),
	o("cop", [
		"cop",
		"officer",
		"policeman",
		"police"
	], "living.person", 28, 56, 1.6, "#3A4A6A", "box", "person", {
		extra: P.Human,
		like: ["donut"],
		hunt: ["role.monster", "pirate"],
		fear: []
	}),
	o("orphan", ["orphan", "child"], "living.person", 22, 44, 1.1, "#C4A06A", "box", "person", { fear: [
		"role.monster",
		"living.animal.mammal.predator",
		"gun"
	] }),
	o("scientist", ["scientist"], "living.person", 28, 56, 1.5, "#E8DCC8", "box", "person", { like: ["role.tool"] }),
	o("pirate", ["pirate"], "living.person", 28, 56, 1.6, "#4A3830", "box", "person", {
		extra: P.Predator,
		hunt: ["living.person"]
	}),
	o("chef", ["chef", "cook"], "living.person", 28, 56, 1.5, "#F2EEE4", "box", "person", {
		like: ["role.food"],
		eat: ["role.food"]
	}),
	o("hunter", ["hunter"], "living.person", 28, 56, 1.6, "#4F6F5A", "box", "person", { hunt: ["living.animal"] }),
	o("vampire", ["vampire"], "role.monster.living.person", 28, 56, 1.6, "#4A3830", "box", "person", {
		extra: P.Monster | P.Predator,
		hunt: ["living.person"],
		fear: ["role.food"]
	}),
	o("donut", ["donut", "doughnut"], "role.food", 28, 16, .3, "#C4A06A", "circle", "food"),
	o("steak", ["steak", "meat"], "role.food", 34, 16, .5, "#A45C48", "box", "food"),
	o("hamburger", ["hamburger", "burger"], "role.food", 30, 22, .5, "#C4A06A", "box", "food"),
	o("apple", ["apple"], "role.food.living.plant", 22, 22, .3, "#C45C3E", "circle", "food"),
	o("bread", ["bread"], "role.food", 32, 18, .3, "#D8C4A0", "box", "food"),
	o("tree", ["tree"], "living.plant", 40, 120, 4, "#4F6F5A", "box", "tree", {
		extra: P.Flammable | P.Static,
		hp: 8
	}),
	o("flower", ["flower"], "living.plant", 18, 32, .2, "#C45C3E", "box", "plant", { extra: P.Light }),
	o("bush", ["bush"], "living.plant", 48, 32, .8, "#4F6F5A", "box", "plant"),
	o("magnet", ["magnet"], "material.metal", 30, 30, 1.2, "#C45C3E", "box", "magnet", { extra: P.Magnetic | P.Conductive }),
	o("battery", ["battery"], "material.metal", 16, 28, .5, "#4F6F5A", "box", "box", { extra: P.Electric | P.Conductive }),
	o("toaster", ["toaster"], "material.metal", 36, 24, 1.4, "#C8C4BC", "box", "box", { extra: P.Electric | P.Hot | P.Conductive }),
	o("fan", ["fan"], "role.tool.material.metal", 40, 40, 1.1, "#C8C4BC", "circle", "round", { extra: P.Tool }),
	o("umbrella", ["umbrella"], "role.tool.material.cloth", 54, 40, .5, "#C45C3E", "box", "plant", { extra: P.Tool | P.Light }),
	o("sponge", ["sponge"], "role.tool", 28, 22, .3, "#C4A06A", "box", "box", { extra: P.Wet | P.Light | P.Buoyant }),
	o("paper", [
		"paper",
		"notebook",
		"book"
	], "material.paper", 28, 34, .2, "#F2EEE4", "box", "box"),
	o("handcuffs", ["handcuffs", "cuffs"], "role.tool.material.metal", 34, 16, .7, "#8A8680", "box", "rope", { extra: P.Sticky | P.Tool }),
	o("cloud", [
		"cloud",
		"raincloud",
		"rain cloud"
	], "element.water", 70, 32, .2, "#E8E4DC", "circle", "cloud", { extra: P.Flying | P.Light | P.Wet })
];
var ADJECTIVES = [
	{
		id: "giant",
		names: [
			"giant",
			"huge",
			"colossal",
			"big",
			"large"
		],
		apply: (d) => {
			d.w *= 2.15;
			d.h *= 2.15;
			d.mass *= 3.2;
			d.props |= P.Heavy;
		}
	},
	{
		id: "tiny",
		names: [
			"tiny",
			"small",
			"mini",
			"little"
		],
		apply: (d) => {
			d.w *= .48;
			d.h *= .48;
			d.mass *= .35;
			d.props |= P.Light;
		}
	},
	{
		id: "flying",
		names: [
			"flying",
			"winged",
			"airborne"
		],
		apply: (d) => {
			d.props |= P.Flying | P.Light;
		}
	},
	{
		id: "flammable",
		names: ["flammable", "burnable"],
		apply: (d) => {
			d.props |= P.Flammable;
		}
	},
	{
		id: "frozen",
		names: ["frozen", "icy"],
		apply: (d) => {
			d.props |= P.Cold | P.Wet;
			d.color = "#D8E4EA";
		}
	},
	{
		id: "hot",
		names: [
			"hot",
			"burning",
			"fiery"
		],
		apply: (d) => {
			d.props |= P.Hot;
		}
	},
	{
		id: "heavy",
		names: ["heavy"],
		apply: (d) => {
			d.mass *= 2.6;
			d.props |= P.Heavy;
		}
	},
	{
		id: "wooden",
		names: ["wooden", "wood"],
		apply: (d) => {
			d.props |= P.Flammable | P.Buoyant;
			d.material = "wood";
			d.color = "#C4A574";
		}
	},
	{
		id: "metal",
		names: [
			"metal",
			"steel",
			"iron"
		],
		apply: (d) => {
			d.props |= P.Conductive | P.Heavy;
			d.material = "metal";
			d.color = "#8A8680";
		}
	},
	{
		id: "hungry",
		names: ["hungry"],
		apply: (d) => {
			d.props |= P.Predator;
			d.hunt = [
				...d.hunt,
				"role.food",
				"living.person"
			];
		}
	},
	{
		id: "friendly",
		names: ["friendly", "kind"],
		apply: (d) => {
			d.props &= ~P.Predator;
			d.hunt = [];
			d.fear = [];
		}
	},
	{
		id: "sleeping",
		names: ["sleeping", "asleep"],
		apply: (d) => {
			d.hunt = [];
			d.fear = [];
		}
	},
	{
		id: "wet",
		names: ["wet"],
		apply: (d) => {
			d.props |= P.Wet;
		}
	},
	{
		id: "electric",
		names: [
			"electric",
			"electric",
			"charged"
		],
		apply: (d) => {
			d.props |= P.Electric | P.Conductive;
		}
	},
	{
		id: "sticky",
		names: ["sticky"],
		apply: (d) => {
			d.props |= P.Sticky;
		}
	},
	{
		id: "sharp",
		names: ["sharp"],
		apply: (d) => {
			d.props |= P.Sharp;
		}
	},
	{
		id: "buoyant",
		names: ["buoyant", "floating"],
		apply: (d) => {
			d.props |= P.Buoyant;
		}
	}
];
var nameIndex = /* @__PURE__ */ new Map();
for (const def of OBJECTS) for (const n of def.names) nameIndex.set(n.toLowerCase(), def);
var adjIndex = /* @__PURE__ */ new Map();
for (const a of ADJECTIVES) for (const n of a.names) adjIndex.set(n.toLowerCase(), a);
function allWords() {
	const set = /* @__PURE__ */ new Set();
	for (const d of OBJECTS) for (const n of d.names) set.add(n);
	for (const a of ADJECTIVES) for (const n of a.names) set.add(n);
	return [...set].sort();
}
function mergeCategory(path, acc) {
	const parts = path.split(".");
	let walk = "";
	for (const part of parts) {
		walk = walk ? `${walk}.${part}` : part;
		const node = CATEGORIES[walk];
		if (!node) continue;
		acc.props = (acc.props ?? 0) | (node.props ?? 0);
		if (node.material) acc.material = node.material;
		if (node.hunt) acc.hunt = [...acc.hunt ?? [], ...node.hunt];
		if (node.fear) acc.fear = [...acc.fear ?? [], ...node.fear];
		if (node.eat) acc.eat = [...acc.eat ?? [], ...node.eat];
		if (node.like) acc.like = [...acc.like ?? [], ...node.like];
	}
}
function resolveObject(def, adjectives = []) {
	const acc = {
		props: 0,
		hunt: [],
		fear: [],
		eat: [],
		like: []
	};
	for (const chunk of def.category.split(/(?=\b(?:living|role|material|element)\b)/).filter(Boolean)) mergeCategory(chunk.replace(/^\./, ""), acc);
	mergeCategory(def.category, acc);
	const resolved = {
		...def,
		props: (acc.props ?? 0) | (def.extra ?? 0),
		material: acc.material ?? "stuff",
		path: def.category.split("."),
		hunt: [.../* @__PURE__ */ new Set([...acc.hunt ?? [], ...def.hunt ?? []])],
		fear: [.../* @__PURE__ */ new Set([...acc.fear ?? [], ...def.fear ?? []])],
		eat: [.../* @__PURE__ */ new Set([...acc.eat ?? [], ...def.eat ?? []])],
		like: [.../* @__PURE__ */ new Set([...acc.like ?? [], ...def.like ?? []])],
		hp: def.hp ?? (has((acc.props ?? 0) | (def.extra ?? 0), P.Alive) ? 4 : 6),
		w: def.w,
		h: def.h,
		mass: def.mass,
		color: def.color
	};
	for (const a of adjectives) a.apply(resolved);
	resolved.w = Math.max(10, resolved.w);
	resolved.h = Math.max(10, resolved.h);
	resolved.mass = Math.max(.05, resolved.mass);
	return resolved;
}
function parseQuery(raw) {
	const query = raw.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
	if (!query) return {
		ok: false,
		query,
		suggestions: [
			"ladder",
			"balloon",
			"lion",
			"fire"
		]
	};
	const tokens = query.split(" ");
	for (let i = 0; i < tokens.length; i++) {
		const noun = tokens.slice(i).join(" ");
		const def = nameIndex.get(noun);
		if (!def) continue;
		const adjectives = [];
		for (const t of tokens.slice(0, i)) {
			const a = adjIndex.get(t);
			if (a) adjectives.push(a);
		}
		return {
			ok: true,
			def,
			adjectives,
			query
		};
	}
	const last = tokens[tokens.length - 1] ?? "";
	const suggestions = [...nameIndex.keys()].filter((n) => n.startsWith(last) || n.includes(last)).slice(0, 6);
	if (suggestions.length === 0) suggestions.push("ladder", "balloon", "water", "lion");
	return {
		ok: false,
		query,
		suggestions
	};
}
function suggest(prefix, limit = 8) {
	const p = prefix.toLowerCase().trim();
	if (!p) return [
		"ladder",
		"balloon",
		"lion",
		"fire",
		"giant lion",
		"tiny boat"
	];
	const out = [];
	for (const n of nameIndex.keys()) {
		if (n.startsWith(p) && !out.includes(n)) out.push(n);
		if (out.length >= limit) return out;
	}
	for (const a of adjIndex.keys()) if (a.startsWith(p.split(" ")[0] ?? "")) for (const n of [
		"lion",
		"balloon",
		"box",
		"cop"
	]) {
		const q = `${a} ${n}`;
		if (!out.includes(q)) out.push(q);
		if (out.length >= limit) return out;
	}
	for (const n of nameIndex.keys()) {
		if (n.includes(p) && !out.includes(n)) out.push(n);
		if (out.length >= limit) break;
	}
	return out;
}
var LEVELS = [
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
			{
				kind: "platform",
				x: 1200,
				y: 700,
				w: 2400,
				h: 80
			},
			{
				kind: "platform",
				x: 620,
				y: 540,
				w: 220,
				h: 24
			},
			{
				kind: "platform",
				x: 1100,
				y: 430,
				w: 180,
				h: 24
			},
			{
				kind: "water",
				x: 1750,
				y: 670,
				w: 380,
				h: 90
			},
			{
				kind: "spawn",
				name: "tree",
				x: 420,
				y: 580
			},
			{
				kind: "spawn",
				name: "box",
				x: 300,
				y: 640
			}
		]
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
			{
				kind: "platform",
				x: 700,
				y: 700,
				w: 1400,
				h: 80
			},
			{
				kind: "spawn",
				name: "tree",
				x: 720,
				y: 560
			},
			{
				kind: "spark",
				x: 720,
				y: 430
			}
		]
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
			{
				kind: "platform",
				x: 280,
				y: 700,
				w: 560,
				h: 80
			},
			{
				kind: "platform",
				x: 1520,
				y: 700,
				w: 560,
				h: 80
			},
			{
				kind: "water",
				x: 900,
				y: 710,
				w: 680,
				h: 100
			},
			{
				kind: "spawn",
				name: "shark",
				x: 900,
				y: 660
			},
			{
				kind: "spark",
				x: 1580,
				y: 620
			}
		]
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
			{
				kind: "platform",
				x: 800,
				y: 700,
				w: 1600,
				h: 80
			},
			{
				kind: "platform",
				x: 1180,
				y: 560,
				w: 280,
				h: 20
			},
			{
				kind: "gate",
				id: "cage",
				x: 1320,
				y: 500,
				w: 22,
				h: 320
			},
			{
				kind: "gate",
				id: "cage",
				x: 1480,
				y: 500,
				w: 22,
				h: 320
			},
			{
				kind: "platform",
				x: 1400,
				y: 330,
				w: 180,
				h: 20
			},
			{
				kind: "button",
				x: 480,
				y: 652,
				w: 70,
				h: 14,
				opens: "cage"
			},
			{
				kind: "spark",
				x: 1400,
				y: 500
			},
			{
				kind: "spawn",
				name: "box",
				x: 360,
				y: 640
			}
		]
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
			{
				kind: "platform",
				x: 850,
				y: 700,
				w: 1700,
				h: 80
			},
			{
				kind: "spawn",
				name: "sleeping lion",
				x: 820,
				y: 640
			},
			{
				kind: "spark",
				x: 1480,
				y: 620
			}
		]
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
			{
				kind: "platform",
				x: 750,
				y: 700,
				w: 1500,
				h: 80
			},
			{
				kind: "spawn",
				name: "fire",
				x: 700,
				y: 640
			},
			{
				kind: "spawn",
				name: "fire",
				x: 740,
				y: 640
			},
			{
				kind: "spawn",
				name: "fire",
				x: 780,
				y: 640
			},
			{
				kind: "spark",
				x: 1240,
				y: 620
			}
		]
	}
];
var { Engine, Bodies, Body, Composite, Events, Query, Constraint } = import_matter.default;
var STEP_MS = 1e3 / 60;
var TURN_RATE = 3.2;
var WALK_V = 4.15;
var JUMP_V = -9.2;
var G_SCALE = .001;
function matchesTag(ent, tag) {
	if (!ent.def) return false;
	if (ent.def.id === tag || ent.def.names.includes(tag)) return true;
	if (ent.def.category === tag || ent.def.category.startsWith(tag + ".") || ent.def.category.includes(tag)) return true;
	if (tag.startsWith("role.") || tag.startsWith("living.") || tag.startsWith("material.") || tag.startsWith("element.")) return ent.def.category.includes(tag) || ent.def.path.some((_, i, arr) => arr.slice(0, i + 1).join(".") === tag);
	return false;
}
function labelOf(def, adjs) {
	const prefix = adjs.map((a) => a.id).join(" ");
	return (prefix ? prefix + " " : "") + def.names[0];
}
var ObjectnautGame = class {
	engine;
	level;
	entities = /* @__PURE__ */ new Map();
	particles = [];
	messages = [];
	used = 0;
	selectedId = null;
	heldId = null;
	holdConstraint = null;
	mode = "title";
	won = false;
	grounded = false;
	yaw = 0;
	camX = 0;
	camY = 80;
	shake = 0;
	time = 0;
	walkTarget = null;
	pointerWorld = {
		x: 0,
		y: 0
	};
	pendingGhost = null;
	keys = /* @__PURE__ */ new Set();
	injectedKeys = null;
	injectedSteer = null;
	jumpWasDown = false;
	playerId = 0;
	openGates = /* @__PURE__ */ new Set();
	lastHud = null;
	unbind = null;
	constructor() {
		this.engine = Engine.create({ enableSleeping: false });
		this.engine.gravity.y = 1.15;
		this.engine.gravity.scale = G_SCALE;
		this.level = LEVELS[0];
		this.bindInput();
		this.installProbe();
	}
	installProbe() {
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
			}
		};
	}
	bindInput() {
		if (typeof window === "undefined") return;
		const down = (e) => {
			const t = e.target;
			if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
			this.keys.add(e.code);
			if ([
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				"Space"
			].includes(e.code)) e.preventDefault();
			if (e.code === "KeyE" || e.code === "KeyF") this.tryPickup();
			if (e.code === "KeyR") this.restart();
			if (e.code === "Escape") this.mode = this.mode === "paused" ? "play" : this.mode === "play" ? "paused" : this.mode;
		};
		const up = (e) => this.keys.delete(e.code);
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
	player() {
		return this.entities.get(this.playerId);
	}
	startLevel(id) {
		const level = LEVELS.find((l) => l.id === id) ?? LEVELS[0];
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
	build(level) {
		Composite.clear(this.engine.world, false, true);
		this.entities.clear();
		this.particles = [];
		this.messages = [];
		this.used = 0;
		this.selectedId = null;
		this.heldId = null;
		this.holdConstraint = null;
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
		const walls = [Bodies.rectangle(-40, 400, 80, wallH, {
			isStatic: true,
			friction: .8
		}), Bodies.rectangle(level.width + 40, 400, 80, wallH, {
			isStatic: true,
			friction: .8
		})];
		Composite.add(this.engine.world, walls);
		for (const s of level.scenery) this.addScenery(s);
		const player = this.makePlayer(level.startX, level.startY);
		this.playerId = player.id;
		this.log(level.blurb);
	}
	addScenery(s) {
		if (s.kind === "platform") {
			const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
				isStatic: true,
				friction: .85,
				restitution: 0,
				label: "platform"
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
				spawnCost: 0
			});
		} else if (s.kind === "water") {
			const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
				isStatic: true,
				isSensor: true,
				label: "water"
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
				spawnCost: 0
			});
		} else if (s.kind === "gate") {
			const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
				isStatic: true,
				friction: .8,
				label: "gate"
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
				spawnCost: 0
			});
		} else if (s.kind === "button") {
			const b = Bodies.rectangle(s.x, s.y, s.w, s.h, {
				isStatic: true,
				isSensor: true,
				label: "button"
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
				spawnCost: 0
			});
		} else if (s.kind === "spark") this.makeSpark(s.x, s.y);
		else if (s.kind === "spawn") this.spawnAt(s.name, s.x, s.y, true);
	}
	track(partial) {
		const e = {
			...partial,
			id: partial.body.id
		};
		this.entities.set(e.id, e);
		return e;
	}
	makePlayer(x, y) {
		const b = Bodies.rectangle(x, y, 24, 50, {
			inertia: Infinity,
			friction: .02,
			frictionAir: .02,
			frictionStatic: 0,
			restitution: 0,
			label: "player",
			chamfer: { radius: 6 }
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
				w: 24,
				h: 50,
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
				hp: 8
			},
			adjectives: [],
			label: "Otto",
			hp: 8,
			onFire: false,
			inWater: false,
			sleeping: false,
			age: 0,
			spawnCost: 0
		});
	}
	makeSpark(x, y) {
		const b = Bodies.circle(x, y, 16, {
			isStatic: true,
			isSensor: true,
			label: "spark"
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
			spawnCost: 0
		});
	}
	spawnAt(query, x, y, free = false) {
		const parsed = parseQuery(query);
		if (!parsed.ok) {
			sfx.error();
			return {
				ok: false,
				error: `Unknown word. Try ${parsed.suggestions[0] ?? "ladder"}.`
			};
		}
		if (!free && this.used >= this.level.budget) {
			sfx.error();
			return {
				ok: false,
				error: "Notebook is full for this page."
			};
		}
		const def = resolveObject(parsed.def, parsed.adjectives);
		const sleeping = parsed.adjectives.some((a) => a.id === "sleeping");
		const w = def.w;
		const h = def.h;
		const isStatic = has(def.props, P.Static);
		const body = def.shape === "circle" ? Bodies.circle(x, y, Math.max(w, h) * .42, {
			friction: .25,
			restitution: .12,
			frictionAir: has(def.props, P.Flying) ? .05 : .01,
			isStatic,
			label: def.id
		}) : Bodies.rectangle(x, y, w, h, {
			friction: .28,
			restitution: .08,
			frictionAir: has(def.props, P.Flying) ? .05 : .01,
			isStatic,
			label: def.id,
			angle: def.draw === "plank" || def.draw === "weapon" || def.draw === "rope" ? 0 : 0
		});
		Body.setMass(body, def.mass);
		if (has(def.props, P.Heavy)) Body.setMass(body, Math.max(def.mass, 5));
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
			spawnCost: free ? 0 : 1
		});
		if (!free) {
			this.used += 1;
			sfx.spawn();
			this.burst(x, y, def.color, 8);
		}
		this.selectedId = body.id;
		return { ok: true };
	}
	setPendingQuery(raw) {
		const parsed = parseQuery(raw);
		if (!parsed.ok) {
			this.pendingGhost = null;
			return;
		}
		this.pendingGhost = {
			def: resolveObject(parsed.def, parsed.adjectives),
			adjectives: parsed.adjectives,
			query: parsed.query
		};
	}
	spawnPendingAtPointer() {
		if (!this.pendingGhost) return {
			ok: false,
			error: "Write a word first."
		};
		const g = this.pendingGhost;
		const y = this.pointerWorld.y;
		return this.spawnAt(g.query, this.pointerWorld.x, y);
	}
	spawnInFront(query) {
		const p = this.player();
		if (!p) return {
			ok: false,
			error: "Otto isn't here."
		};
		const dir = Math.cos(this.yaw) >= 0 ? 1 : -1;
		const parsed = parseQuery(query);
		const resolved = parsed.ok ? resolveObject(parsed.def, parsed.adjectives) : null;
		const w = resolved?.w ?? 40;
		const h = resolved?.h ?? 40;
		return this.spawnAt(query, p.body.position.x + dir * (52 + w * .55), p.body.position.y - h * .35 - 12);
	}
	log(msg) {
		this.messages = [msg, ...this.messages].slice(0, 4);
	}
	burst(x, y, color, n) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = .6 + Math.random() * 2.2;
			this.particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s - 1,
				life: 18 + Math.random() * 16,
				max: 34,
				color,
				size: 2 + Math.random() * 3
			});
		}
	}
	heldKeys() {
		return this.injectedKeys ?? this.keys;
	}
	setAction(code, down) {
		if (down) this.keys.add(code);
		else this.keys.delete(code);
	}
	pointerMove(worldX, worldY) {
		this.pointerWorld = {
			x: worldX,
			y: worldY
		};
	}
	pointerDown(worldX, worldY, place) {
		if (this.mode !== "play") return;
		this.pointerWorld = {
			x: worldX,
			y: worldY
		};
		if (place && this.pendingGhost) {
			this.spawnAt(this.pendingGhost.query, worldX, worldY);
			return;
		}
		const hits = Query.point(Composite.allBodies(this.engine.world).filter((b) => {
			const e = this.entities.get(b.id);
			return e && (e.kind === "object" || e.kind === "spark" || e.kind === "player" || e.kind === "button");
		}), {
			x: worldX,
			y: worldY
		});
		if (hits[0]) {
			const e = this.entities.get(hits[0].id);
			if (e) {
				this.selectedId = e.id;
				const p = this.player();
				if (p && e.kind === "object" && import_matter.default.Vector.magnitude(import_matter.default.Vector.sub(p.body.position, e.body.position)) < 70) this.pickEntity(e);
				return;
			}
		}
		this.walkTarget = worldX;
	}
	tryPickup() {
		const p = this.player();
		if (!p) return;
		if (this.heldId) {
			this.dropHeld();
			return;
		}
		let best = null;
		let bestD = 70;
		for (const e of this.entities.values()) {
			if (e.kind !== "object" || !e.def) continue;
			const d = import_matter.default.Vector.magnitude(import_matter.default.Vector.sub(p.body.position, e.body.position));
			if (d < bestD) {
				bestD = d;
				best = e;
			}
		}
		if (best) this.pickEntity(best);
	}
	pickEntity(e) {
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
	dropHeld() {
		if (!this.heldId) return;
		const e = this.entities.get(this.heldId);
		this.heldId = null;
		if (this.holdConstraint) {
			Composite.remove(this.engine.world, this.holdConstraint);
			this.holdConstraint = null;
		}
		if (e) {
			e.body.isSensor = false;
			Body.setVelocity(e.body, {
				x: (Math.cos(this.yaw) >= 0 ? 1 : -1) * 2.2,
				y: -2
			});
			sfx.drop();
		}
	}
	step(dt) {
		if (this.mode !== "play") {
			this.time += dt;
			return;
		}
		this.time += dt;
		this.shake *= .86;
		this.updatePlayer(dt);
		this.updateHeld();
		Engine.update(this.engine, STEP_MS);
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
	updatePlayer(dt) {
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
		if (jumpDown && ax === 0) ax += Math.cos(this.yaw) >= 0 ? 1 : -1;
		if (ax === 0 && this.walkTarget != null) {
			const dx = this.walkTarget - p.body.position.x;
			if (Math.abs(dx) < 10) this.walkTarget = null;
			else {
				ax = Math.sign(dx);
				this.yaw += (ax < 0 ? 1 : -1) * TURN_RATE * dt;
			}
		} else if (ax !== 0) this.walkTarget = null;
		const climbing = this.touchingLadder(p);
		const flyingHold = this.heldFlying();
		const riding = this.ridingBody(p);
		let vx = ax * WALK_V;
		if (riding && ax === 0) vx = riding.velocity.x;
		Body.setVelocity(p.body, {
			x: vx,
			y: p.body.velocity.y
		});
		const jumpEdge = jumpDown && !this.jumpWasDown;
		this.jumpWasDown = jumpDown;
		if (climbing) Body.setVelocity(p.body, {
			x: vx * .6,
			y: jumpDown ? -3.2 : down ? 3.2 : 0
		});
		else if (jumpEdge && this.grounded) {
			Body.setVelocity(p.body, {
				x: p.body.velocity.x,
				y: JUMP_V
			});
			this.grounded = false;
		}
		if (flyingHold) Body.applyForce(p.body, p.body.position, {
			x: 0,
			y: -p.body.mass * 1.15 * G_SCALE * 1.35
		});
		if (has(p.def?.props ?? 0, P.Flying)) Body.applyForce(p.body, p.body.position, {
			x: 0,
			y: -p.body.mass * 1.15 * G_SCALE
		});
		if (p.onFire) {
			p.hp -= dt * .7;
			if (Math.random() < .2) this.burst(p.body.position.x, p.body.position.y, "#C45C3E", 1);
		}
		if (p.hp <= 0) {
			this.log("Otto got knocked out.");
			this.shake = 10;
			Body.setPosition(p.body, {
				x: this.level.startX,
				y: this.level.startY
			});
			Body.setVelocity(p.body, {
				x: 0,
				y: 0
			});
			p.hp = 8;
			p.onFire = false;
		}
	}
	heldFlying() {
		if (!this.heldId) return false;
		const e = this.entities.get(this.heldId);
		return !!(e?.def && has(e.def.props, P.Flying | P.Buoyant) && (has(e.def.props, P.Flying) || e.def.id === "balloon"));
	}
	touchingLadder(p) {
		for (const e of this.entities.values()) {
			if (!e.def) continue;
			if (e.def.draw !== "ladder" && e.def.id !== "rope" && e.def.id !== "chain") continue;
			const dx = Math.abs(p.body.position.x - e.body.position.x);
			const dy = Math.abs(p.body.position.y - e.body.position.y);
			if (dx < e.def.w * .7 + 16 && dy < e.def.h * .55 + 28) return true;
		}
		return false;
	}
	ridingBody(p) {
		for (const e of this.entities.values()) {
			if (!e.def || !has(e.def.props, P.Rideable)) continue;
			if (Math.abs(p.body.position.x - e.body.position.x) < e.def.w * .5 && p.body.position.y < e.body.position.y && e.body.position.y - p.body.position.y < e.def.h * .7 + 40) return e.body;
		}
		return null;
	}
	refreshGrounded(p) {
		const start = {
			x: p.body.position.x,
			y: p.body.position.y + 22
		};
		const end = {
			x: p.body.position.x,
			y: p.body.position.y + 32
		};
		const hits = Query.ray(Composite.allBodies(this.engine.world).filter((b) => b !== p.body && !b.isSensor), start, end);
		this.grounded = hits.length > 0;
	}
	updateHeld() {
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
			y: p.body.position.y - 28
		};
		Body.setPosition(e.body, target);
		Body.setVelocity(e.body, p.body.velocity);
		Body.setAngularVelocity(e.body, 0);
	}
	updateWater() {
		const waters = [...this.entities.values()].filter((e) => e.kind === "water");
		for (const e of this.entities.values()) {
			if (e.kind === "water" || e.kind === "scenery" || e.kind === "gate") continue;
			let wet = false;
			for (const w of waters) if (overlaps(e.body, w.body)) {
				wet = true;
				break;
			}
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
			if (wet && e.def) {
				const buoy = has(e.def.props, P.Buoyant) || has(e.def.props, P.Flying) || e.kind === "player";
				const lift = has(e.def.props, P.Heavy) ? .25 : buoy ? 1.55 : .7;
				Body.applyForce(e.body, e.body.position, {
					x: 0,
					y: -e.body.mass * 1.15 * G_SCALE * lift
				});
				Body.setVelocity(e.body, {
					x: e.body.velocity.x * .96,
					y: e.body.velocity.y * .92
				});
			}
		}
	}
	updateButtons() {
		for (const btn of this.entities.values()) {
			if (btn.kind !== "button" || !btn.opens) continue;
			let pressed = false;
			for (const e of this.entities.values()) {
				if (e.id === btn.id) continue;
				if (e.kind === "water" || e.kind === "scenery" || e.kind === "gate" || e.kind === "spark") continue;
				if (!overlaps(e.body, btn.body) && Math.abs(e.body.position.x - btn.body.position.x) > 40) continue;
				if (Math.abs(e.body.position.x - btn.body.position.x) < 48 && e.body.position.y < btn.body.position.y + 20 && btn.body.position.y - e.body.position.y < 70 && (e.kind === "player" || (e.body.mass ?? 1) >= 1.1)) {
					pressed = true;
					break;
				}
			}
			if (pressed && !this.openGates.has(btn.opens)) {
				this.openGates.add(btn.opens);
				this.log("The switch clicked. Bars lifted.");
				sfx.pickup();
				for (const g of this.entities.values()) if (g.kind === "gate" && g.gateId === btn.opens) {
					Composite.remove(this.engine.world, g.body);
					this.entities.delete(g.id);
				}
			}
		}
	}
	updateAI(dt) {
		const list = [...this.entities.values()].filter((e) => e.kind === "object" && e.def && has(e.def.props, P.Alive));
		for (const e of list) {
			if (!e.def || e.sleeping) continue;
			e.age += dt;
			const seek = this.nearestMatch(e, e.def.hunt, 360);
			const fear = this.nearestMatch(e, e.def.fear, 280);
			const food = this.nearestMatch(e, e.def.eat, 260);
			const like = this.nearestMatch(e, e.def.like, 300);
			let wish = 0;
			if (fear) wish = Math.sign(e.body.position.x - fear.body.position.x);
			else if (seek) wish = Math.sign(seek.body.position.x - e.body.position.x);
			else if (food) wish = Math.sign(food.body.position.x - e.body.position.x);
			else if (like) wish = Math.sign(like.body.position.x - e.body.position.x);
			else if (has(e.def.props, P.Flying)) wish = Math.sin(this.time * .6 + e.id) * .4;
			const speed = has(e.def.props, P.Predator) ? 2.4 : 1.6;
			if (wish && !has(e.def.props, P.Static)) Body.setVelocity(e.body, {
				x: wish * speed,
				y: e.body.velocity.y
			});
			if (has(e.def.props, P.Flying) && !e.inWater) {
				const hover = Math.sin(this.time * 2 + e.id) * .004;
				Body.applyForce(e.body, e.body.position, {
					x: 0,
					y: -e.body.mass * 1.15 * G_SCALE * 1.05 + hover
				});
			}
		}
	}
	nearestMatch(from, tags, range) {
		if (!tags.length) return null;
		let best = null;
		let bestD = range;
		for (const e of this.entities.values()) {
			if (e.id === from.id) continue;
			if (e.kind !== "object" && e.kind !== "player") continue;
			if (!tags.some((t) => e.kind === "player" ? t.includes("person") || t === "living.person" : matchesTag(e, t))) continue;
			const d = import_matter.default.Vector.magnitude(import_matter.default.Vector.sub(from.body.position, e.body.position));
			if (d < bestD) {
				bestD = d;
				best = e;
			}
		}
		return best;
	}
	updateReactions() {
		const objs = [...this.entities.values()].filter((e) => e.kind === "object" || e.kind === "player");
		for (let i = 0; i < objs.length; i++) {
			const a = objs[i];
			for (let j = i + 1; j < objs.length; j++) {
				const b = objs[j];
				if (!near(a, b, 8)) continue;
				this.react(a, b);
			}
		}
		for (const e of objs) {
			if (!e.def) continue;
			if (e.onFire && has(e.def.props, P.Flammable) && e.kind === "object") {
				e.hp -= .03;
				if (e.hp <= 0) this.destroyEntity(e, "burned");
			}
			if (has(e.def.props, P.Flying) && e.kind === "object" && !has(e.def.props, P.Alive) && !e.inWater) Body.applyForce(e.body, e.body.position, {
				x: 0,
				y: -e.body.mass * 1.15 * G_SCALE * 1.25
			});
			if (has(e.def.props, P.Magnetic)) for (const o of objs) {
				if (o.id === e.id || !o.def) continue;
				if (!has(o.def.props, P.Conductive) && o.def.material !== "metal") continue;
				const dx = e.body.position.x - o.body.position.x;
				const dy = e.body.position.y - o.body.position.y;
				const d2 = dx * dx + dy * dy;
				if (d2 > 48400 || d2 < 16) continue;
				const f = 4e-5 * o.body.mass;
				Body.applyForce(o.body, o.body.position, {
					x: dx * f,
					y: dy * f
				});
			}
		}
	}
	react(a, b) {
		const pair = [a, b];
		const hot = pair.find((e) => e.onFire || e.def && has(e.def.props, P.Hot));
		const flammable = pair.find((e) => e !== hot && e.def && has(e.def.props, P.Flammable));
		if (hot && flammable && !flammable.onFire) {
			flammable.onFire = true;
			if (flammable.def) flammable.def.props |= P.Hot;
			sfx.ignite();
			this.log(`The ${hot.label} ignited the ${flammable.label}.`);
			this.burst(flammable.body.position.x, flammable.body.position.y, "#C45C3E", 10);
		}
		const wet = pair.find((e) => e.inWater || e.def && has(e.def.props, P.Wet | P.Liquid));
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
		const prey = pair.find((e) => e !== predator && e.def && has(e.def.props, P.Prey | P.Food | P.Edible | P.Human));
		if (predator && prey && predator.def && prey.def) {
			if ((predator.def.hunt.some((t) => matchesTag(prey, t) || prey.kind === "player" && t.includes("person")) || has(prey.def.props, P.Food)) && near(predator, prey, -4)) {
				if (prey.kind === "player") {
					prey.hp -= .08;
					const push = Math.sign(prey.body.position.x - predator.body.position.x) || 1;
					Body.setVelocity(prey.body, {
						x: push * 6,
						y: -4
					});
				} else if (has(prey.def.props, P.Food | P.Edible) || predator.def.eat.some((t) => matchesTag(prey, t))) {
					this.log(`The ${predator.label} ate the ${prey.label}.`);
					sfx.eat();
					this.destroyEntity(prey, "eaten");
					predator.sleeping = true;
					predator.def.hunt = [];
				} else {
					prey.hp -= .12;
					if (prey.hp <= 0) this.destroyEntity(prey, "eaten");
				}
			}
		}
		const sharp = pair.find((e) => e.def && has(e.def.props, P.Sharp));
		const plant = pair.find((e) => e !== sharp && e.def && has(e.def.props, P.Plant));
		if (sharp && plant && plant.def) {
			plant.hp -= .08;
			if (plant.hp <= 0) {
				this.log(`The ${sharp.label} felled the ${plant.label}.`);
				this.destroyEntity(plant, "chopped");
			}
		}
		const boom = pair.find((e) => e.def && has(e.def.props, P.Explosive));
		const spark = pair.find((e) => e !== boom && (e.onFire || e.def && has(e.def.props, P.Hot | P.Sharp | P.Electric)));
		if (boom && spark) this.explode(boom);
		const sticky = pair.find((e) => e.def && has(e.def.props, P.Sticky));
		const other = pair.find((e) => e !== sticky);
		if (sticky && other && other.kind === "object" && !sticky.sleeping) Body.setVelocity(other.body, {
			x: (sticky.body.velocity.x + other.body.velocity.x) * .5,
			y: (sticky.body.velocity.y + other.body.velocity.y) * .5
		});
		const zap = pair.find((e) => e.def && has(e.def.props, P.Electric));
		const cond = pair.find((e) => e !== zap && e.def && (has(e.def.props, P.Conductive) || has(e.def.props, P.Alive)));
		if (zap && cond && cond.kind === "player") cond.hp -= .05;
	}
	explode(e) {
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
			const f = .12 * (1 - d / 180);
			Body.setVelocity(o.body, {
				x: o.body.velocity.x + dx / d * f * 18,
				y: o.body.velocity.y + dy / d * f * 18 - 3
			});
			o.hp -= 3;
			if (o.def && has(o.def.props, P.Flammable)) o.onFire = true;
		}
		this.destroyEntity(e, "exploded");
	}
	destroyEntity(e, why) {
		if (e.kind === "player") return;
		if (this.heldId === e.id) this.heldId = null;
		if (this.selectedId === e.id) this.selectedId = null;
		this.burst(e.body.position.x, e.body.position.y, e.def?.color ?? "#2C2416", 8);
		Composite.remove(this.engine.world, e.body);
		this.entities.delete(e.id);
		if (why === "chopped" || why === "burned") this.releaseSparks(e.body.position.x, e.body.position.y);
	}
	releaseSparks(x, y) {
		for (const e of this.entities.values()) {
			if (e.kind !== "spark") continue;
			if (Math.hypot(e.body.position.x - x, e.body.position.y - y) < 120 && e.body.isStatic) {
				Body.setStatic(e.body, false);
				e.body.isSensor = true;
				Body.setMass(e.body, .4);
			}
		}
	}
	updateForces() {}
	updateParticles() {
		for (const p of this.particles) {
			p.x += p.vx;
			p.y += p.vy;
			p.vy += .08;
			p.life -= 1;
		}
		if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180);
		this.particles = this.particles.filter((p) => p.life > 0);
	}
	cullFallen() {
		for (const e of [...this.entities.values()]) if (e.body.position.y > 1100) {
			if (e.kind === "player") {
				Body.setPosition(e.body, {
					x: this.level.startX,
					y: this.level.startY
				});
				Body.setVelocity(e.body, {
					x: 0,
					y: 0
				});
			} else if (e.kind === "object") this.destroyEntity(e, "fell");
		}
	}
	updateCamera() {
		const p = this.player();
		if (!p) return;
		const viewW = 960;
		const viewH = 540;
		const tx = p.body.position.x - viewW * .38;
		const ty = p.body.position.y - viewH * .62;
		this.camX += (tx - this.camX) * .08;
		this.camY += (ty - this.camY) * .08;
		this.camX = Math.max(0, Math.min(this.camX, Math.max(0, this.level.width - viewW)));
		this.camY = Math.max(0, Math.min(this.camY, 280));
	}
	checkWin() {
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
	inspect(id) {
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
			onFire: false
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
			onFire: e.onFire
		};
	}
	hud() {
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
			hasSpark: [...this.entities.values()].some((e) => e.kind === "spark")
		};
		return this.lastHud;
	}
	view() {
		const items = [];
		const waters = [];
		const platforms = [];
		const p = this.player();
		const walking = !!(p && Math.abs(p.body.velocity.x) > .4);
		for (const e of this.entities.values()) {
			const bb = e.body.bounds;
			const w = bb.max.x - bb.min.x;
			const h = bb.max.y - bb.min.y;
			if (e.kind === "water") {
				waters.push({
					x: e.body.position.x,
					y: e.body.position.y,
					w,
					h
				});
				continue;
			}
			if (e.kind === "scenery" || e.kind === "gate" || e.kind === "button") {
				platforms.push({
					x: e.body.position.x,
					y: e.body.position.y,
					w,
					h
				});
				if (e.kind === "button") items.push({
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
					walking: false
				});
				continue;
			}
			let flip = e.body.velocity.x < -.15;
			if (e.kind === "player" && p) {
				if (p.body.velocity.x < -.15) flip = true;
				else if (p.body.velocity.x > .15) flip = false;
				else flip = Math.cos(this.yaw) < 0;
			}
			const sprite = e.kind === "player" ? "otto" : e.kind === "spark" ? "spark" : e.def?.id === "fire" || e.onFire ? "fire" : "none";
			items.push({
				id: e.id,
				kind: e.kind,
				x: e.body.position.x,
				y: e.body.position.y,
				w: e.def?.w ?? w,
				h: e.def?.h ?? h,
				angle: e.kind === "player" ? 0 : e.body.angle,
				color: e.def?.color ?? "#C45C3E",
				ink: e.def?.ink ?? "#2C2416",
				draw: e.def?.draw ?? (e.kind === "spark" ? "star" : "box"),
				label: e.label,
				onFire: e.onFire,
				sleeping: e.sleeping,
				flip,
				anim: this.time,
				sprite,
				walking: e.kind === "player" ? walking : Math.abs(e.body.velocity.x) > .3
			});
		}
		let ghost = null;
		if (this.pendingGhost && this.mode === "play") {
			const d = this.pendingGhost.def;
			ghost = {
				x: this.pointerWorld.x,
				y: this.pointerWorld.y,
				w: d.w,
				h: d.h,
				color: d.color,
				label: labelOf(d, this.pendingGhost.adjectives)
			};
		}
		return {
			camX: this.camX + (Math.random() - .5) * this.shake,
			camY: this.camY + (Math.random() - .5) * this.shake * .5,
			width: this.level.width,
			height: 800,
			shake: this.shake,
			items,
			waters,
			platforms,
			particles: this.particles,
			ghost,
			time: this.time
		};
	}
};
function overlaps(a, b) {
	return !(a.bounds.max.x < b.bounds.min.x || a.bounds.min.x > b.bounds.max.x || a.bounds.max.y < b.bounds.min.y || a.bounds.min.y > b.bounds.max.y);
}
function near(a, b, pad) {
	const ra = Math.max(a.def?.w ?? 20, a.def?.h ?? 20) * .5;
	const rb = Math.max(b.def?.w ?? 20, b.def?.h ?? 20) * .5;
	return import_matter.default.Vector.magnitude(import_matter.default.Vector.sub(a.body.position, b.body.position)) < ra + rb + pad;
}
var PAPER = "#F3E6C9";
var INK = "#2C2416";
var TERRACOTTA = "#C45C3E";
var SAGE = "#4F6F5A";
var CELL = 128;
function load(src) {
	const img = new Image();
	img.crossOrigin = "anonymous";
	img.src = src;
	return img;
}
var PaperRenderer = class {
	canvas;
	ctx;
	sheets;
	dpr = 1;
	cssW = 960;
	cssH = 540;
	constructor(canvas) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas unsupported");
		this.ctx = ctx;
		this.sheets = {
			ottoIdle: load("/sprites/otto-idle.png"),
			ottoWalk: load("/sprites/otto-walk.png"),
			spark: load("/sprites/spark.png"),
			fire: load("/sprites/fire.png")
		};
	}
	resize() {
		const parent = this.canvas.parentElement;
		const w = parent?.clientWidth ?? window.innerWidth;
		const h = parent?.clientHeight ?? window.innerHeight;
		this.dpr = Math.min(2, window.devicePixelRatio || 1);
		this.cssW = w;
		this.cssH = h;
		this.canvas.width = Math.floor(w * this.dpr);
		this.canvas.height = Math.floor(h * this.dpr);
		this.canvas.style.width = `${w}px`;
		this.canvas.style.height = `${h}px`;
	}
	screenToWorld(clientX, clientY, view) {
		const rect = this.canvas.getBoundingClientRect();
		const x = (clientX - rect.left) / rect.width * this.cssW;
		const y = (clientY - rect.top) / rect.height * this.cssH;
		const scale = this.worldScale();
		return {
			x: view.camX + x / scale,
			y: view.camY + y / scale
		};
	}
	worldScale() {
		return this.cssW / 960;
	}
	draw(view) {
		const ctx = this.ctx;
		const dpr = this.dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, this.cssW, this.cssH);
		const scale = this.worldScale();
		ctx.save();
		ctx.scale(scale, scale);
		ctx.translate(-view.camX, -view.camY);
		this.paintPaper(view);
		for (const p of view.platforms) this.drawPlatform(p);
		for (const w of view.waters) this.drawWater(w, view.time);
		const ordered = [...view.items].sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2));
		for (const it of ordered) this.drawItem(it, view);
		if (view.ghost) this.drawGhost(view.ghost);
		for (const p of view.particles) this.drawParticle(p);
		ctx.restore();
	}
	paintPaper(view) {
		const ctx = this.ctx;
		const x0 = view.camX - 20;
		const y0 = view.camY - 20;
		const w = 1040;
		const h = 620;
		ctx.fillStyle = PAPER;
		ctx.fillRect(x0, y0, w, h);
		ctx.strokeStyle = "rgba(44,36,22,0.06)";
		ctx.lineWidth = 1;
		const start = Math.floor(y0 / 28) * 28;
		for (let y = start; y < y0 + h; y += 28) {
			ctx.beginPath();
			ctx.moveTo(x0, y);
			ctx.lineTo(x0 + w, y);
			ctx.stroke();
		}
		ctx.strokeStyle = "rgba(196,92,62,0.18)";
		ctx.beginPath();
		ctx.moveTo(x0 + 56, y0);
		ctx.lineTo(x0 + 56, y0 + h);
		ctx.stroke();
		ctx.fillStyle = "rgba(79,111,90,0.07)";
		ctx.fillRect(0, 660, view.width, 200);
	}
	drawPlatform(p) {
		const ctx = this.ctx;
		ctx.save();
		ctx.translate(p.x, p.y);
		roundRect(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 4);
		ctx.fillStyle = "#E4D2A8";
		ctx.fill();
		ctx.strokeStyle = INK;
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.strokeStyle = "rgba(44,36,22,0.18)";
		ctx.lineWidth = 1;
		for (let i = -p.w / 2 + 16; i < p.w / 2; i += 22) {
			ctx.beginPath();
			ctx.moveTo(i, -p.h / 2 + 3);
			ctx.lineTo(i + 8, p.h / 2 - 3);
			ctx.stroke();
		}
		ctx.restore();
	}
	drawWater(w, t) {
		const ctx = this.ctx;
		ctx.save();
		ctx.translate(w.x, w.y);
		ctx.fillStyle = "rgba(106,142,158,0.45)";
		roundRect(ctx, -w.w / 2, -w.h / 2, w.w, w.h, 6);
		ctx.fill();
		ctx.strokeStyle = SAGE;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-w.w / 2, -w.h / 2 + 4);
		for (let x = -w.w / 2; x <= w.w / 2; x += 10) ctx.lineTo(x, -w.h / 2 + Math.sin(x * .08 + t * 3) * 3);
		ctx.stroke();
		ctx.restore();
	}
	drawGhost(g) {
		const ctx = this.ctx;
		ctx.save();
		ctx.globalAlpha = .45;
		ctx.translate(g.x, g.y);
		ctx.strokeStyle = TERRACOTTA;
		ctx.setLineDash([6, 4]);
		ctx.lineWidth = 2;
		roundRect(ctx, -g.w / 2, -g.h / 2, g.w, g.h, 6);
		ctx.stroke();
		ctx.fillStyle = INK;
		ctx.globalAlpha = .7;
		ctx.font = "600 12px Figtree, sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(g.label, 0, -g.h / 2 - 8);
		ctx.restore();
	}
	drawParticle(p) {
		const ctx = this.ctx;
		ctx.globalAlpha = Math.max(0, p.life / p.max);
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	drawItem(it, view) {
		const ctx = this.ctx;
		if (it.kind === "object" || it.kind === "player") {
			ctx.save();
			ctx.fillStyle = "rgba(44,36,22,0.14)";
			ctx.beginPath();
			ctx.ellipse(it.x, it.y + it.h * .5, Math.max(10, it.w * .38), 4.5, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		ctx.save();
		ctx.translate(it.x, it.y);
		ctx.rotate(it.angle);
		if (it.sprite === "otto") drawCell(ctx, it.walking ? this.sheets.ottoWalk : this.sheets.ottoIdle, Math.floor(view.time * (it.walking ? 10 : 6)) % 4, 0, -18, 52, 90, it.flip);
		else if (it.sprite === "spark") {
			const frame = Math.floor(view.time * 8) % 4;
			const bob = Math.sin(view.time * 3) * 4;
			drawCell(ctx, this.sheets.spark, frame, 0, bob, 42, 42, false);
		} else if (it.sprite === "fire" && (it.draw === "flame" || it.onFire)) {
			if (it.draw !== "flame") this.sketch(it);
			const frame = Math.floor(view.time * 12 + it.id) % 4;
			drawCell(ctx, this.sheets.fire, frame, 0, it.draw === "flame" ? 0 : -it.h * .2, it.w * 1.1, it.h * 1.2, false);
		} else this.sketch(it);
		if (it.sleeping) {
			ctx.fillStyle = INK;
			ctx.font = "600 11px Figtree, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("zz", 16, -it.h * .45);
		}
		ctx.restore();
		if (it.label && it.kind === "object") {
			ctx.save();
			ctx.fillStyle = "rgba(44,36,22,0.72)";
			ctx.font = "600 11px Figtree, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(it.label, it.x, it.y + it.h * .5 + 12);
			ctx.restore();
		}
	}
	sketch(it) {
		const ctx = this.ctx;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.strokeStyle = it.ink;
		ctx.fillStyle = it.color;
		ctx.lineWidth = 2;
		const w = it.w;
		const h = it.h;
		const kind = it.draw;
		ctx.save();
		if (it.flip) ctx.scale(-1, 1);
		switch (kind) {
			case "person":
				ellipse(ctx, 0, -h * .32, w * .38, h * .18);
				ctx.fill();
				ctx.stroke();
				roundRect(ctx, -w * .28, -h * .14, w * .56, h * .38, 4);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-w * .16, h * .24);
				ctx.lineTo(-w * .2, h * .48);
				ctx.moveTo(w * .16, h * .24);
				ctx.lineTo(w * .22, h * .48);
				ctx.stroke();
				break;
			case "quad":
				roundRect(ctx, -w * .42, -h * .18, w * .78, h * .42, 8);
				ctx.fill();
				ctx.stroke();
				ellipse(ctx, w * .34, -h * .22, w * .2, h * .22);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-w * .3, h * .22);
				ctx.lineTo(-w * .32, h * .46);
				ctx.moveTo(-w * .08, h * .22);
				ctx.lineTo(-w * .04, h * .46);
				ctx.moveTo(w * .12, h * .22);
				ctx.lineTo(w * .1, h * .46);
				ctx.moveTo(w * .28, h * .22);
				ctx.lineTo(w * .32, h * .46);
				ctx.stroke();
				break;
			case "bird":
				ellipse(ctx, 0, 0, w * .4, h * .28);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.ellipse(-w * .1, -h * .05, w * .35, h * .12, -.4, 0, Math.PI * 2);
				ctx.stroke();
				break;
			case "fish":
				ellipse(ctx, -w * .08, 0, w * .38, h * .32);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(w * .22, 0);
				ctx.lineTo(w * .48, -h * .28);
				ctx.lineTo(w * .48, h * .28);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case "bug":
				ellipse(ctx, 0, 0, w * .4, h * .28);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-w * .2, 0);
				ctx.quadraticCurveTo(0, -h * .5, w * .2, 0);
				ctx.stroke();
				break;
			case "balloon":
				ellipse(ctx, 0, -h * .12, w * .42, h * .38);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(0, h * .26);
				ctx.lineTo(0, h * .48);
				ctx.stroke();
				break;
			case "flame":
				ctx.beginPath();
				ctx.moveTo(0, h * .45);
				ctx.bezierCurveTo(w * .5, h * .1, w * .2, -h * .4, 0, -h * .48);
				ctx.bezierCurveTo(-w * .2, -h * .2, -w * .5, h * .15, 0, h * .45);
				ctx.fill();
				ctx.stroke();
				break;
			case "drop":
				ctx.beginPath();
				ctx.moveTo(0, -h * .45);
				ctx.quadraticCurveTo(w * .5, h * .1, 0, h * .42);
				ctx.quadraticCurveTo(-w * .5, h * .1, 0, -h * .45);
				ctx.fill();
				ctx.stroke();
				break;
			case "tree":
				ctx.fillStyle = "#8A5A38";
				roundRect(ctx, -w * .14, h * .05, w * .28, h * .45, 3);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = it.color;
				ellipse(ctx, 0, -h * .18, w * .48, h * .38);
				ctx.fill();
				ctx.stroke();
				break;
			case "plant":
				ctx.beginPath();
				ctx.moveTo(0, h * .45);
				ctx.quadraticCurveTo(-w * .3, 0, -w * .1, -h * .4);
				ctx.moveTo(0, h * .45);
				ctx.quadraticCurveTo(w * .3, 0, w * .12, -h * .42);
				ctx.stroke();
				ellipse(ctx, 0, -h * .32, w * .28, h * .18);
				ctx.fill();
				ctx.stroke();
				break;
			case "ladder":
				ctx.strokeStyle = it.color;
				ctx.lineWidth = 4;
				ctx.beginPath();
				ctx.moveTo(-w * .32, -h * .48);
				ctx.lineTo(-w * .32, h * .48);
				ctx.moveTo(w * .32, -h * .48);
				ctx.lineTo(w * .32, h * .48);
				ctx.stroke();
				ctx.strokeStyle = it.ink;
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.beginPath();
				for (let y = -h * .4; y <= h * .4; y += 14) {
					ctx.moveTo(-w * .32, y);
					ctx.lineTo(w * .32, y);
				}
				ctx.stroke();
				break;
			case "plank":
				roundRect(ctx, -w / 2, -h / 2, w, h, 3);
				ctx.fill();
				ctx.stroke();
				break;
			case "weapon":
				ctx.beginPath();
				ctx.moveTo(-w * .48, 0);
				ctx.lineTo(w * .4, -h * .2);
				ctx.lineTo(w * .48, 0);
				ctx.lineTo(w * .4, h * .2);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = "#8A6238";
				roundRect(ctx, -w * .5, -h * .18, w * .28, h * .36, 2);
				ctx.fill();
				ctx.stroke();
				break;
			case "vehicle":
				roundRect(ctx, -w * .46, -h * .18, w * .92, h * .4, 6);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(-w * .28, h * .28, 7, 0, Math.PI * 2);
				ctx.arc(w * .26, h * .28, 7, 0, Math.PI * 2);
				ctx.fillStyle = INK;
				ctx.fill();
				break;
			case "boat":
				ctx.beginPath();
				ctx.moveTo(-w * .48, -h * .1);
				ctx.lineTo(w * .48, -h * .1);
				ctx.lineTo(w * .32, h * .38);
				ctx.lineTo(-w * .32, h * .38);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case "plane":
				ellipse(ctx, 0, 0, w * .46, h * .16);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-w * .1, 0);
				ctx.lineTo(0, -h * .45);
				ctx.lineTo(w * .1, 0);
				ctx.stroke();
				break;
			case "anvil":
				roundRect(ctx, -w * .46, -h * .38, w * .92, h * .22, 2);
				ctx.fill();
				ctx.stroke();
				roundRect(ctx, -w * .18, -h * .16, w * .36, h * .34, 2);
				ctx.fill();
				ctx.stroke();
				roundRect(ctx, -w * .32, h * .16, w * .64, h * .22, 2);
				ctx.fill();
				ctx.stroke();
				break;
			case "magnet":
				ctx.beginPath();
				ctx.arc(0, 0, w * .38, Math.PI, 0);
				ctx.lineTo(w * .38, h * .28);
				ctx.lineTo(w * .18, h * .28);
				ctx.lineTo(w * .18, 0);
				ctx.arc(0, 0, w * .18, 0, Math.PI, true);
				ctx.lineTo(-w * .18, h * .28);
				ctx.lineTo(-w * .38, h * .28);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = SAGE;
				roundRect(ctx, -w * .38, h * .12, w * .2, h * .18, 2);
				ctx.fill();
				break;
			case "star":
				star(ctx, 0, 0, 5, Math.min(w, h) * .42, Math.min(w, h) * .18);
				ctx.fill();
				ctx.stroke();
				break;
			case "food":
				ellipse(ctx, 0, 0, w * .42, h * .32);
				ctx.fill();
				ctx.stroke();
				break;
			case "rope":
				ctx.beginPath();
				ctx.moveTo(-w * .48, 0);
				ctx.quadraticCurveTo(0, h * .6, w * .48, 0);
				ctx.stroke();
				break;
			case "cloud":
				ellipse(ctx, -w * .18, 0, w * .28, h * .28);
				ctx.fill();
				ellipse(ctx, w * .12, -h * .04, w * .32, h * .32);
				ctx.fill();
				ellipse(ctx, w * .28, h * .06, w * .22, h * .22);
				ctx.fill();
				ctx.stroke();
				break;
			case "round":
				ellipse(ctx, 0, 0, w * .42, h * .42);
				ctx.fill();
				ctx.stroke();
				break;
			default:
				roundRect(ctx, -w / 2, -h / 2, w, h, 5);
				ctx.fill();
				ctx.stroke();
		}
		ctx.restore();
	}
};
function drawCell(ctx, img, frame, ox, oy, w, h, flip) {
	if (!img.complete || img.naturalWidth === 0) return;
	const col = frame % 2;
	const row = Math.floor(frame / 2);
	ctx.save();
	ctx.translate(ox, oy);
	if (flip) ctx.scale(-1, 1);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(img, col * CELL, row * CELL, CELL, CELL, -w / 2, -h / 2, w, h);
	ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
function ellipse(ctx, x, y, rx, ry) {
	ctx.beginPath();
	ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
}
function star(ctx, x, y, n, outer, inner) {
	ctx.beginPath();
	for (let i = 0; i < n * 2; i++) {
		const r = i % 2 === 0 ? outer : inner;
		const a = i * Math.PI / n - Math.PI / 2;
		const px = x + Math.cos(a) * r;
		const py = y + Math.sin(a) * r;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var emptyHud = {
	mode: "title",
	level: LEVELS[0],
	used: 0,
	budget: LEVELS[0].budget,
	selected: null,
	held: null,
	messages: [],
	won: false,
	grounded: false,
	hasSpark: false
};
function ObjectnautApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const [hud, setHud] = (0, import_react.useState)(emptyHud);
	const [query, setQuery] = (0, import_react.useState)("");
	const [puzzlesOpen, setPuzzlesOpen] = (0, import_react.useState)(false);
	const [wordsOpen, setWordsOpen] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	const queryRef = (0, import_react.useRef)(query);
	queryRef.current = query;
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const game = new ObjectnautGame();
		gameRef.current = game;
		const renderer = new PaperRenderer(canvas);
		renderer.resize();
		let acc = 0;
		let last = performance.now();
		let raf = 0;
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min(.1, (now - last) / 1e3);
			last = now;
			acc += dt;
			const STEP = 1 / 60;
			while (acc >= STEP) {
				game.step(STEP);
				acc -= STEP;
			}
			renderer.draw(game.view());
		};
		raf = requestAnimationFrame(loop);
		const onResize = () => renderer.resize();
		window.addEventListener("resize", onResize);
		const toWorld = (ev) => renderer.screenToWorld(ev.clientX, ev.clientY, game.view());
		const move = (ev) => {
			const w = toWorld(ev);
			game.pointerMove(w.x, w.y);
		};
		const down = (ev) => {
			if (ev.button !== 0) return;
			unlockAudio();
			const w = toWorld(ev);
			const place = queryRef.current.trim().length > 0 && game.pendingGhost != null;
			game.pointerDown(w.x, w.y, place);
		};
		canvas.addEventListener("pointermove", move);
		canvas.addEventListener("pointerdown", down);
		const hudTick = window.setInterval(() => setHud(game.hud()), 120);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
			canvas.removeEventListener("pointermove", move);
			canvas.removeEventListener("pointerdown", down);
			window.clearInterval(hudTick);
			game.destroy();
			gameRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		gameRef.current?.setPendingQuery(query);
	}, [query]);
	const hints = suggest(query, 6);
	const playing = hud.mode === "play" || hud.mode === "paused" || hud.mode === "win";
	function start(id) {
		unlockAudio();
		gameRef.current?.startLevel(id);
		setPuzzlesOpen(false);
		setHud(gameRef.current?.hud() ?? emptyHud);
		setHint(LEVELS.find((l) => l.id === id)?.hint ?? "");
	}
	function submitWord() {
		const g = gameRef.current;
		if (!g) return;
		unlockAudio();
		const res = g.spawnInFront(query);
		if (!res.ok) setHint(res.error ?? "Unknown word.");
		else {
			setQuery("");
			g.setPendingQuery("");
			setHint("");
		}
		setHud(g.hud());
		inputRef.current?.blur();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				style: { touchAction: "none" }
			}),
			hud.mode === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {
				onStart: () => start("playground"),
				onPuzzles: () => setPuzzlesOpen(true)
			}),
			playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudChrome, {
				hud,
				hint,
				onPause: () => {
					gameRef.current?.pauseToggle();
					setHud(gameRef.current?.hud() ?? hud);
				},
				onRestart: () => {
					gameRef.current?.restart();
					setHud(gameRef.current?.hud() ?? hud);
				},
				onMenu: () => {
					const g = gameRef.current;
					if (g) g.mode = "title";
					setHud(gameRef.current?.hud() ?? emptyHud);
				},
				onWords: () => setWordsOpen(true),
				onPuzzles: () => setPuzzlesOpen(true)
			}),
			playing && hud.mode !== "win" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notebook, {
				query,
				setQuery,
				hints,
				inputRef,
				onSubmit: submitWord,
				used: hud.used,
				budget: hud.budget
			}),
			playing && hud.selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {
				info: hud.selected,
				onClose: () => {
					const g = gameRef.current;
					if (g) g.selectedId = null;
					setHud(g?.hud() ?? hud);
				}
			}),
			hud.mode === "play" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, { gameRef }),
			hud.mode === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				title: "Paused",
				body: hud.level.blurb,
				actions: [{
					label: "Resume",
					primary: true,
					onClick: () => {
						gameRef.current?.pauseToggle();
						setHud(gameRef.current?.hud() ?? hud);
					}
				}, {
					label: "Restart page",
					onClick: () => gameRef.current?.restart()
				}]
			}),
			hud.mode === "win" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				title: "Spark collected",
				body: `Otto wrote ${hud.used} object${hud.used === 1 ? "" : "s"}${hud.level.par ? ` · par ${hud.level.par}` : ""}.`,
				actions: [{
					label: "Next page",
					primary: true,
					onClick: () => {
						start((LEVELS[LEVELS.findIndex((l) => l.id === hud.level.id) + 1] ?? LEVELS[0]).id);
					}
				}, {
					label: "Replay",
					onClick: () => start(hud.level.id)
				}]
			}),
			puzzlesOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PuzzleList, {
				onClose: () => setPuzzlesOpen(false),
				onPick: (id) => start(id)
			}),
			wordsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordList, {
				onClose: () => setWordsOpen(false),
				onPick: (w) => {
					setQuery(w);
					setWordsOpen(false);
					inputRef.current?.focus();
				}
			})
		]
	});
}
function TitleScreen({ onStart, onPuzzles }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex flex-col justify-end bg-paper/80 px-5 pb-10 pt-16 sm:justify-center sm:px-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-lg rounded-xl border border-line bg-panel/95 p-6 shadow-[0_16px_40px_rgba(44,36,22,0.12)] sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium tracking-wide text-muted",
					children: "A notebook physics sandbox"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl",
					children: "Objectnaut"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-base leading-relaxed text-ink-soft",
					children: "Write a noun. Categories inherit temperament. Adjectives flip the bits. Otto walks; the objects decide the rest."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-5 space-y-1.5 text-sm text-ink-soft",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Move with A / D or tap the page. Jump with W." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Type a word, then Enter or tap to place it." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tap an object to inspect the flags it inherited." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onStart,
						className: "inline-flex min-h-11 items-center justify-center rounded-md bg-clay px-5 text-sm font-semibold text-clay-fg transition-transform duration-150 ease-out hover:brightness-95 active:scale-[0.98]",
						children: "Start"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onPuzzles,
						className: "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-paper px-5 text-sm font-semibold text-ink transition-transform duration-150 ease-out hover:bg-paper-2 active:scale-[0.98]",
						children: "Puzzles"
					})]
				})
			]
		})
	});
}
function HudChrome({ hud, hint, onPause, onRestart, onMenu, onWords, onPuzzles }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-line bg-panel/92 px-3 py-2 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-semibold leading-tight text-ink",
						children: hud.level.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							hud.used,
							"/",
							hud.budget,
							" written",
							hud.held ? ` · holding ${hud.held}` : ""
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: "Words",
							onClick: onWords,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: "Restart",
							onClick: onRestart,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: hud.mode === "paused" ? "Resume" : "Pause",
							onClick: onPause,
							children: hud.mode === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
						})
					]
				})]
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md rounded-md bg-ink/80 px-3 py-1.5 text-xs text-paper",
				children: hint
			}),
			hud.messages[0] && !hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-xs text-ink-soft",
				children: hud.messages[0]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto mt-1 hidden gap-2 sm:flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onPuzzles,
					className: "text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline",
					children: "Pages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onMenu,
					className: "text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline",
					children: "Title"
				})]
			})
		]
	});
}
function IconBtn({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "inline-flex size-11 items-center justify-center rounded-md border border-line bg-panel text-ink transition-transform duration-150 hover:bg-paper-2 active:scale-[0.98]",
		children
	});
}
function Notebook({ query, setQuery, hints, inputRef, onSubmit, used, budget }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mb-20 max-w-xl rounded-xl border border-line bg-panel/95 p-2 shadow-[0_-8px_30px_rgba(44,36,22,0.08)] sm:mb-4 sm:p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					onSubmit();
				},
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Write anything — ladder, giant balloon, sleeping lion",
					className: "h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 font-display text-base text-ink outline-none placeholder:text-muted focus:border-clay",
					autoComplete: "off",
					autoCorrect: "off",
					spellCheck: false,
					"aria-label": "Object notebook"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					disabled: used >= budget,
					className: "inline-flex h-11 shrink-0 items-center gap-1 rounded-md bg-clay px-4 text-sm font-semibold text-clay-fg disabled:opacity-40",
					children: ["Write", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
				})]
			}), hints.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: hints.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setQuery(h),
					className: "rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft hover:border-clay hover:text-ink",
					children: h
				}, h))
			})]
		})
	});
}
function Inspector({ info, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "absolute right-3 top-24 z-20 hidden w-64 rounded-lg border border-line bg-panel/95 p-4 shadow-sm md:block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-semibold leading-tight text-ink",
					children: info.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 font-mono text-[11px] text-muted",
					children: info.path.join(" · ") || "uncategorized"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Close inspector",
					onClick: onClose,
					className: "rounded-sm p-1 text-muted hover:text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			info.adjectives.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-clay",
				children: info.adjectives.join(", ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1",
				children: info.props.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft",
					children: p
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 space-y-1 text-[11px] text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["material · ", info.material] }),
					info.hunt.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["hunts · ", info.hunt.join(", ")] }),
					info.fear.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["fears · ", info.fear.join(", ")] }),
					info.eat.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["eats · ", info.eat.join(", ")] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["hp · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: info.hp
					})] })
				]
			})
		]
	});
}
function TouchPad({ gameRef }) {
	const hold = (code) => ({
		onPointerDown: (e) => {
			e.preventDefault();
			gameRef.current?.setAction(code, true);
		},
		onPointerUp: () => gameRef.current?.setAction(code, false),
		onPointerLeave: () => gameRef.current?.setAction(code, false),
		onPointerCancel: () => gameRef.current?.setAction(code, false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-28 z-20 flex items-end justify-between px-3 sm:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
				label: "Left",
				...hold("KeyA"),
				children: "A"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
				label: "Right",
				...hold("KeyD"),
				children: "D"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
				label: "Grab",
				onPointerDown: () => gameRef.current?.tryPickup(),
				children: "E"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
				label: "Jump",
				...hold("Space"),
				children: "W"
			})]
		})]
	});
}
function PadBtn({ children, label, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: "inline-flex size-14 items-center justify-center rounded-lg border border-line bg-panel/90 font-display text-lg font-semibold text-ink active:bg-paper-2",
		...rest,
		children
	});
}
function Modal({ title, body, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/30 px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-line bg-panel p-6 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-semibold text-ink",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-ink-soft",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: actions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: a.onClick,
						className: cn("inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold", a.primary ? "bg-clay text-clay-fg" : "border border-line bg-paper text-ink"),
						children: a.label
					}, a.label))
				})
			]
		})
	});
}
function PuzzleList({ onClose, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-end justify-center bg-ink/35 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-line bg-panel p-5 sm:rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-semibold",
					children: "Pages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Close",
					onClick: onClose,
					className: "size-10 rounded-md text-muted hover:text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onPick(l.id),
					className: "flex w-full items-start justify-between gap-3 rounded-md border border-line bg-paper px-3 py-3 text-left hover:border-clay",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-base font-semibold",
						children: l.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-sm text-ink-soft",
						children: l.blurb
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-xs tabular-nums text-muted",
						children: [l.budget, " words"]
					})]
				}) }, l.id))
			})]
		})
	});
}
function WordList({ onClose, onPick }) {
	const nouns = OBJECTS.map((o) => o.names[0]);
	const extras = allWords().filter((w) => !nouns.includes(w));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-end justify-center bg-ink/35 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-line bg-panel p-5 sm:rounded-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold",
						children: "Word list"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "size-10 rounded-md text-muted hover:text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Prefix any noun with giant, tiny, flying, hot, frozen, hungry, friendly, sleeping…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-1.5",
					children: nouns.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onPick(w),
						className: "rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium hover:border-clay",
						children: w
					}, w))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs font-medium uppercase tracking-wide text-muted",
					children: "Adjectives"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-1.5",
					children: extras.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onPick(w),
						className: "rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink-soft hover:text-ink",
						children: w
					}, w))
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectnautApp, {});
}
//#endregion
export { Home as component };
