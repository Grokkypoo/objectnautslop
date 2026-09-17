/**
 * Objectnaut HUD + game loop.
 *
 * Canvas is the world. Overlays: title, notepad (notepad icon, docks under
 * the top-right tools), inspect card (only while the magnifying glass is on),
 * right-click/long-press action menu (grab, copy, erase, sleep).
 *
 * Do not open inspect on every object click — that was rejected. Do not put
 * the summoner on the bottom of the screen — it belongs under the icon stack.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Copy,
  Hand,
  Moon,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { unlockAudio } from "@/game/audio";
import { allWords, OBJECTS, suggest } from "@/game/catalog";
import { ObjectnautGame, type HudState, type ObjectActionInfo } from "@/game/engine";
import { LEVELS } from "@/game/levels";
import { PaperRenderer } from "@/game/render";
import { cn } from "@/lib/utils";

const emptyHud: HudState = {
  mode: "title",
  level: LEVELS[0]!,
  used: 0,
  budget: LEVELS[0]!.budget,
  selected: null,
  held: null,
  messages: [],
  won: false,
  grounded: false,
  hasSpark: false,
  inspecting: false,
};

export function ObjectnautApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<ObjectnautGame | null>(null);
  const [hud, setHud] = useState<HudState>(emptyHud);
  const [query, setQuery] = useState("");
  const [puzzlesOpen, setPuzzlesOpen] = useState(false);
  const [wordsOpen, setWordsOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [menu, setMenu] = useState<(ObjectActionInfo & { x: number; y: number }) | null>(null);
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef(query);
  const notebookOpenRef = useRef(notebookOpen);
  queryRef.current = query;
  notebookOpenRef.current = notebookOpen;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new ObjectnautGame();
    gameRef.current = game;
    const renderer = new PaperRenderer(canvas);
    renderer.resize();
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
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

    const toWorld = (ev: { clientX: number; clientY: number }) =>
      renderer.screenToWorld(ev.clientX, ev.clientY, game.view());
    const openMenu = (ev: { clientX: number; clientY: number }) => {
      if (game.mode !== "play") return false;
      const w = toWorld(ev);
      const info = game.objectActionsAt(w.x, w.y);
      if (!info) {
        setMenu(null);
        return false;
      }
      game.cancelPointer();
      setMenu({ ...info, x: ev.clientX, y: ev.clientY });
      return true;
    };
    let longTimer = 0;
    const clearLong = () => {
      if (longTimer) {
        window.clearTimeout(longTimer);
        longTimer = 0;
      }
    };
    const move = (ev: PointerEvent) => {
      const w = toWorld(ev);
      game.pointerMove(w.x, w.y);
      canvas.style.cursor = game.cursor;
      if (game.cursor === "grabbing") clearLong();
    };
    const down = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      unlockAudio();
      setMenu(null);
      canvas.setPointerCapture(ev.pointerId);
      const w = toWorld(ev);
      const place = notebookOpenRef.current && queryRef.current.trim().length > 0 && game.pendingGhost != null;
      game.pointerDown(w.x, w.y, place);
      canvas.style.cursor = game.cursor;
      clearLong();
      const sx = ev.clientX;
      const sy = ev.clientY;
      longTimer = window.setTimeout(() => {
        longTimer = 0;
        if (openMenu({ clientX: sx, clientY: sy })) {
          try {
            canvas.releasePointerCapture(ev.pointerId);
          } catch {
            /* already released */
          }
        }
      }, 480);
    };
    const up = () => {
      clearLong();
      game.pointerUp();
      canvas.style.cursor = game.cursor;
    };
    const onContext = (ev: MouseEvent) => {
      ev.preventDefault();
      openMenu(ev);
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("contextmenu", onContext);

    const hudTick = window.setInterval(() => setHud(game.hud()), 120);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("contextmenu", onContext);
      clearLong();
      window.clearInterval(hudTick);
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    gameRef.current?.setPendingQuery(notebookOpen ? query : "");
  }, [query, notebookOpen]);

  useEffect(() => {
    if (notebookOpen) inputRef.current?.focus();
  }, [notebookOpen]);

  const hints = suggest(query, 6);
  const playing = hud.mode === "play" || hud.mode === "paused" || hud.mode === "win";

  function start(id: string) {
    unlockAudio();
    gameRef.current?.startLevel(id);
    setPuzzlesOpen(false);
    setMenu(null);
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

  return (
    <main className="relative h-dvh overflow-hidden bg-paper text-ink">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ touchAction: "none" }}
      />

      {hud.mode === "title" && (
        <TitleScreen
          onStart={() => start("playground")}
          onPuzzles={() => setPuzzlesOpen(true)}
        />
      )}

      {playing && (
        <HudChrome
          hud={hud}
          hint={hint}
          onPause={() => {
            gameRef.current?.pauseToggle();
            setHud(gameRef.current?.hud() ?? hud);
          }}
          onRestart={() => {
            gameRef.current?.restart();
            setHud(gameRef.current?.hud() ?? hud);
          }}
          onMenu={() => {
            const g = gameRef.current;
            if (g) g.mode = "title";
            setHud(gameRef.current?.hud() ?? emptyHud);
          }}
          onPuzzles={() => setPuzzlesOpen(true)}
          onInspect={() => {
            gameRef.current?.toggleInspect();
            setHud(gameRef.current?.hud() ?? hud);
          }}
          notebookOpen={notebookOpen}
          onNotebook={() => setNotebookOpen((v) => !v)}
          query={query}
          setQuery={setQuery}
          hints={hints}
          inputRef={inputRef}
          onSubmit={submitWord}
          onWords={() => setWordsOpen(true)}
          onCloseInspect={() => {
            const g = gameRef.current;
            if (g) g.selectedId = null;
            setHud(g?.hud() ?? hud);
          }}
        />
      )}

      {hud.mode === "play" && <TouchPad gameRef={gameRef} />}

      {menu && hud.mode === "play" && (
        <ObjectMenu
          menu={menu}
          onClose={() => setMenu(null)}
          onGrab={() => {
            gameRef.current?.actGrab(menu.id);
            setMenu(null);
            setHud(gameRef.current?.hud() ?? hud);
          }}
          onDuplicate={() => {
            const res = gameRef.current?.actDuplicate(menu.id);
            if (res && !res.ok) setHint(res.error ?? "Could not copy.");
            setMenu(null);
            setHud(gameRef.current?.hud() ?? hud);
          }}
          onSleep={() => {
            gameRef.current?.actSleep(menu.id);
            setMenu(null);
            setHud(gameRef.current?.hud() ?? hud);
          }}
          onDelete={() => {
            gameRef.current?.actDelete(menu.id);
            setMenu(null);
            setHud(gameRef.current?.hud() ?? hud);
          }}
        />
      )}

      {hud.mode === "paused" && (
        <Modal
          title="Paused"
          body={hud.level.blurb}
          actions={[
            { label: "Resume", primary: true, onClick: () => { gameRef.current?.pauseToggle(); setHud(gameRef.current?.hud() ?? hud); } },
            { label: "Restart page", onClick: () => gameRef.current?.restart() },
          ]}
        />
      )}

      {hud.mode === "win" && (
        <Modal
          title="Spark collected"
          body={`Otto wrote ${hud.used} object${hud.used === 1 ? "" : "s"}${hud.level.par ? ` · par ${hud.level.par}` : ""}.`}
          actions={[
            {
              label: "Next page",
              primary: true,
              onClick: () => {
                const i = LEVELS.findIndex((l) => l.id === hud.level.id);
                const next = LEVELS[i + 1] ?? LEVELS[0]!;
                start(next.id);
              },
            },
            { label: "Replay", onClick: () => start(hud.level.id) },
          ]}
        />
      )}

      {puzzlesOpen && (
        <PuzzleList
          onClose={() => setPuzzlesOpen(false)}
          onPick={(id) => start(id)}
        />
      )}
      {wordsOpen && <WordList onClose={() => setWordsOpen(false)} onPick={(w) => { setQuery(w); setWordsOpen(false); inputRef.current?.focus(); }} />}
    </main>
  );
}

