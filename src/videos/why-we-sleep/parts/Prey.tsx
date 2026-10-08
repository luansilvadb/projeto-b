import { interpolateColors } from "remotion";
import { useCarriedNumber } from "../../../components/Camera";
import { Antelope, type AntelopeColors } from "../../../art/Antelope";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { antelope, antelopeNight, ink } from "../palette";
import { SAVANNA_GROUND_Y, SavannaShadow } from "./savanna/RichTheme";

/**
 * A pintura do antílope na luz do cenário: a da noite em 0, a do dia do
 * entardecer (0,5) em diante, e as duas misturadas no caminho. É o que deixa a
 * luz mudar no lugar, com ele em cena, sem o pelo trocar de cor num quadro.
 */
export const antelopeLit = (daylight: number): AntelopeColors =>
  Object.fromEntries(
    Object.entries(antelope).map(([key, day]) => [
      key,
      interpolateColors(
        daylight,
        [0, 0.5],
        [antelopeNight[key as keyof AntelopeColors] ?? day, day],
      ),
    ]),
  ) as AntelopeColors;

/** Onde o antílope fica no plano aberto da savana, e o tamanho dele. */
export const PREY = { x: 1040, y: SAVANNA_GROUND_Y + 40, width: 420 };

type PreyProps = {
  /** 1 é dia, 0 é noite: escolhe a pintura do bicho. */
  readonly daylight: number;
  /** Deitado, de 0 a 1. */
  readonly rest?: number;
  /** Dormindo, de 0 a 1: fecha o olho, baixa a orelha, pende a cabeça. */
  readonly asleep?: number;
  /** Andando, de 0 a 1. */
  readonly walking?: number;
  /** Devendo sono: a olheira, de 0 a 1. */
  readonly tired?: number;
  readonly seconds: number;
  readonly x?: number;
};

/** Uma rajada curta que volta a cada `every` segundos: 0 quase o tempo todo, 1 no auge. */
const burst = (seconds: number, every: number) =>
  Math.max(0, wave(seconds, every)) ** 8;

/** O antílope do capítulo "o que o sono custa", com a sombra de contato e a respiração. */
export const Prey: React.FC<PreyProps> = ({
  daylight: ownDaylight,
  rest: ownRest = 0,
  asleep: ownAsleep = 0,
  walking = 0,
  tired = 0,
  seconds,
  x = PREY.x,
}) => {
  // No mesmo cenário do plano anterior, ele é o mesmo bicho: levanta, deita e
  // acorda a partir de como estava, em vez de trocar de pose de uma vez.
  const daylight = useCarriedNumber("antelope-daylight", ownDaylight);
  const rest = useCarriedNumber("antelope-rest", ownRest);
  const asleep = useCarriedNumber("antelope-asleep", ownAsleep);

  return (
    <>
      <SvgLayer>
        <SavannaShadow
          x={x}
          y={PREY.y + 6}
          width={PREY.width * 0.8}
          daylight={daylight}
        />
      </SvgLayer>
      <Place
        id="antelope"
        x={x}
        y={PREY.y}
        anchor="bottom"
        style={{
          scale: `1 ${breath(seconds, "prey", { amplitude: 0.014, period: asleep > 0.5 ? 4.5 : 3 })}`,
        }}
      >
        <Antelope
          width={PREY.width}
          colors={antelopeLit(daylight)}
          rest={rest}
          droop={asleep}
          tired={tired}
          lid={Math.max(asleep, blink(seconds, "prey"))}
          look={[0.7 * wave(seconds, 2.9), 0.1]}
          // A orelha gira devagar e, de vez em quando, dá um estalo; dormindo, só o estalo.
          ear={
            0.9 -
            0.75 * asleep +
            0.1 * wave(seconds, 2.4) -
            0.5 * burst(seconds, 4.3) * Math.abs(wave(seconds, 0.16))
          }
          stride={walking * wave(seconds, 0.7)}
          // Acordado, ele vigia: a cabeça vai e volta, e acompanha o passo quando anda.
          turn={
            (1 - asleep) *
            (7 * wave(seconds, 3.7) + 4 * walking * wave(seconds, 0.35))
          }
        />
      </Place>
    </>
  );
};

/** O que o bicho deixa de fazer enquanto dorme: comer, achar um par, vigiar. */
export type Loss = "food" | "mate" | "watch";

const LOSS_ICON: Record<Loss, React.ReactNode> = {
  food: (
    <path
      d="M-26,22 C-22,-6 -14,-20 -6,-28 M0,22 C0,-10 2,-24 6,-34 M26,22 C20,-4 16,-16 22,-26"
      fill="none"
      strokeWidth={9}
      strokeLinecap="round"
    />
  ),
  mate: (
    <path
      d="M0,26 C-40,-2 -30,-34 -8,-26 C-2,-24 0,-18 0,-14 C0,-18 2,-24 8,-26 C30,-34 40,-2 0,26 Z"
      stroke="none"
    />
  ),
  watch: (
    <>
      <path
        d="M-36,0 C-18,-26 18,-26 36,0 C18,26 -18,26 -36,0 Z"
        fill="none"
        strokeWidth={8}
      />
      <circle r={11} stroke="none" />
    </>
  ),
};

type LossBadgeProps = {
  readonly loss: Loss;
  readonly size: number;
  /** Quanto o risco já atravessou o ícone, de 0 a 1. */
  readonly struck: number;
};

/** Um ícone redondo que é riscado: a coisa que não acontece durante o sono. */
export const LossBadge: React.FC<LossBadgeProps> = ({ loss, size, struck }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" overflow="visible">
    <circle r={56} fill={ink.paper} />
    <g fill={ink.dark} stroke={ink.dark}>
      {LOSS_ICON[loss]}
    </g>
    <line
      x1={-40}
      y1={40}
      x2={-40 + 80 * struck}
      y2={40 - 80 * struck}
      stroke={ink.tag}
      strokeWidth={12}
      strokeLinecap="round"
      opacity={struck > 0 ? 1 : 0}
    />
  </svg>
);
