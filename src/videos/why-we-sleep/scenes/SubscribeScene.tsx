import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Globe } from "../../../vignette/PlanetWorld";
import { idea, ink } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { SleepingTrioShot } from "./OneOfThemScene";

/** Onde o planeta fica sozinho no centro, e onde fica enquanto os quadros saem dele. */
const ALONE = { x: 960, y: 540 };
const SENDING = { x: 640, y: 440 };

// Os próximos vídeos: cada quadro sai do planeta e chega mais perto de quem assiste, maior que o anterior.
// Nenhum traz bicho nem assunto reconhecível: a chamada só pode prometer vídeo que existe (decisão do usuário).
const CARDS: readonly {
  readonly x: number;
  readonly y: number;
  readonly width: number;
}[] = [
  { x: 930, y: 500, width: 190 },
  { x: 1120, y: 600, width: 260 },
  { x: 1340, y: 720, width: 340 },
  { x: 1560, y: 850, width: 420 },
];
const CARD_STAGGER = 0.3;
// A tela de um cartão, nas unidades do desenho dele.
const SCREEN = { x: 10, y: 10, width: 180, height: 100, radius: 13 };
const TONES = {
  screen: idea.lilac.contact,
  far: idea.lilac.bottom,
  near: idea.lilac.top,
  light: idea.lilac.spot,
};

/** O que cada tela mostra: formas soltas, um arranjo diferente por cartão, para os quatro não serem cópias. */
const ARRANGEMENTS = [
  <g key="disc">
    <circle cx={72} cy={52} r={24} fill={TONES.light} />
    <rect x={112} y={38} width={58} height={11} rx={5.5} fill={TONES.near} />
    <rect x={112} y={58} width={38} height={11} rx={5.5} fill={TONES.far} />
  </g>,
  <g key="columns">
    <rect x={38} y={52} width={26} height={60} rx={10} fill={TONES.far} />
    <rect x={76} y={32} width={26} height={80} rx={10} fill={TONES.near} />
    <rect x={114} y={62} width={26} height={50} rx={10} fill={TONES.far} />
    <circle cx={160} cy={36} r={12} fill={TONES.light} />
  </g>,
  <g key="arc">
    <ellipse cx={74} cy={104} rx={84} ry={42} fill={TONES.far} />
    <ellipse cx={156} cy={108} rx={62} ry={30} fill={TONES.near} />
    <circle cx={138} cy={38} r={15} fill={TONES.light} />
  </g>,
  <g key="rings">
    <circle cx={84} cy={50} r={27} fill={TONES.far} />
    <circle cx={120} cy={50} r={27} fill={TONES.near} />
    <circle cx={102} cy={50} r={10} fill={TONES.light} />
  </g>,
] as const;

type CardProps = {
  /** Qual dos arranjos a tela mostra. */
  readonly art: number;
  readonly width: number;
};

/**
 * Um quadro de vídeo sem assunto: a moldura clara, a tela, formas abstratas
 * dentro dela e, embaixo, a barra de andamento, que é o que faz da moldura
 * uma tela de vídeo.
 */
const Card: React.FC<CardProps> = ({ art, width }) => {
  const id = useId();
  return (
    <svg width={width} height={width * 0.6} viewBox="0 0 200 120">
      <clipPath id={id}>
        <rect {...SCREEN} rx={SCREEN.radius} />
      </clipPath>
      <rect width={200} height={120} rx={20} fill={ink.ring} />
      <rect {...SCREEN} rx={SCREEN.radius} fill={TONES.screen} />
      <g clipPath={`url(#${id})`}>
        {ARRANGEMENTS[art % ARRANGEMENTS.length]}
        {/* A barra de andamento, com o trecho já visto e o ponto. */}
        <rect x={10} y={90} width={180} height={20} fill={TONES.screen} />
        <rect x={24} y={97} width={152} height={6} rx={3} fill={TONES.far} />
        <rect x={24} y={97} width={54} height={6} rx={3} fill={TONES.light} />
        <circle cx={78} cy={100} r={6.5} fill={TONES.light} />
      </g>
    </svg>
  );
};

type PlanetShotProps = {
  /** O raio do planeta quando o plano termina, e aquele com que começa. */
  readonly radius: number;
  readonly fromRadius?: number;
  /** Os quadros: "out" saem do planeta um atrás do outro; "in" se recolhem para ele. */
  readonly cards?: "out" | "in";
};

/** O planeta da vinheta, símbolo do canal, sobre fundo liso; dele saem os quadros dos próximos vídeos. */
const PlanetShot: React.FC<PlanetShotProps> = ({
  radius,
  fromRadius = radius,
  cards,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const moved = settle(frame, 0, 0.6 * fps);
  // O planeta abre espaço enquanto os quadros saem, e volta ao centro quando se recolhem.
  const sending = cards === "out" ? moved : cards === "in" ? 1 - moved : 0;
  const planet = {
    x: mix(ALONE.x, SENDING.x, sending),
    y: mix(ALONE.y, SENDING.y, sending),
    radius: mix(fromRadius, radius, moved),
  };

  return (
    <SlowPush
      focus={[960, 540]}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />}
    >
      <SvgLayer>
        <Globe {...planet} seconds={seconds} />
      </SvgLayer>
      {cards
        ? CARDS.map((card, index) => {
            // Cada quadro nasce no planeta e cresce até o lugar dele; na volta, os de fora vão primeiro.
            const order = cards === "out" ? index : CARDS.length - 1 - index;
            const moving = ramp(
              frame,
              (0.2 + order * CARD_STAGGER) * fps,
              0.5 * fps,
            );
            const out = cards === "out" ? moving : 1 - moving;
            return (
              <Place
                key={index}
                x={mix(planet.x, card.x, out)}
                y={mix(planet.y, card.y, out)}
                style={{ scale: `${out}`, rotate: `${-6 + index * 3}deg` }}
              >
                <Card art={index} width={card.width} />
              </Place>
            );
          })
        : null}
      <Grain />
    </SlowPush>
  );
};

export const SubscribeScene: React.FC<SceneProps> = ({ shots }) => (
  <>
    <Shot range={shots[0]} name="os três dormindo, lado a lado">
      <SleepingTrioShot hue="lilac" />
    </Shot>
    <Shot range={shots[1]} name="o planeta do canal assenta no centro">
      <PlanetShot radius={300} fromRadius={120} />
    </Shot>
    <Shot range={shots[2]} name="os próximos vídeos saem dele">
      <PlanetShot radius={250} fromRadius={300} cards="out" />
    </Shot>
    <Shot range={shots[3]} name="o planeta fica sozinho">
      <PlanetShot radius={220} fromRadius={250} cards="in" />
    </Shot>
  </>
);