function TitleScreen({ onStart, onPuzzles }: { onStart: () => void; onPuzzles: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-paper/80 px-5 pb-10 pt-16 sm:justify-center sm:px-12">
      <div className="mx-auto w-full max-w-lg rounded-xl border border-line bg-panel/95 p-6 shadow-[0_16px_40px_rgba(44,36,22,0.12)] sm:p-8">
        <p className="text-sm font-medium tracking-wide text-muted">A notebook physics sandbox</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
          Objectnaut
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
          Write a noun. Categories inherit temperament. Adjectives flip the bits. Otto walks; the objects decide the rest.
        </p>
        <ul className="mt-5 space-y-1.5 text-sm text-ink-soft">
          <li>Move with A / D or tap the page. Jump with W.</li>
          <li>The notepad writes objects. Enter or tap the page to place them.</li>
          <li>Drag anything already written to move it.</li>
          <li>Right-click an object — or press and hold — for grab, copy, or erase.</li>
          <li>The magnifying glass reads an object’s inherited flags.</li>
        </ul>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-clay px-5 text-sm font-semibold text-clay-fg transition-transform duration-150 ease-out hover:brightness-95 active:scale-[0.98]"
          >
            Start
          </button>
          <button
            type="button"
            onClick={onPuzzles}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-paper px-5 text-sm font-semibold text-ink transition-transform duration-150 ease-out hover:bg-paper-2 active:scale-[0.98]"
          >
            Puzzles
          </button>
        </div>
      </div>
    </div>
  );
}

