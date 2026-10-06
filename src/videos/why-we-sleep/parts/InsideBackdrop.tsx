import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { wave } from "../../../components/Idle";
import { SvgLayer } from "../../../components/SvgLayer";
import { inside } from "../palette";

/**
 * O fundo de "por dentro": índigo profundo com faíscas que respiram, para o
 * mecanismo (o cérebro, metade acesa) brilhar sobre ele.
 */
export const InsideBackdrop: React.FC<{
  /** O instante, em segundos, para as faíscas não saltarem quando outro plano redesenha este fundo. Sem valor, o relógio do plano. */
  readonly seconds?: number;
}> = ({ seconds: given }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = given ?? frame / fps;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${inside.background[0]}, ${inside.background[1]})`,
      }}
    >
      <SvgLayer>
        {Array.from({ length: 24 }, (_, index) => {
          const pick = (trait: string) =>
            random(`inside-spark-${trait}-${index}`);
          return (
            <circle
              key={index}
              cx={pick("x") * 1920}
              cy={pick("y") * 1080 + 10 * wave(seconds, 4, pick("phase"))}
              r={3 + pick("size") * 4}
              fill={inside.spark}
              opacity={
                0.25 + 0.35 * (0.5 + 0.5 * wave(seconds, 2.6, pick("blink")))
              }
            />
          );
        })}
      </SvgLayer>
    </AbsoluteFill>
  );
};
