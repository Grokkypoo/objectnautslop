/**
 * Paper-notebook renderer.
 *
 * Ruled background, ink sketches for unsprited nouns, sprite sheets for Otto,
 * cat, lion, spark, fire. Sheets are magenta-keyed PNGs in /public/sprites.
 *
 * Cell size is inferred: image.width / cols. Lion idle/walk are 256px cells;
 * lion sleep is 128px. feetPad is a fraction of that cell so feet sit on the
 * Matter body. After replacing a PNG, bump the `?v=` on load() or the browser
 * will keep the old sheet.
 *
 * Lion sleep is the art bar (cream fill, walnut outline, lying pose). Idle and
 * walk were rebuilt/rejected several times — current idle is the first 2×2
 * (28bb0a14 lineage), walk is video frames 20–27 at 256px, 8 fps. Do not
 * even-sample a 6s clip; that moonwalks and hops.
 */
import type { DrawItem, WorldView } from "./engine";

const PAPER = "#F3E6C9";
const INK = "#2C2416";
const TERRACOTTA = "#C45C3E";
const SAGE = "#4F6F5A";

type Sheets = {
  ottoIdle: HTMLImageElement;
  ottoWalk: HTMLImageElement;
  spark: HTMLImageElement;
  fire: HTMLImageElement;
  catIdle: HTMLImageElement;
  catWalk: HTMLImageElement;
  lionIdle: HTMLImageElement;
  lionWalk: HTMLImageElement;
  lionSleep: HTMLImageElement;
};

function load(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  return img;
}