function HudChrome({
  hud,
  hint,
  onPause,
  onRestart,
  onMenu,
  onWords,
  onPuzzles,
  onInspect,
  notebookOpen,
  onNotebook,
  query,
  setQuery,
  hints,
  inputRef,
  onSubmit,
  onCloseInspect,
}: {
  hud: HudState;
  hint: string;
  onPause: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onWords: () => void;
  onPuzzles: () => void;
  onInspect: () => void;
  notebookOpen: boolean;
  onNotebook: () => void;
  query: string;
  setQuery: (v: string) => void;
  hints: string[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onCloseInspect: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="pointer-events-auto min-w-0">
        <div className="rounded-lg border border-line bg-panel/92 px-3 py-2 shadow-sm">
          <p className="font-display text-lg font-semibold leading-tight text-ink">{hud.level.title}</p>
          <p className="text-xs text-muted">
            {hud.used}/{hud.budget} written
            {hud.held ? ` · holding ${hud.held}` : ""}
          </p>
        </div>
        {hint && (
          <p className="mt-2 max-w-md rounded-md bg-ink/80 px-3 py-1.5 text-xs text-paper">{hint}</p>
        )}
        {hud.messages[0] && !hint && (
          <p className="mt-2 max-w-md text-xs text-ink-soft">{hud.messages[0]}</p>
        )}
        <div className="mt-2 hidden gap-2 sm:flex">
          <button type="button" onClick={onPuzzles} className="text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
            Pages
          </button>
          <button type="button" onClick={onMenu} className="text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
            Title
          </button>
        </div>
      </div>

      <div className="pointer-events-auto flex flex-col items-end gap-1.5">
        <div className="flex gap-1.5">
          <IconBtn label="Restart" onClick={onRestart}><RotateCcw className="size-4" /></IconBtn>
          <IconBtn label={hud.mode === "paused" ? "Resume" : "Pause"} onClick={onPause}>
            {hud.mode === "paused" ? <Play className="size-4" /> : <Pause className="size-4" />}
          </IconBtn>
          <IconBtn
            label={hud.inspecting ? "Stop inspecting" : "Inspect"}
            onClick={onInspect}
            pressed={hud.inspecting}
          >
            <Search className="size-4" />
          </IconBtn>
          <IconBtn
            label={notebookOpen ? "Close notepad" : "Notepad"}
            onClick={onNotebook}
            pressed={notebookOpen}
          >
            <NotebookPen className="size-4" />
          </IconBtn>
        </div>
        {notebookOpen && hud.mode !== "win" && (
          <Notebook
            query={query}
            setQuery={setQuery}
            hints={hints}
            inputRef={inputRef}
            onSubmit={onSubmit}
            used={hud.used}
            budget={hud.budget}
            onWords={onWords}
          />
        )}
        {hud.inspecting && !hud.selected && (
          <p className="text-right text-xs text-ink-soft">Tap an object to read its flags.</p>
        )}
        {hud.inspecting && hud.selected && (
          <Inspector info={hud.selected} onClose={onCloseInspect} />
        )}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  pressed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed ?? undefined}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md border text-ink transition-transform duration-150 active:scale-[0.98]",
        pressed
          ? "border-clay bg-clay text-clay-fg hover:brightness-95"
          : "border-line bg-panel hover:bg-paper-2",
      )}
    >
      {children}
    </button>
  );
}

