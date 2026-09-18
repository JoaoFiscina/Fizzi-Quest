import Phaser from "phaser";

export type AmbientKind =
  | "water"
  | "fire"
  | "tree"
  | "grass"
  | "flag"
  | "leaf"
  | "dust";

export type AmbientTarget = {
  id: string;
  kind: AmbientKind;
  sprite: Phaser.GameObjects.Sprite;
  animation: string;
  reducedAnimation?: string;
  baseTexture: string;
  minInterval: number;
  maxInterval: number;
  duration: number;
  initialDelay: number;
  probability: number;
  essential?: boolean;
  decorative?: boolean;
};

type ScheduledTarget = AmbientTarget & {
  nextAt: number;
  activeUntil: number;
};

export type AmbientDiagnostics = {
  mode: "normal" | "reduced";
  targetCount: number;
  enabledTargetCount: number;
  activeCount: number;
  maxActive: number;
  timerActive: boolean;
  activations: number;
  phases: number[];
  kindsActivated: AmbientKind[];
};

/**
 * Agenda pequenos ciclos visuais usando um único timer por mapa. Os sprites e
 * as animações são criados antes; o controlador apenas alterna recursos já
 * existentes e nunca toca em posição, colisão ou estado do jogo.
 */
export class AmbientController {
  private targets: ScheduledTarget[] = [];
  private timer?: Phaser.Time.TimerEvent;
  private active = new Set<ScheduledTarget>();
  private randomState: number;
  private activations = 0;
  private kindsActivated = new Set<AmbientKind>();
  private destroyed = false;

  constructor(
    private scene: Phaser.Scene,
    private reduced: boolean,
    seed: number,
    private maxActive = reduced ? 1 : 2,
    private fast = false,
  ) {
    this.randomState = seed >>> 0 || 1;
  }

  add(target: AmbientTarget) {
    const phase = Math.max(0, Math.round(target.initialDelay));
    target.sprite.setData("ambientKind", target.kind);
    target.sprite.setData("ambientPhase", phase);
    target.sprite.setData("ambientActive", false);
    if (target.decorative) target.sprite.setVisible(false);
    this.targets.push({ ...target, nextAt: phase, activeUntil: 0 });
  }

  start() {
    if (this.destroyed || this.timer) return;
    const startedAt = this.scene.time.now;
    const scale = this.fast ? 0.025 : 1;
    for (const target of this.targets)
      target.nextAt = startedAt + Math.max(40, target.initialDelay * scale);
    this.timer = this.scene.time.addEvent({
      delay: this.fast ? 40 : 200,
      loop: true,
      callback: this.tick,
    });
    this.publishDiagnostics();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.timer?.remove(false);
    this.timer = undefined;
    for (const target of this.active) this.reset(target);
    this.active.clear();
    document.documentElement.dataset.ambientActive = "0";
    document.documentElement.dataset.ambientTimer = "stopped";
  }

  diagnostics(): AmbientDiagnostics {
    const enabled = this.targets.filter((target) => this.isEnabled(target));
    return {
      mode: this.reduced ? "reduced" : "normal",
      targetCount: this.targets.length,
      enabledTargetCount: enabled.length,
      activeCount: this.active.size,
      maxActive: this.maxActive,
      timerActive: Boolean(this.timer && !this.destroyed),
      activations: this.activations,
      phases: enabled.map((target) => target.initialDelay),
      kindsActivated: [...this.kindsActivated],
    };
  }

  private tick = () => {
    if (this.destroyed) return;
    const now = this.scene.time.now;
    for (const target of [...this.active]) {
      if (now < target.activeUntil) continue;
      this.reset(target);
      this.active.delete(target);
    }
    if (this.active.size < this.maxActive) {
      const eligible = this.targets
        .filter(
          (target) =>
            this.isEnabled(target) &&
            !this.active.has(target) &&
            now >= target.nextAt,
        )
        .sort((a, b) => a.nextAt - b.nextAt || a.id.localeCompare(b.id));
      const target = eligible[0];
      if (target) this.consider(target, now);
    }
    this.publishDiagnostics();
  };

  private consider(target: ScheduledTarget, now: number) {
    const reducedFactor = this.reduced ? 2.8 : 1;
    const fastFactor = this.fast ? 0.025 : 1;
    const interval =
      target.minInterval +
      this.random() * (target.maxInterval - target.minInterval);
    target.nextAt = now + Math.max(80, interval * reducedFactor * fastFactor);
    const probability = this.fast
      ? 1
      : target.probability * (this.reduced ? 0.35 : 1);
    if (this.random() > probability) return;

    const animation =
      this.reduced && target.reducedAnimation
        ? target.reducedAnimation
        : target.animation;
    target.sprite.setVisible(true).play(animation, true);
    target.sprite.setData("ambientActive", true);
    target.activeUntil =
      now + Math.max(80, target.duration * (this.fast ? 0.18 : 1));
    this.active.add(target);
    this.activations++;
    this.kindsActivated.add(target.kind);
  }

  private reset(target: ScheduledTarget) {
    target.sprite.stop().setTexture(target.baseTexture);
    target.sprite.setData("ambientActive", false);
    if (target.decorative) target.sprite.setVisible(false);
  }

  private isEnabled(target: ScheduledTarget) {
    return !this.reduced || (Boolean(target.essential) && !target.decorative);
  }

  private random() {
    this.randomState = (1664525 * this.randomState + 1013904223) >>> 0;
    return this.randomState / 0x100000000;
  }

  private publishDiagnostics() {
    const root = document.documentElement;
    root.dataset.ambientMode = this.reduced ? "reduced" : "normal";
    root.dataset.ambientActive = String(this.active.size);
    root.dataset.ambientMax = String(this.maxActive);
    root.dataset.ambientTimer =
      this.timer && !this.destroyed ? "running" : "stopped";
    root.dataset.ambientActivations = String(this.activations);
  }
}
