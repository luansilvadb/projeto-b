import { useId } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Globe } from "../../../vignette/PlanetWorld";
import { idea, ink } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Sooner } from "./MaybeBrainScene";
import { SleepingTrio, TRIO_PUSH, trioBed, WIDE } from "./OneOfThemScene";
import { Drift } from "./SleepDebtScene";
import { SLEEPER_AT_HANDOVER } from "./TonightScene";

// O plano dos três abre um pouco mais perto e recua até o quadro composto em "nós".
const TRIO_CLOSER = 0.07;
const BACK_SECONDS = 1.0;
// A cama vem de onde o plano anterior a deixou, enquanto a elefanta e a água-viva entram dos lados.
const BED_TRAVEL_SECONDS = 0.6;
// A elefanta e a água-viva entram um pouco antes da marcação de sempre, mas só depois de a cama abrir espaço para elas.
const TRIO_SOONER = 6;

type AsleepTogetherShotProps = {
  /** Quadro do plano em que a câmera recua. */
  readonly backAt: number;
  /** O quadro do vídeo em que o plano começa: a respiração continua a do plano anterior. */
  readonly clock: number;
  /** As deixas do planeta, que começa a crescer no fim deste plano. */
  readonly planet: PlanetCues;
};

/** Os três dormindo, lado a lado: a cama vem do plano anterior, e a elefanta e a água-viva entram ao lado dela. */
const AsleepTogetherShot: React.FC<AsleepTogetherShotProps> = ({
  backAt,
  clock,
  planet,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const zoom = 1 + TRIO_CLOSER * (1 - ramp(frame, backAt, BACK_SECONDS * fps));
  const settled = ramp(frame, 0, BED_TRAVEL_SECONDS * fps);
  const to = trioBed(WIDE);
  const start = 1 + TRIO_CLOSER;
  // O lugar da cama do plano anterior, desfeita a aproximação com que este abre.
  const from = {
    x:
      TRIO_PUSH.focus[0] + (SLEEPER_AT_HANDOVER.x - TRIO_PUSH.focus[0]) / start,
    y:
      TRIO_PUSH.focus[1] + (SLEEPER_AT_HANDOVER.y - TRIO_PUSH.focus[1]) / start,
    scale: SLEEPER_AT_HANDOVER.scale / start,
    snoreSize: SLEEPER_AT_HANDOVER.snoreSize / start,
  };

  return (
    <>
      <FlatStage backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.55]} />}>
        <Sooner by={TRIO_SOONER}>
          <Drift focus={TRIO_PUSH.focus} zoom={zoom}>
            <SleepingTrio
              hue="lilac"
              clock={clock}
              bed={{
                x: mix(from.x, to.x, settled),
                y: mix(from.y, to.y, settled),
                scale: mix(from.scale, to.scale, settled),
              }}
              snoreSize={mix(from.snoreSize, 120, settled)}
              thinShadow={1 - settled}
            />
          </Drift>
        </Sooner>
        {/* O planeta do plano seguinte já começa a crescer no centro enquanto os três encolhem: a troca
            não deixa a tela só com o fundo. Quando o plano dele chega, é ele quem o desenha. */}
        {frame >= planet.growAt && !stage.handedOver ? (
          <Stay>
            <Planet from={0} {...planet} />
          </Stay>
        ) : null}
      </FlatStage>
      <Grain />
    </>
  );
};

/** Onde o planeta fica sozinho no centro, e onde fica enquanto os quadros saem dele. */
const ALONE = { x: 960, y: 540 };
const SENDING = { x: 640, y: 440 };
// O raio do planeta em cada momento: ao assentar, enquanto manda os quadros, e sozinho no fim.
const RADIUS = { settled: 300, sending: 250, alone: 220 };

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
  /** Quanto do vídeo já passou, de 0 a 1: a barra de andamento anda. */
  readonly played: number;
};

/**
 * Um quadro de vídeo sem assunto: a moldura clara, a tela, formas abstratas
 * dentro dela e, embaixo, a barra de andamento, que é o que faz da moldura
 * uma tela de vídeo.
 */
const Card: React.FC<CardProps> = ({ art, width, played }) => {
  const id = useId();
  const seen = 152 * played;
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
        <rect x={24} y={97} width={seen} height={6} rx={3} fill={TONES.light} />
        <circle cx={24 + seen} cy={100} r={6.5} fill={TONES.light} />
      </g>
    </svg>
  );
};

// O planeta entra crescendo do centro, passa do tamanho e assenta, em 0,6 s; começa
// a crescer uns quadros antes de o plano dele chegar, sob os três que encolhem.
const SETTLE_FRAMES = 18;
const PLANET_LEAD = 6;
// Os quadros: de quanto em quanto saem, em quantos quadros cada um chega, e o mesmo para a volta.
const SEND = { after: 0, every: 9, frames: 15 };
const RECALL = { every: 6, frames: 8 };
// O planeta abre espaço para os quadros e volta ao centro com peso.
const MOVE_FRAMES = 20;
// A aproximação lenta dos três planos do planeta, do começo do primeiro ao fim do vídeo.
const PLANET_PUSH = { focus: [960, 540], by: 0.04 } as const;
// As nuvens andam sempre; na volta lenta do fim, este tanto mais depressa.
// O planeta da vinheta não gira: o que passa são as nuvens. Elas começam `back` segundos
// atrás, mais para a esquerda, para ainda haver nuvem sobre ele quando a volta termina.
const TURN = { faster: 6, ease: 0.6, back: 8 };

type PlanetCues = {
  /** Quadros da cena em que o planeta começa a crescer, em que o plano dele chega, em que os quadros saem, em que se recolhem e em que ele dá a volta lenta. */
  readonly growAt: number;
  readonly settleAt: number;
  readonly sendAt: number;
  readonly recallAt: number;
  readonly turnAt: number;
  /** O quadro da cena em que ela termina. */
  readonly end: number;
};

