import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, linear, ramp, settle, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth as earthColors, ink } from "../palette";
import { DayClock, DayLens, DayNote } from "../parts/DayClock";
import { Globe, landPoint, LatitudeRing, spinFor } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, SourceSeal, SpaceBackdrop, Svg, Tag } from "../parts/kit";

const EARTH = { cx: 960, cy: 540, r: 300 } as const;
// A Terra do plano do Japão: maior, e à esquerda para a etiqueta caber no céu.
const CLOSE = { cx: 720, cy: 560, r: 430 } as const;
const TURN_SECONDS = 14;
// A lupa pousa no fim do dia logo que o plano abre, em segundos.
const LENS_AT = 0.15;
// O Japão no globo, em unidades de raio 100: uma ilha num trecho de mar aberto da faixa de
// continentes, na latitude dele (38° N), e onde ela está no disco quando o plano abre.
const JAPAN = { at: [170, -100 * Math.sin((38 * Math.PI) / 180)], from: -42 } as const;

/** A Terra girando leva um tremor, como um tapa pequeno, e segue igual. */
const Slap: React.FC<{ readonly hitAt: number }> = ({ hitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turns = frame / fps / TURN_SECONDS;
  const jolt = shake(frame, hitAt, 0.5 * fps, 16, 4);
  const hit = { x: EARTH.cx + EARTH.r * 0.62, y: EARTH.cy - EARTH.r * 0.72 };
  const burst = linear(frame, hitAt, 0.45 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={1.06}>
        <Svg>
          <g transform={`translate(${jolt.toFixed(2)} ${(-jolt * 0.4).toFixed(2)})`}>
            <Globe {...EARTH} spin={turns} />
            {/* A conta que corre no equador não muda de passo: o giro segue igual. */}
            <LatitudeRing {...EARTH} lat={0} color={ink.accent} width={7} runner={turns} />
          </g>
          {/* O tapa: uns riscos curtos, que somem logo. */}
          {burst > 0 && burst < 1
            ? [-1.9, -1.35, -0.8, -0.25].map((angle) => (
                <line
                  key={angle}
                  x1={hit.x + Math.cos(angle) * (24 + 40 * burst)}
                  y1={hit.y + Math.sin(angle) * (24 + 40 * burst)}
                  x2={hit.x + Math.cos(angle) * (56 + 70 * burst)}
                  y2={hit.y + Math.sin(angle) * (56 + 70 * burst)}
                  stroke={ink.accent}
                  strokeWidth={12}
                  strokeLinecap="round"
                  opacity={1 - burst}
                />
              ))
            : null}
        </Svg>
      </Push>
    </Frame>
  );
};

/** O Japão marcado no globo, com as ondas do tremor saindo dele. */
const Marked: React.FC<{ readonly tagAt: number }> = ({ tagAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A ilha é um ponto da faixa de continentes: o globo gira no passo de sempre, e ela vai com ele.
  const spin = spinFor(JAPAN.from, JAPAN.at) + frame / fps / TURN_SECONDS;
  const spot = landPoint(100, spin, JAPAN.at);
  const k = CLOSE.r / 100;
  const pin = { x: CLOSE.cx + spot.x * k, y: CLOSE.cy + spot.y * k };
  const tag = { x: 1380, y: 250 };
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      {/* A câmera chega: parte do tamanho da Terra do plano anterior. */}
      <Push focus={[CLOSE.cx, CLOSE.cy]} from={EARTH.r / CLOSE.r} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Push focus={[CLOSE.cx, CLOSE.cy]} to={1.04}>
          <Svg>
            <Globe {...CLOSE} spin={spin}>
              {/* A ilha sob o marcador: uma mancha, sem litoral que se reconheça. */}
              <path
                d="M-21,-2 C-19,-9 -6,-11 4,-9 C14,-8 23,-4 21,3 C19,9 8,10 -3,9 C-12,8 -23,5 -21,-2 Z"
                transform={`translate(${spot.x} ${spot.y}) rotate(-28)`}
                fill={earthColors.land}
              />
              {[0, 1, 2].map((index) => {
                const life = (frame / fps / 1.2 + index / 3) % 1;
                return (
                  <circle
                    key={index}
                    cx={spot.x}
                    cy={spot.y}
                    r={5 + 30 * life}
                    fill="none"
                    stroke={ink.accent}
                    strokeWidth={2.6}
                    opacity={1 - life}
                  />
                );
              })}
              <circle cx={spot.x} cy={spot.y} r={5.5} fill={ink.stop} stroke={ink.paper} strokeWidth={1.6} />
            </Globe>
            <line
              x1={pin.x + 30}
              y1={pin.y - 26}
              x2={tag.x - 330}
              y2={tag.y + 30}
              stroke={ink.accent}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={popOpacity(frame, tagAt, 0.3 * fps)}
            />
          </Svg>
          <Place x={tag.x} y={tag.y}>
            <Pop at={tagAt}>
              <Tag on="dark">Japão, 2011, magnitude 9</Tag>
            </Pop>
          </Place>
        </Push>
      </Push>
    </Frame>
  );
};

type ShavedProps = {
  /** A lasca sai; a medida aparece. */
  readonly at: readonly [number, number];
};

/** O relógio de um dia; a lupa sobre o último segundo mostra a lasca que sai. */
const Shaved: React.FC<ShavedProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<IdeaBackdrop hue="lilac" spot={[0.3, 0.45]} />}>
      <Push to={1.04}>
        <Svg>
          {/* O ponteiro dá a volta do dia e chega ao alto, onde a lupa está, quando a lasca sai. */}
          <DayClock hand={24 * ramp(frame, 0, Math.max(at[0], 0.5 * fps))} />
          <DayLens open={popScale(frame, LENS_AT * fps, 0.3 * fps)} mode="out" moved={ramp(frame, at[0], 0.6 * fps)} />
          <DayNote
            lines={["cerca de 1,8 milionésimo", "de segundo (calculado)"]}
            opacity={popOpacity(frame, at[1], 0.4 * fps)}
          />
        </Svg>
      </Push>
      <SourceSeal>NASA/JPL, 2011</SourceSeal>
    </Frame>
  );
};

export const EarthquakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="um tapa pequeno">
      <Slap hitAt={cue(scene, "violentas")} />
    </Shot>
    <Shot range={shots[1]} name="o Japão, 2011">
      <Marked tagAt={cue(scene, "dois") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="a lasca que sai do dia">
      <Shaved
        at={[cue(scene, "menos") - shots[2].from, cue(scene, "milionésimos") - shots[2].from]}
      />
    </Shot>
  </>
);
