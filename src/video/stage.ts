import { Easing, interpolate } from "remotion";
import type { FrameRange } from "../narration/timeline";
import type { ShotPlan } from "./Shot";
import { clamp, clamp01 } from "../components/timing";

/**
 * Duas cenas vizinhas podem dividir o palco: em vez de um quadro trocar pelo
 * outro, a cena que sai fica desenhada por baixo da que chega durante estes
 * quadros, os elementos dela saem, os da nova entram, e o que as duas têm em
 * comum não sai da tela. Não há efeito de transição: o que se move são as
 * coisas da cena.
 */
export const JOIN_FRAMES = 26;

// A saída começa antes de a cena nova chegar e termina logo depois: o fundo
// novo é desenhado por cima da cena antiga, e o que ainda estivesse saindo
// debaixo dele pareceria uma fusão.
const LEAD_FRAMES = 20;
const EXIT_FRAMES = 10;
const TAIL_FRAMES = 3;

/** Em quantos quadros um elemento do elenco entra. Curto, para cada entrada ser uma batida. */
export const CAST_ENTER_FRAMES = 12;
/** O passo da cascata: quantos quadros separam um elemento do seguinte. */
export const CASCADE_STEP = 4;

/** O papel de um elemento no palco: um objeto de cena, desenhado no quadro, ou alguém posto num ponto dele. */
type Role = "prop" | "actor";

/** Quando um elemento entra, em quadros depois de o plano chegar, e quando sai, em quadros depois de a saída começar. */
export type Mark = { readonly enterAt: number; readonly leaveAt: number };

// A ordem do palco. Na entrada, primeiro o fundo e o cenário, depois os
// objetos de cena e por fim o elenco, da esquerda para a direita. Na saída, o
// elenco vai embora primeiro e os objetos por último. É o que impede tudo de
// se mexer junto: cada troca tem um começo, um meio e um fim.
const BEATS = {
  prop: { enterAt: 4, leaveAt: 10 },
  actor: { enterAt: 12, leaveAt: 0 },
} as const;
// Quantos quadros o elenco leva para entrar, e para sair, de uma ponta à outra do quadro.
const SWEEP = { enter: 12, leave: 8 };
const STAGE_WIDTH = 1920;

/**
 * A marcação de um elemento: quando ele entra e quando sai, pelo papel dele e,
 * para o elenco, pela posição no quadro. `step` adianta ou atrasa a marcação
 * em passos da cascata, para quem precisa de uma ordem própria.
 */
export const markFor = (role: Role, x = 0, step = 0): Mark => {
  const across =
    role === "actor" ? clamp01(x / STAGE_WIDTH) : 0;
  return {
    enterAt:
      BEATS[role].enterAt +
      Math.round(across * SWEEP.enter) +
      step * CASCADE_STEP,
    leaveAt:
      BEATS[role].leaveAt +
      Math.round(across * SWEEP.leave) +
      step * CASCADE_STEP,
  };
};


/** De 0 a 1, quanto do que chega já entrou, `frame` quadros depois de a cena começar. */
export const enterProgress = (
  frame: number,
  delay = 0,
  frames = JOIN_FRAMES,
): number =>
  interpolate(frame, [delay, delay + frames], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

/** O quadro em que um elemento começa a sair, dado o quadro em que a cena seguinte chega e o atraso da marcação dele. */
export const leaveStart = (leaveAt: number, delay = 0): number =>
  leaveAt - LEAD_FRAMES + delay;

/** De 0 a 1, quanto um elemento já saiu. Ele acelera para fora, sem frear. */
export const leaveProgress = (
  frame: number,
  leaveAt: number,
  delay = 0,
  frames = EXIT_FRAMES,
): number => {
  const start = leaveStart(leaveAt, delay);
  return interpolate(frame, [start, start + frames], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
};

/** Quantos quadros leva a saída de um cenário inteiro: mais devagar que a de um elemento, mas no mesmo prazo. */
export const SCENERY_EXIT_FRAMES = LEAD_FRAMES + TAIL_FRAMES;

// Um plano do vídeo: o número da cena e o do plano dentro dela.
type Spot = readonly [scene: number, shot: number];

/**
 * O plano de palco de cada trecho do vídeo: com quem ele divide o palco e de
 * quem herda o cenário. `ranges` traz os trechos dos planos de cada cena, na
 * ordem de `sceneIds`; `joined` e `sets` são os de NarratedVideo.
 */
export const planShots = (
  sceneIds: readonly string[],
  ranges: readonly (readonly FrameRange[])[],
  joined: Readonly<Record<string, readonly number[]>> = {},
  sets: Readonly<Record<string, readonly (string | null)[]>> = {},
): Map<FrameRange, ShotPlan> => {
  // O primeiro plano do vídeo não tem com quem dividir o palco.
  const joins = ([scene, shot]: Spot) =>
    (scene > 0 || shot > 0) &&
    (joined[sceneIds[scene]]?.includes(shot) ?? false);
  const setOf = ([scene, shot]: Spot) => sets[sceneIds[scene]]?.[shot] ?? null;
  const keyOf = ([scene, shot]: Spot) =>
    sceneIds[scene] === undefined ? null : `${sceneIds[scene]}#${shot}`;

  const plans = new Map<FrameRange, ShotPlan>();
  ranges.forEach((shots, scene) => {
    shots.forEach((range, shot) => {
      const here: Spot = [scene, shot];
      const before: Spot =
        shot === 0
          ? [scene - 1, (ranges[scene - 1]?.length ?? 1) - 1]
          : [scene, shot - 1];
      const after: Spot =
        shot === shots.length - 1 ? [scene + 1, 0] : [scene, shot + 1];
      const set = setOf(here);
      const joinsPrevious = joins(here);
      const joinsNext = joins(after);
      plans.set(range, {
        key: keyOf(here),
        previousKey: keyOf(before),
        joinsPrevious,
        joinsNext,
        sameSetAsPrevious:
          joinsPrevious && set !== null && set === setOf(before),
        sameSetAsNext: joinsNext && set !== null && set === setOf(after),
      });
    });
  });
  return plans;
};
