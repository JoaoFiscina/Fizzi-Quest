export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = "",
  className = "",
): HTMLElementTagNameMap[K] => {
  const e = document.createElement(tag);
  e.textContent = text;
  e.className = className;
  return e;
};
export function button(text: string, fn: () => void, className = "") {
  const b = el("button", text, className);
  b.type = "button";
  b.onclick = fn;
  return b;
}
export function field(label: string, input: HTMLElement) {
  const l = el("label", label);
  l.append(input);
  return l;
}
export const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
export const labels = {
  strength: "Força",
  vigor: "Vigor",
  agility: "Agilidade",
  breath: "Fôlego",
};
type BarMemory = { pct: number; from: number; at: number };
const barMemory = new Map<string, BarMemory>();
const GHOST_MS = 700;
/**
 * Meter bar. With a `key`, the bar remembers its last value across re-renders
 * (the DOM is rebuilt often) and animates the change: the fill moves first and a
 * light "ghost" shows what was lost, shrinking a moment later.
 */
export function bar(value: number, max: number, kind = "", key = "") {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const wrap = el("div", "", "meter " + kind);
  const fill = el("i");
  wrap.append(fill);
  if (!key) {
    fill.style.width = pct + "%";
    return wrap;
  }
  const now = performance.now();
  const memory = barMemory.get(key);
  let from = pct,
    ghostFrom = pct,
    age = GHOST_MS;
  if (memory && memory.pct !== pct) {
    from = memory.pct;
    ghostFrom = Math.max(memory.pct, now - memory.at < GHOST_MS ? memory.from : 0);
    age = 0;
    barMemory.set(key, { pct, from: ghostFrom, at: now });
  } else if (memory) {
    // Same value re-rendered mid-animation: keep the ghost where it was.
    age = now - memory.at;
    ghostFrom = age < GHOST_MS ? memory.from : pct;
  } else barMemory.set(key, { pct, from: pct, at: now - GHOST_MS });
  fill.style.width = from + "%";
  if (ghostFrom > pct) {
    const ghost = el("b", "", "meter-ghost");
    ghost.style.width = ghostFrom + "%";
    wrap.prepend(ghost);
    wrap.classList.add("losing");
    const delay = Math.max(0, 220 - age);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ghost.style.transitionDelay = `${delay}ms`;
        ghost.style.width = pct + "%";
      }),
    );
  } else if (from < pct) wrap.classList.add("gaining");
  if (from !== pct)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        fill.style.width = pct + "%";
      }),
    );
  return wrap;
}