export class PaperRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  sheets: Sheets;
  dpr = 1;
  cssW = 960;
  cssH = 540;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    this.ctx = ctx;
    this.sheets = {
      ottoIdle: load("/sprites/otto-idle.png?v=walk3"),
      ottoWalk: load("/sprites/otto-walk.png?v=walk3"),
      spark: load("/sprites/spark.png"),
      fire: load("/sprites/fire.png"),
      catIdle: load("/sprites/cat-idle.png"),
      catWalk: load("/sprites/cat-walk.png?v=walk3"),
      lionIdle: load("/sprites/lion-idle.png?v=7"),
      lionWalk: load("/sprites/lion-walk.png?v=9"),
      lionSleep: load("/sprites/lion-sleep.png?v=5"),
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

  screenToWorld(clientX: number, clientY: number, view: WorldView) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * this.cssW;
    const y = ((clientY - rect.top) / rect.height) * this.cssH;
    const scale = this.worldScale();
    return { x: view.camX + x / scale, y: view.camY + y / scale };
  }

  worldScale() {
    return this.cssW / 960;
  }

  draw(view: WorldView) {
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

  private paintPaper(view: WorldView) {
    const ctx = this.ctx;
    const x0 = view.camX - 20;
    const y0 = view.camY - 20;
    const w = 960 + 80;
    const h = 540 + 80;
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

  private drawPlatform(p: { x: number; y: number; w: number; h: number }) {
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

  private drawWater(w: { x: number; y: number; w: number; h: number }, t: number) {
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
    for (let x = -w.w / 2; x <= w.w / 2; x += 10) {
      ctx.lineTo(x, -w.h / 2 + Math.sin(x * 0.08 + t * 3) * 3);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawGhost(g: NonNullable<WorldView["ghost"]>) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.translate(g.x, g.y);
    ctx.strokeStyle = TERRACOTTA;
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    roundRect(ctx, -g.w / 2, -g.h / 2, g.w, g.h, 6);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.7;
    ctx.font = "600 12px Figtree, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(g.label, 0, -g.h / 2 - 8);
    ctx.restore();
  }

  private drawParticle(p: WorldView["particles"][number]) {
    const ctx = this.ctx;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawItem(it: DrawItem, view: WorldView) {
    const ctx = this.ctx;
    if (it.kind === "object" || it.kind === "player") {
      ctx.save();
      ctx.fillStyle = "rgba(44,36,22,0.14)";
      ctx.beginPath();
      ctx.ellipse(it.x, it.y + it.h * 0.5, Math.max(10, it.w * 0.38), 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.angle);
    if (it.sprite === "otto") {
      const img = it.walking ? this.sheets.ottoWalk : this.sheets.ottoIdle;
      const cols = it.walking ? 4 : 2;
      const frames = it.walking ? 8 : 4;
      const frame = Math.floor(view.time * (it.walking ? 12 : 5)) % frames;
      const drawW = 46;
      const drawH = 70;
      const feetPad = (it.walking ? 10 : 9) / 128;
      const oy = it.h * 0.5 - drawH * 0.5 + feetPad * drawH;
      drawCell(ctx, img, frame, 0, oy, drawW, drawH, it.flip, cols);
    } else if (it.sprite === "cat") {
      const img = it.walking ? this.sheets.catWalk : this.sheets.catIdle;
      const cols = it.walking ? 4 : 2;
      const frames = it.walking ? 8 : 4;
      const frame = Math.floor(view.time * (it.walking ? 12 : 5) + it.id) % frames;
      const cw = Math.max(52, it.w * 1.65);
      const ch = Math.max(40, it.h * 1.85);
      drawCell(ctx, img, frame, 0, it.h * 0.5 - ch * 0.48, cw, ch, it.flip, cols);
    } else if (it.sprite === "lion") {
      // Sleep sheet is 2×2 @ 128px; idle/walk are 2×2 and 4×2 @ 256px.
      // Same on-screen draw box so a standing lion is the same creature as the lying one.
      const sleeping = it.sleeping;
      const walking = !sleeping && it.walking;
      const img = sleeping ? this.sheets.lionSleep : walking ? this.sheets.lionWalk : this.sheets.lionIdle;
      const cols = walking ? 4 : 2;
      const frames = walking ? 8 : 4;
      const frame = Math.floor(view.time * (sleeping ? 3 : walking ? 8 : 5) + it.id) % frames;
      const drawW = Math.max(158, it.w * 2.3);
      const drawH = sleeping ? Math.max(170, it.h * 3.7) : Math.max(158, it.h * 3.4);
      const feetPad = walking ? 24 / 256 : sleeping ? 12 / 128 : 22 / 256;
      const oy = it.h * 0.5 - drawH * 0.5 + feetPad * drawH;
      drawCell(ctx, img, frame, 0, oy, drawW, drawH, it.flip, cols);
    } else if (it.sprite === "spark") {
      const frame = Math.floor(view.time * 8) % 4;
      const bob = Math.sin(view.time * 3) * 4;
      drawCell(ctx, this.sheets.spark, frame, 0, bob, 42, 42, false);
    } else if (it.sprite === "fire" && (it.draw === "flame" || it.onFire)) {
      if (it.draw !== "flame") this.sketch(it);
      const frame = Math.floor(view.time * 12 + it.id) % 4;
      drawCell(ctx, this.sheets.fire, frame, 0, it.draw === "flame" ? 0 : -it.h * 0.2, it.w * 1.1, it.h * 1.2, false);
    } else {
      this.sketch(it);
    }
    if (it.sleeping) {
      ctx.fillStyle = INK;
      ctx.font = "600 11px Figtree, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("zz", 16, -it.h * 0.45);
    }
    ctx.restore();
    if (view.inspecting && it.selected && it.kind === "object") {
      ctx.save();
      ctx.strokeStyle = TERRACOTTA;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(it.x, it.y + 2, it.w * 0.55, it.h * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (view.inspecting && it.label && it.kind === "object") {
      ctx.save();
      ctx.fillStyle = "rgba(44,36,22,0.72)";
      ctx.font = "600 11px Figtree, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(it.label, it.x, it.y + it.h * 0.5 + 12);
      ctx.restore();
    }
  }

  private sketch(it: DrawItem) {
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
        ellipse(ctx, 0, -h * 0.32, w * 0.38, h * 0.18);
        ctx.fill();
        ctx.stroke();
        roundRect(ctx, -w * 0.28, -h * 0.14, w * 0.56, h * 0.38, 4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.16, h * 0.24);
        ctx.lineTo(-w * 0.2, h * 0.48);
        ctx.moveTo(w * 0.16, h * 0.24);
        ctx.lineTo(w * 0.22, h * 0.48);
        ctx.stroke();
        break;
      case "quad":
        roundRect(ctx, -w * 0.42, -h * 0.18, w * 0.78, h * 0.42, 8);
        ctx.fill();
        ctx.stroke();
        ellipse(ctx, w * 0.34, -h * 0.22, w * 0.2, h * 0.22);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, h * 0.22);
        ctx.lineTo(-w * 0.32, h * 0.46);
        ctx.moveTo(-w * 0.08, h * 0.22);
        ctx.lineTo(-w * 0.04, h * 0.46);
        ctx.moveTo(w * 0.12, h * 0.22);
        ctx.lineTo(w * 0.1, h * 0.46);
        ctx.moveTo(w * 0.28, h * 0.22);
        ctx.lineTo(w * 0.32, h * 0.46);
        ctx.stroke();
        break;
      case "bird":
        ellipse(ctx, 0, 0, w * 0.4, h * 0.28);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-w * 0.1, -h * 0.05, w * 0.35, h * 0.12, -0.4, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "fish":
        ellipse(ctx, -w * 0.08, 0, w * 0.38, h * 0.32);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.22, 0);
        ctx.lineTo(w * 0.48, -h * 0.28);
        ctx.lineTo(w * 0.48, h * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case "bug":
        ellipse(ctx, 0, 0, w * 0.4, h * 0.28);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, 0);
        ctx.quadraticCurveTo(0, -h * 0.5, w * 0.2, 0);
        ctx.stroke();
        break;
      case "balloon":
        ellipse(ctx, 0, -h * 0.12, w * 0.42, h * 0.38);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, h * 0.26);
        ctx.lineTo(0, h * 0.48);
        ctx.stroke();
        break;
      case "flame":
        ctx.beginPath();
        ctx.moveTo(0, h * 0.45);
        ctx.bezierCurveTo(w * 0.5, h * 0.1, w * 0.2, -h * 0.4, 0, -h * 0.48);
        ctx.bezierCurveTo(-w * 0.2, -h * 0.2, -w * 0.5, h * 0.15, 0, h * 0.45);
        ctx.fill();
        ctx.stroke();
        break;
      case "drop":
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.45);
        ctx.quadraticCurveTo(w * 0.5, h * 0.1, 0, h * 0.42);
        ctx.quadraticCurveTo(-w * 0.5, h * 0.1, 0, -h * 0.45);
        ctx.fill();
        ctx.stroke();
        break;
      case "tree": {
        ctx.fillStyle = "#8A5A38";
        roundRect(ctx, -w * 0.09, h * 0.02, w * 0.18, h * 0.48, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = it.onFire ? "#C45C3E" : it.color;
        ellipse(ctx, 0, -h * 0.22, w * 0.46, h * 0.34);
        ctx.fill();
        ctx.stroke();
        ellipse(ctx, -w * 0.22, -h * 0.06, w * 0.3, h * 0.22);
        ctx.fill();
        ctx.stroke();
        ellipse(ctx, w * 0.22, -h * 0.06, w * 0.3, h * 0.22);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "plant":
        ctx.beginPath();
        ctx.moveTo(0, h * 0.45);
        ctx.quadraticCurveTo(-w * 0.3, 0, -w * 0.1, -h * 0.4);
        ctx.moveTo(0, h * 0.45);
        ctx.quadraticCurveTo(w * 0.3, 0, w * 0.12, -h * 0.42);
        ctx.stroke();
        ellipse(ctx, 0, -h * 0.32, w * 0.28, h * 0.18);
        ctx.fill();
        ctx.stroke();
        break;
      case "ladder":
        ctx.strokeStyle = it.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-w * 0.32, -h * 0.48);
        ctx.lineTo(-w * 0.32, h * 0.48);
        ctx.moveTo(w * 0.32, -h * 0.48);
        ctx.lineTo(w * 0.32, h * 0.48);
        ctx.stroke();
        ctx.strokeStyle = it.ink;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        for (let y = -h * 0.4; y <= h * 0.4; y += 14) {
          ctx.moveTo(-w * 0.32, y);
          ctx.lineTo(w * 0.32, y);
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
        ctx.moveTo(-w * 0.48, 0);
        ctx.lineTo(w * 0.4, -h * 0.2);
        ctx.lineTo(w * 0.48, 0);
        ctx.lineTo(w * 0.4, h * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#8A6238";
        roundRect(ctx, -w * 0.5, -h * 0.18, w * 0.28, h * 0.36, 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "vehicle":
        roundRect(ctx, -w * 0.46, -h * 0.18, w * 0.92, h * 0.4, 6);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-w * 0.28, h * 0.28, 7, 0, Math.PI * 2);
        ctx.arc(w * 0.26, h * 0.28, 7, 0, Math.PI * 2);
        ctx.fillStyle = INK;
        ctx.fill();
        break;
      case "boat":
        ctx.beginPath();
        ctx.moveTo(-w * 0.48, -h * 0.1);
        ctx.lineTo(w * 0.48, -h * 0.1);
        ctx.lineTo(w * 0.32, h * 0.38);
        ctx.lineTo(-w * 0.32, h * 0.38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case "plane":
        ellipse(ctx, 0, 0, w * 0.46, h * 0.16);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.1, 0);
        ctx.lineTo(0, -h * 0.45);
        ctx.lineTo(w * 0.1, 0);
        ctx.stroke();
        break;
      case "anvil":
        roundRect(ctx, -w * 0.46, -h * 0.38, w * 0.92, h * 0.22, 2);
        ctx.fill();
        ctx.stroke();
        roundRect(ctx, -w * 0.18, -h * 0.16, w * 0.36, h * 0.34, 2);
        ctx.fill();
        ctx.stroke();
        roundRect(ctx, -w * 0.32, h * 0.16, w * 0.64, h * 0.22, 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "magnet":
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.38, Math.PI, 0);
        ctx.lineTo(w * 0.38, h * 0.28);
        ctx.lineTo(w * 0.18, h * 0.28);
        ctx.lineTo(w * 0.18, 0);
        ctx.arc(0, 0, w * 0.18, 0, Math.PI, true);
        ctx.lineTo(-w * 0.18, h * 0.28);
        ctx.lineTo(-w * 0.38, h * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = SAGE;
        roundRect(ctx, -w * 0.38, h * 0.12, w * 0.2, h * 0.18, 2);
        ctx.fill();
        break;
      case "star":
        star(ctx, 0, 0, 5, Math.min(w, h) * 0.42, Math.min(w, h) * 0.18);
        ctx.fill();
        ctx.stroke();
        break;
      case "food":
        ellipse(ctx, 0, 0, w * 0.42, h * 0.32);
        ctx.fill();
        ctx.stroke();
        break;
      case "rope":
        ctx.beginPath();
        ctx.moveTo(-w * 0.48, 0);
        ctx.quadraticCurveTo(0, h * 0.6, w * 0.48, 0);
        ctx.stroke();
        break;
      case "cloud":
        ellipse(ctx, -w * 0.18, 0, w * 0.28, h * 0.28);
        ctx.fill();
        ellipse(ctx, w * 0.12, -h * 0.04, w * 0.32, h * 0.32);
        ctx.fill();
        ellipse(ctx, w * 0.28, h * 0.06, w * 0.22, h * 0.22);
        ctx.fill();
        ctx.stroke();
        break;
      case "round":
        ellipse(ctx, 0, 0, w * 0.42, h * 0.42);
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
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frame: number,
  ox: number,
  oy: number,
  w: number,
  h: number,
  flip: boolean,
  cols = 2,
) {
  if (!img.complete || img.naturalWidth === 0) return;
  const cell = img.naturalWidth / cols;
  const rows = Math.max(1, Math.round(img.naturalHeight / cell));
  const col = frame % cols;
  const row = Math.floor(frame / cols) % rows;
  ctx.save();
  ctx.translate(ox, oy);
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, col * cell, row * cell, cell, cell, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / n - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
