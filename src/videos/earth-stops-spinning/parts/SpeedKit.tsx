import { useCurrentFrame, useVideoConfig } from "remotion";
import type { VigiliaPose } from "../../../art/Vigilia";
import { blink, breath } from "../../../components/Idle";
import { settle } from "../../../components/timing";
import { Push } from "./kit";

/**
 * O que as cenas da velocidade (de `how-fast` a `wind`) dividem: a pausa viva
 * de um ator e a câmera que chega.
 */

/** A pose com a pausa viva por cima: o tronco respira e os olhos piscam, sem desfazer a pálpebra que a pose já fecha. */
export const alive = (pose: VigiliaPose, seconds: number, seed: string): VigiliaPose => {
  const closed = blink(seconds, seed);
  return {
    ...pose,
    stretch: pose.stretch * breath(seconds, seed),
    nearLid: Math.max(pose.nearLid, closed),
    farLid: Math.max(pose.farLid, closed),
  };
};

/** Quanto dura a chegada da câmera num plano de `entry: "camera"`, em segundos. */
const ARRIVE_SECONDS = 0.6;

/**
 * A câmera que chega: o plano começa no enquadramento `from` (maior que 1,
 * mais fechado; menor, mais aberto) e assenta em 1 no começo do plano.
 */
export const Arrive: React.FC<{
  readonly from: number;
  readonly focus?: readonly [number, number];
  readonly children: React.ReactNode;
}> = ({ from, focus, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Push focus={focus} from={from} to={1} progress={settle(frame, 0, ARRIVE_SECONDS * fps)}>
      {children}
    </Push>
  );
};