function Notebook({
  query,
  setQuery,
  hints,
  inputRef,
  onSubmit,
  used,
  budget,
  onWords,
}: {
  query: string;
  setQuery: (v: string) => void;
  hints: string[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  used: number;
  budget: number;
  onWords: () => void;
}) {
  return (
    <div className="w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-line bg-panel/95 p-2 shadow-sm sm:p-2.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex items-center gap-1.5"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ladder, giant balloon…"
          className="h-10 min-w-0 flex-1 rounded-md border border-line bg-paper px-2.5 font-display text-sm text-ink outline-none placeholder:text-muted focus:border-clay"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Object notebook"
        />
        <button
          type="submit"
          disabled={used >= budget}
          className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md bg-clay px-3 text-sm font-semibold text-clay-fg disabled:opacity-40"
        >
          Write
          <ChevronRight className="size-4" />
        </button>
      </form>
      {hints.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {hints.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setQuery(h)}
              className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft hover:border-clay hover:text-ink"
            >
              {h}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onWords}
        className="mt-2 text-[11px] font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
      >
        Word list
      </button>
    </div>
  );
}

function Inspector({ info, onClose }: { info: NonNullable<HudState["selected"]>; onClose: () => void }) {
  return (
    <aside className="w-[min(16rem,calc(100vw-1.5rem))] rounded-lg border border-line bg-panel/95 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-semibold leading-tight text-ink">{info.label}</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted">{info.path.join(" · ") || "uncategorized"}</p>
        </div>
        <button type="button" aria-label="Close inspector" onClick={onClose} className="rounded-sm p-1 text-muted hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
      {info.adjectives.length > 0 && (
        <p className="mt-2 text-xs text-clay">{info.adjectives.join(", ")}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        {info.props.map((p) => (
          <span key={p} className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
            {p}
          </span>
        ))}
      </div>
      <dl className="mt-3 space-y-1 text-[11px] text-muted">
        <div>material · {info.material}</div>
        {info.hunt.length > 0 && <div>hunts · {info.hunt.join(", ")}</div>}
        {info.fear.length > 0 && <div>fears · {info.fear.join(", ")}</div>}
        {info.eat.length > 0 && <div>eats · {info.eat.join(", ")}</div>}
        <div>hp · <span className="tabular-nums">{info.hp}</span></div>
      </dl>
    </aside>
  );
}

function ObjectMenu({
  menu,
  onClose,
  onGrab,
  onDuplicate,
  onSleep,
  onDelete,
}: {
  menu: ObjectActionInfo & { x: number; y: number };
  onClose: () => void;
  onGrab: () => void;
  onDuplicate: () => void;
  onSleep: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: menu.x, y: menu.y });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: Math.max(8, Math.min(menu.x, window.innerWidth - r.width - 8)),
      y: Math.max(8, Math.min(menu.y, window.innerHeight - r.height - 8)),
    });
  }, [menu.x, menu.y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={`${menu.label} actions`}
      className="fixed z-40 min-w-44 rounded-lg border border-line bg-panel/95 py-1.5 shadow-[0_12px_32px_rgba(44,36,22,0.16)]"
      style={{ left: pos.x, top: pos.y }}
    >
      <p className="truncate px-3 pb-1 pt-0.5 font-display text-sm font-semibold text-ink">{menu.label}</p>
      <MenuRow
        icon={<Hand className="size-4" />}
        label={menu.holding ? "Drop" : "Grab"}
        disabled={!menu.holding && !menu.canGrab}
        onClick={onGrab}
      />
      <MenuRow icon={<Copy className="size-4" />} label="Duplicate" onClick={onDuplicate} />
      {menu.canSleep && (
        <MenuRow
          icon={menu.sleeping ? <Sun className="size-4" /> : <Moon className="size-4" />}
          label={menu.sleeping ? "Wake" : "Sleep"}
          onClick={onSleep}
        />
      )}
      <div className="my-1 border-t border-line" />
      <MenuRow icon={<Trash2 className="size-4" />} label="Delete" danger onClick={onDelete} />
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-10 w-full items-center gap-2.5 px-3 text-left text-sm font-medium transition-colors duration-150",
        danger ? "text-clay hover:bg-clay/10" : "text-ink hover:bg-paper-2",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      <span className={cn("shrink-0", danger ? "text-clay" : "text-ink-soft")}>{icon}</span>
      {label}
    </button>
  );
}

