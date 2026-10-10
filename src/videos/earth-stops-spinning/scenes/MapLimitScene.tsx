import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { clamp01, cue, mix, ramp, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, idea, ink, sea } from "../palette";
import { Caveat, CUT_BULGE, CutEarth } from "../parts/CutEarth";
import { MapWorld } from "../parts/MapWorld";
import {
  Frame,
  IdeaBackdrop,
  Push,
  Question,
  SeaBackdrop,
  SourceSeal,
  SpaceBackdrop,
  Svg,
  SvgText,
  Tag,
} from "../parts/kit";

const SHEET = { x: 160, y: 90, width: 1600, height: 900 } as const;
const STAMP = { x: 1200, y: 560 } as const;

/** O mapa dos dois oceanos, numa folha: as margens ficam em tracejado, e ele leva o carimbo "provisório". */
const Provisional: React.FC<{ readonly dashAt: number; readonly stampAt: number }> = ({
  dashAt,
  stampAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // O carimbo bate e quica uma vez, pequeno, antes de assentar.
  const landed = stampAt + 0.22 * fps;
  const bounce = shake(frame, landed, 0.45 * fps, 1, 1.5);
  return (
    <Frame backdrop={<SeaBackdrop />}>
      <Push focus={[STAMP.x, STAMP.y]} to={1.04}>
        <Svg>
          {/* A folha respira, e balança um nada quando o carimbo bate. O carimbo vai com ela. */}
          <g
            transform={`rotate(${shake(frame, stampAt + 5, 0.4 * fps, 0.5, 2) + 0.35 * wave(seconds, 5.5)} 960 540)`}
          >
            <rect
              x={SHEET.x - 26}
              y={SHEET.y - 26}
              width={SHEET.width + 52}
              height={SHEET.height + 52}
              rx={40}
              fill={sea.paper}
            />
            <MapWorld
              {...SHEET}
              radius={22}
              moved={1}
              dashed={ramp(frame, dashAt, 0.6 * fps)}
              // O tracejado corre pelas margens: é o que diz que a linha não está fechada.
              march={Math.max(0, frame - dashAt) * 1.3}
            />
            {/* O carimbo chega de cima, grande, e bate na folha. */}
            <g
              transform={`translate(${STAMP.x} ${STAMP.y}) rotate(${-9 + 2.5 * bounce}) scale(${popScale(frame, stampAt, 0.22 * fps, 1.9, 0.94) + 0.05 * Math.abs(bounce)})`}
              opacity={popOpacity(frame, stampAt, 0.22 * fps)}
            >
              <rect
                x={-270}
                y={-78}
                width={540}
                height={156}
                rx={22}
                fill={sea.paper}
                stroke={sea.stamp}
                strokeWidth={14}
              />
              <SvgText x={0} y={2} size="label" fill={sea.stamp}>
                provisório
              </SvgText>
            </g>
          </g>
        </Svg>
      </Push>
    </Frame>
  );
};

const EARTH = { cx: 960, cy: 540, r: 320 } as const;
// As rachaduras na cintura, em unidades de raio 100: três do lado do corte, duas do lado de fora.
const CRACKS = [
  "M 99 -8 L 86 -2 L 90 9 L 74 12 L 80 25 L 64 27",
  "M 93 -37 L 81 -30 L 84 -19 L 68 -17",
  "M 91 41 L 78 36 L 76 49 L 60 46",
  "M -99 6 L -84 2 L -88 -11 L -70 -13",
  "M -93 32 L -80 27 L -78 40 L -64 38",
] as const;

/** A Terra em corte se arredonda devagar: a cintura afunda, com rachaduras e tremores na rocha. */
const RoundsOff: React.FC<{ readonly quakeAt: number }> = ({ quakeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const round = ramp(frame, 0.3 * fps, length - 0.5 * fps);
  // Dois tremores: um quando a rocha começa a ceder, outro na palavra da fala.
  const tremor =
    shake(frame, 0.5 * fps, 0.6 * fps, 9, 5) + shake(frame, quakeAt, 0.9 * fps, 14, 7);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={1.05}>
        <Svg>
          {/* O formato de hoje, que fica para trás. */}
          <ellipse
            cx={EARTH.cx}
            cy={EARTH.cy}
            rx={EARTH.r * (1 + CUT_BULGE)}
            ry={EARTH.r}
            fill="none"
            stroke={earth.ghost}
            strokeWidth={8}
            strokeDasharray="20 22"
            strokeLinecap="round"
            opacity={0.7 * ramp(frame, 0.3 * fps, 0.5 * fps)}
          />
          <g transform={`translate(${tremor} 0)`}>
            <CutEarth {...EARTH} bulge={mix(CUT_BULGE, 0.03, round)}>
              {CRACKS.map((d, index) => (
                <path
                  key={d}
                  d={d}
                  fill="none"
                  stroke={earth.shade}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - clamp01(round * 2.4 - index * 0.25)}
                />
              ))}
            </CutEarth>
          </g>
        </Svg>
        {/* Encostada no contorno do formato de hoje, que é o exagerado. */}
        <Place x={600} y={290}>
          <Pop at={6}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

const LINE = { y: 640, from: 170, to: 1750 } as const;
const FLAGS = { thousands: 330, millions: 1590 } as const;

/** Uma bandeira fincada na linha do tempo, com a flâmula tremulando. */
const Flag: React.FC<{ readonly x: number; readonly at: number; readonly seed: number }> = ({
  x,
  at,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flutter = 12 * wave(frame / fps, 1.6, seed);
  return (
    <g
      transform={`translate(${x} ${LINE.y}) scale(${popScale(frame, at, 0.3 * fps)})`}
      opacity={popOpacity(frame, at, 0.3 * fps)}
    >
      <line x1={0} y1={0} x2={0} y2={-250} stroke={ink.dark} strokeWidth={14} strokeLinecap="round" />
      <path
        d={`M0,-246 Q70,${-240 + flutter} 150,${-196 + flutter} Q70,${-170 - flutter / 2} 0,-146 Z`}
        fill={ink.accent}
      />
      <circle cx={0} cy={0} r={20} fill={ink.dark} />
    </g>
  );
};

type TimelineProps = {
  /** Os quadros de cada bandeira. */
  readonly at: { readonly thousands: number; readonly millions: number };
};

/** A linha do tempo com as duas bandeiras muito afastadas, e a interrogação entre elas. */
const HowLong: React.FC<TimelineProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // A linha se desenha ao longo da frase e fica pronta um pouco antes das bandeiras.
  const drawnAt = Math.max(fps, at.thousands - 0.9 * fps);
  const tip = mix(LINE.from, LINE.to, ramp(frame, 0.2 * fps, drawnAt - 0.2 * fps));
  // O marcador vai na ponta que desenha; pronta a linha, volta e fica indo e vindo
  // no meio dela, sem pousar em data nenhuma.
  const since = Math.max(0, frame - drawnAt) / fps;
  const marker = mix(tip, 960 + 250 * Math.sin((since / 4.6) * Math.PI * 2), ramp(frame, drawnAt, 1.3 * fps));
  return (
    <Frame backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.42]} />}>
      {/* A câmera chega de perto e abre até a linha inteira. */}
      <Push focus={[960, 520]} from={1.25} to={1} progress={ramp(frame, 0, 0.7 * fps)}>
        <Push focus={[960, 520]} to={1.04}>
          <Svg>
            <line
              x1={LINE.from}
              y1={LINE.y}
              x2={tip}
              y2={LINE.y}
              stroke={idea.lilac.contact}
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray="4 36"
            />
            <Flag x={FLAGS.thousands} at={at.thousands} seed={0} />
            <Flag x={FLAGS.millions} at={at.millions} seed={0.4} />
            {/* O marcador: paira um pouco acima da linha, com a sombra nela. */}
            <g>
              <ellipse cx={marker} cy={LINE.y + 4} rx={22} ry={6} fill={idea.lilac.contact} opacity={0.5} />
              <path
                d="M0,0 L-24,-44 A27,27 0 1 1 24,-44 Z"
                transform={`translate(${marker} ${LINE.y - 14 - 8 * wave(seconds, 0.9)})`}
                fill={ink.paper}
                stroke={ink.dark}
                strokeWidth={10}
                strokeLinejoin="round"
              />
            </g>
            {/*
              A interrogação já está no quadro do corte (a fala começa por ela, e quem a traz é a câmera);
              sobe e desce, e pende para o lado do marcador.
            */}
            <g transform={`translate(${960 + 0.12 * (marker - 960)} ${400 + 16 * wave(seconds, 2.6)})`}>
              <Question x={0} y={0} size={220} fill={ink.dark} color={ink.paper} />
            </g>
          </Svg>
          <Place x={FLAGS.thousands + 115} y={LINE.y + 96}>
            <Pop at={at.thousands + 4}>
              <Tag on="light" size="note">
                milhares de anos
              </Tag>
            </Pop>
          </Place>
          <Place x={FLAGS.millions - 115} y={LINE.y + 96}>
            <Pop at={at.millions + 4}>
              <Tag on="light" size="note">
                milhões de anos
              </Tag>
            </Pop>
          </Place>
        </Push>
      </Push>
      <SourceSeal>Anderson e O&apos;Connell, 1967</SourceSeal>
    </Frame>
  );
};

export const MapLimitScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o mapa é provisório">
      <Provisional dashAt={cue(scene, "vale")} stampAt={cue(scene, "enquanto")} />
    </Shot>
    <Shot range={shots[1]} name="a Terra se arredonda">
      <RoundsOff quakeAt={cue(scene, "terremotos") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="em quanto tempo">
      <HowLong
        at={{
          thousands: cue(scene, "milhares") - shots[2].from,
          millions: cue(scene, "milhões") - shots[2].from,
        }}
      />
    </Shot>
  </>
);
