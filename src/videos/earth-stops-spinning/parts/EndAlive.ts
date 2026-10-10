import type { VigiliaPose } from "../../../art/Vigilia";
import { blink, breath } from "../../../components/Idle";

/**
 * A pausa viva da Vigília parada na janela: a pose respirando e piscando.
 * `seed` separa uma cena da outra, para ela não piscar igual em todas.
 */
export const alive = (pose: VigiliaPose, seconds: number, seed: string): VigiliaPose => {
  const closed = blink(seconds, seed);
  return {
    ...pose,
    stretch: pose.stretch * breath(seconds, seed),
    nearLid: Math.max(pose.nearLid, closed),
    farLid: Math.max(pose.farLid, closed),
  };
};