function TouchPad({ gameRef }: { gameRef: React.RefObject<ObjectnautGame | null> }) {
  const hold = (code: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      gameRef.current?.setAction(code, true);
    },
    onPointerUp: () => gameRef.current?.setAction(code, false),
    onPointerLeave: () => gameRef.current?.setAction(code, false),
    onPointerCancel: () => gameRef.current?.setAction(code, false),
  });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-end justify-between px-3 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="pointer-events-auto flex gap-2">
        <PadBtn label="Left" {...hold("KeyA")}>A</PadBtn>
        <PadBtn label="Right" {...hold("KeyD")}>D</PadBtn>
      </div>
      <div className="pointer-events-auto flex gap-2">
        <PadBtn label="Grab" onPointerDown={() => gameRef.current?.tryPickup()}>E</PadBtn>
        <PadBtn label="Jump" {...hold("Space")}>W</PadBtn>
      </div>
    </div>
  );
}

function PadBtn({
  children,
  label,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-14 items-center justify-center rounded-lg border border-line bg-panel/90 font-display text-lg font-semibold text-ink active:bg-paper-2"
      {...rest}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: { label: string; onClick: () => void; primary?: boolean }[];
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/30 px-5">
      <div className="w-full max-w-sm rounded-xl border border-line bg-panel p-6 shadow-lg">
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
        <div className="mt-5 flex flex-col gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold",
                a.primary ? "bg-clay text-clay-fg" : "border border-line bg-paper text-ink",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PuzzleList({ onClose, onPick }: { onClose: () => void; onPick: (id: string) => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-ink/35 sm:items-center">
      <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-line bg-panel p-5 sm:rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Pages</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="size-10 rounded-md text-muted hover:text-ink">
            <X className="mx-auto size-5" />
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {LEVELS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onPick(l.id)}
                className="flex w-full items-start justify-between gap-3 rounded-md border border-line bg-paper px-3 py-3 text-left hover:border-clay"
              >
                <span>
                  <span className="block font-display text-base font-semibold">{l.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{l.blurb}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted">{l.budget} words</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WordList({ onClose, onPick }: { onClose: () => void; onPick: (w: string) => void }) {
  const nouns = OBJECTS.map((o) => o.names[0]);
  const extras = allWords().filter((w) => !nouns.includes(w));
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-ink/35 sm:items-center">
      <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-line bg-panel p-5 sm:rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Word list</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="size-10 rounded-md text-muted hover:text-ink">
            <X className="mx-auto size-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Prefix any noun with giant, tiny, flying, hot, frozen, hungry, friendly, sleeping…</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {nouns.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onPick(w)}
              className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium hover:border-clay"
            >
              {w}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">Adjectives</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {extras.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onPick(w)}
              className="rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink-soft hover:text-ink"
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
