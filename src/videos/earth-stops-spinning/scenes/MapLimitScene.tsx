import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { ALREADY_SHOWN, clamp01, cue, mix, ramp, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, ink, sea } from "../palette";
import { Caveat, CUT_BULGE, CutEarth } from "../parts/CutEarth";
import { MapWorld } from "../parts/MapWorld";
import {
  Frame,
  Push,
  Question,
  SeaBackdrop,
  SourceSeal,
  SpaceBackdrop,
  Svg,
  SvgText,
} from "../parts/kit";

const SHEET = { x: 160, y: 90, width: 1600, height: 900 } as const;
const STAMP = { x: 1200, y: 560 } as const;

type ProvisionalProps = {
  readonly dashAt: number;
  readonly stampAt: number;
  /** O retrato final: o mapa inteiro, parado, com a etiqueta "simulação" e o selo da fonte. */
  readonly portrait?: boolean;
};

/** O mapa dos dois oceanos, numa folha: as margens ficam em tracejado, e ele leva o carimbo "provisório". */
const Provisional: React.FC<ProvisionalProps> = ({ dashAt, stampAt, portrait = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // O carimbo bate e quica uma vez, pequeno, antes de assentar.
  const landed = stampAt + 0.22 * fps;
  const bounce = shake(frame, landed, 0.45 * fps, 1, 1.5);
  return (
    <Frame backdrop={<SeaBackdrop />}>
      {/* No retrato a câmera se afasta devagar, do mapa inteiro: é o respiro do fim do bloco. */}
      <Push focus={portrait ? [960, 540] : [STAMP.x, STAMP.y]} from={portrait ? 1.06 : 1} to={portrait ? 1 : 1.04}>
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
        {portrait ? (
          // No canto da folha, sobre o oceano do sul: o mapa inteiro é a simulação.
          <Place x={SHEET.x + 190} y={SHEET.y + SHEET.height - 80}>
            <Caveat on="light">simulação</Caveat>
          </Place>
        ) : null}
      </Push>
      {portrait ? <SourceSeal>Fraczek, Esri</SourceSeal> : null}
    </Frame>
  );
};

// A Terra fica acima do centro: a faixa do prazo ocupa a base do quadro.
const EARTH = { cx: 960, cy: 470, r: 300 } as const;
// A faixa do prazo: o texto, a linha sem marca nenhuma e a interrogação na ponta.
const SPAN = { y: 900, from: 600, to: 1240 } as const;
// As rachaduras na cintura, em unidades de raio 100: três do lado do corte, duas do lado de fora.
const CRACKS = [
  "M 99 -8 L 86 -2 L 90 9 L 74 12 L 80 25 L 64 27",
  "M 93 -37 L 81 -30 L 84 -19 L 68 -17",
  "M 91 41 L 78 36 L 76 49 L 60 46",
  "M -99 6 L -84 2 L -88 -11 L -70 -13",
  "M -93 32 L -80 27 L -78 40 L -64 38",
] as const;

type RoundCues = {
  /** Os quadros em que a cintura começa a afundar, em que acaba, em que a rocha treme e em que a faixa do prazo entra. */
  readonly round: number;
  readonly settled: number;
  readonly quake: number;
  readonly span: number;
};

/**
 * A Terra em corte perde a largura do equador e fica mais redonda, com
 * rachaduras e tremores na rocha. O prazo não tem número: a faixa de baixo
 * diz o intervalo da fala e fica com a interrogação.
 */
const RoundsOff: React.FC<{ readonly at: RoundCues }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const round = ramp(frame, at.round, at.settled - at.round);
  // Dois tremores: um quando a rocha começa a ceder, outro, maior, na palavra da fala.
  const tremor =
    shake(frame, at.round + 0.2 * fps, 0.6 * fps, 9, 5) + shake(frame, at.quake, 1.2 * fps, 16, 9);
  const spanned = ramp(frame, at.span, 0.6 * fps);
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
            opacity={0.7 * ramp(frame, at.round, 0.5 * fps)}
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
          {/* Discreta, embaixo: o intervalo que a fala dá, sobre uma linha sem marca nenhuma, e a interrogação. */}
          {spanned > 0 ? (
            <g opacity={spanned}>
              {/* A letra fica entre o selo (32) e a nota (56), como a da etiqueta "exagerado": a 56 a faixa disputava o plano com a Terra. */}
              <SvgText x={(SPAN.from + SPAN.to) / 2} y={SPAN.y} size={44}>
                de milhares a milhões de anos
              </SvgText>
              <line
                x1={SPAN.from}
                y1={SPAN.y + 50}
                x2={mix(SPAN.from, SPAN.to, spanned)}
                y2={SPAN.y + 50}
                stroke={ink.paper}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray="4 30"
                opacity={0.7}
              />
              <Question x={SPAN.to + 90} y={SPAN.y + 14} size={90} />
            </g>
          ) : null}
        </Svg>
        {/* Encostada no contorno do formato de hoje, que é o exagerado. */}
        <Place x={EARTH.cx - 400} y={EARTH.cy - 270}>
          <Pop at={6}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const MapLimitScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o mapa é provisório">
      <Provisional dashAt={cue(scene, "mapa")} stampAt={cue(scene, "vale")} />
    </Shot>
    <Shot range={shots[1]} name="a Terra se arredonda">
      <RoundsOff
        at={{
          round: cue(scene, "perder") - shots[1].from,
          settled: cue(scene, "ajuste") - shots[1].from,
          quake: cue(scene, "terremotos") - shots[1].from,
          span: cue(scene, "milhares") - shots[1].from,
        }}
      />
    </Shot>
    <Shot range={shots[2]} name="o retrato">
      <Provisional dashAt={ALREADY_SHOWN} stampAt={ALREADY_SHOWN} portrait />
    </Shot>
  </>
);