type PlanetProps = PlanetCues & {
  /** O quadro da cena em que o plano que desenha isto começa. */
  readonly from: number;
};


/**
 * O planeta da vinheta, símbolo do canal, e os quadros dos próximos vídeos,
 * num quadro da cena: os três planos são a mesma encenação, contada no relógio
 * da cena. Quem a desenha é o plano que está no palco.
 */
const Planet: React.FC<PlanetProps> = ({
  from,
  growAt,
  settleAt,
  sendAt,
  recallAt,
  turnAt,
  end,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = from + frame;
  const seconds = at / fps;
  const grown = interpolate(
    at,
    [growAt, growAt + SETTLE_FRAMES * 0.7, growAt + SETTLE_FRAMES],
    [0, 1.06, 1],
    { ...clamp, easing: Easing.out(Easing.quad) },
  );
  // O planeta abre espaço enquanto os quadros saem, e volta ao centro quando se recolhem.
  const homeAt = recallAt + (CARDS.length - 1) * RECALL.every + RECALL.frames;
  const away = ramp(at, sendAt, MOVE_FRAMES);
  const home = ramp(at, homeAt - 4, MOVE_FRAMES);
  const sending = away * (1 - home);
  const planet = {
    x: mix(ALONE.x, SENDING.x, sending),
    y: mix(ALONE.y, SENDING.y, sending) + 5 * wave(seconds, 5.3),
    radius:
      grown *
      mix(mix(RADIUS.settled, RADIUS.sending, away), RADIUS.alone, home),
  };
  // A volta lenta do fim: as nuvens passam mais depressa, e o planeta pende um nada.
  const turning = Math.max(0, (at - turnAt) / fps);
  const turned =
    turning < TURN.ease
      ? (turning * turning) / (2 * TURN.ease)
      : turning - TURN.ease / 2;
  const clouds = (at - settleAt) / fps - TURN.back + TURN.faster * turned;
  const tilt = 2.5 * wave(seconds, 7.1) - 5 * ramp(at, turnAt, end - turnAt);

  return (
    <Drift
      focus={PLANET_PUSH.focus}
      zoom={1 + (PLANET_PUSH.by * (at - settleAt)) / (end - settleAt)}
    >
      <SvgLayer>
        <g transform={`rotate(${tilt} ${planet.x} ${planet.y})`}>
          <Globe {...planet} seconds={clouds} />
        </g>
      </SvgLayer>
      {CARDS.map((card, index) => {
        // Cada quadro nasce no planeta e cresce até o lugar dele; na volta, os de fora vão primeiro.
        const leftAt = sendAt + SEND.after + index * SEND.every;
        const out = ramp(at, leftAt, SEND.frames);
        const back = ramp(
          at,
          recallAt + (CARDS.length - 1 - index) * RECALL.every,
          RECALL.frames,
        );
        const present = out * (1 - back);
        if (present <= 0) {
          return null;
        }
        // Chegando, passa um nada do tamanho e assenta; pousado, flutua na própria fase.
        const size =
          present * (1 + 0.08 * Math.sin(Math.PI * out) * (1 - back));
        const float = out * (1 - back);
        return (
          <Place
            key={index}
            x={0}
            y={0}
            style={{
              translate: `calc(-50% + ${mix(planet.x, card.x, present)}px) calc(-50% + ${mix(planet.y, card.y, present) + 7 * float * wave(seconds, 3.3 + index * 0.5, index / 4)}px)`,
              scale: `${size}`,
              rotate: `${-6 + index * 3 + 1.5 * float * wave(seconds, 4.1, index / 3)}deg`,
            }}
          >
            <Card
              art={index}
              width={card.width}
              played={0.3 + 0.045 * (seconds - leftAt / fps) + index * 0.06}
            />
          </Place>
        );
      })}
    </Drift>
  );
};

type PlanetShotProps = PlanetProps & {
  /** O plano passa a cena ao seguinte: quando ele chega, é ele quem desenha o planeta. */
  readonly handsOver?: boolean;
};

/** Um plano do planeta, sobre fundo liso: nada aqui entra nem sai pela marcação do palco. */
const PlanetShot: React.FC<PlanetShotProps> = ({
  handsOver = false,
  ...planet
}) => {
  const stage = useStage();
  return (
    <>
      <FlatStage backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />}>
        {handsOver && stage.handedOver ? null : (
          <Stay>
            <Planet {...planet} />
          </Stay>
        )}
      </FlatStage>
      <Grain />
    </>
  );
};

export const SubscribeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const cues: PlanetCues = {
    growAt: shots[1].from - PLANET_LEAD,
    settleAt: shots[1].from,
    sendAt: shots[2].from,
    recallAt: shots[3].from,
    turnAt: cue(scene, "Obrigado"),
    end: scene.durationInFrames,
  };
  return (
    <>
      <Shot range={shots[0]} name="os três dormindo, lado a lado">
        <AsleepTogetherShot
          backAt={cue(scene, "nós")}
          clock={scene.from}
          planet={cues}
        />
      </Shot>
      <Shot range={shots[1]} name="o planeta do canal assenta no centro">
        <PlanetShot from={shots[1].from} handsOver {...cues} />
      </Shot>
      <Shot range={shots[2]} name="os próximos vídeos saem dele">
        <PlanetShot from={shots[2].from} handsOver {...cues} />
      </Shot>
      <Shot range={shots[3]} name="o planeta fica sozinho">
        <PlanetShot from={shots[3].from} {...cues} />
      </Shot>
    </>
  );
};
