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
export function bar(value: number, max: number, kind = "") {
  const wrap = el("div", "", "meter " + kind);
  const fill = el("i");
  fill.style.width = Math.max(0, Math.min(100, (value / max) * 100)) + "%";
  wrap.append(fill);
  return wrap;
}
