import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity } from "../../../components/Pop";
import { cue, linear, mix, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, ice, ink, tags } from "../palette";
import { CUP, Explorer, Mug } from "../parts/Actor";
import { Globe, House, landPoint, LatitudeRing, spinFor } from "../parts/Globe";
import { Frame, IceBackdrop, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { alive, Arrive } from "../parts/SpeedKit";

// A régua dos três círculos: a mesma Terra, no mesmo lugar, volta em `the-pole`.
const EARTH = { cx: 960, cy: 540, r: 340 } as const;
const HOME_LAT = -23.5;
const RING_WIDTH = 10;
// O achatamento com que um círculo de latitude é visto de lado: o de `LatitudeRing`.
const RING_TILT = 0.16;
// A longitude em que o plano aberto entrega a Terra ao plano da casinha: os
// dois giram sem salto na troca.
const HANDOVER = -0.12;
// O globo é girado para o chão da casinha (`HOME_LAND`) passar pelo meio do
// disco quando as contas dos círculos passam: ela fica sobre a terra dela.
const LAND_TURN = spinFor(0);

// A câmera do plano da casinha: parte de onde o plano aberto parou e fecha na faixa entre o equador e São Paulo.
const CLOSE = { from: 1.04, to: 1.25, focus: [960, 640] } as const;

type RingsProps = {
  /** Onde estão as contas dos círculos, em voltas: a Terra gira junto. */
  readonly lon: number;
  /** Quanto cada círculo já apareceu: equador, São Paulo, polo. */
  readonly shown?: readonly [number, number, number];
  /** A casinha no círculo de São Paulo, no lugar da conta. */
  readonly house?: boolean;
};

/** A Terra de lado com os três círculos: o grande no equador, o de São Paulo e o ponto do polo. */
const Rings: React.FC<RingsProps> = ({ lon, shown = [1, 1, 1], house = false }) => {
  const spin = lon + LAND_TURN;
  const home = landPoint(EARTH.r, spin);
  const homeRing = EARTH.r * Math.cos((HOME_LAT * Math.PI) / 180);
  // A casinha pousa na metade de cá do círculo dela, que desce no meio do disco.
  const dip = homeRing * RING_TILT * Math.sqrt(Math.max(0, 1 - (home.x / homeRing) ** 2));
  return (
    <>
      <Globe {...EARTH} spin={spin} />
      <LatitudeRing {...EARTH} lat={0} color={ink.accent} width={RING_WIDTH} runner={lon} opacity={shown[0]} />
      <LatitudeRing
        {...EARTH}
        lat={HOME_LAT}
        color={earth.waterLight}
        width={RING_WIDTH}
        runner={house ? undefined : lon}
        opacity={shown[1]}
      />
      <LatitudeRing {...EARTH} lat={90} color={ink.paper} width={RING_WIDTH} runner={lon} opacity={shown[2]} />
      {house ? (
        <House
          x={EARTH.cx + home.x}
          y={EARTH.cy + home.y + dip}
          size={66}
          rotate={(home.x / EARTH.r) * 40}
        />
      ) : null}
    </>
  );
};

type ThreeRingsProps = {
  /** O quadro em que cada círculo entra: equador, São Paulo, polo. */
  readonly at: readonly [number, number, number];
};

/** Os três dão a volta no mesmo tempo, e o maior corre mais. */
const ThreeRings: React.FC<ThreeRingsProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const shown = (index: 0 | 1 | 2) => popOpacity(frame, at[index], 0.5 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={CLOSE.from}>
        <Svg>
          <Rings lon={HANDOVER - 1 + linear(frame, 0, length)} shown={[shown(0), shown(1), shown(2)]} />
        </Svg>
      </Push>
    </Frame>
  );
};

/** Onde uma altura da Terra cai no quadro com a câmera fechada: as etiquetas ficam fora dela, para não crescerem. */
const closeY = (y: number): number => CLOSE.focus[1] + (y - CLOSE.focus[1]) * CLOSE.to;

/** A casinha no círculo dela, ao sul do equador, e a velocidade de cada círculo. */
const TwoSpeeds: React.FC<{ readonly numberAt: number }> = ({ numberAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={CLOSE.focus} from={CLOSE.from} to={CLOSE.to} progress={settle(frame, 0, 0.6 * fps)}>
        <Svg>
          <Rings lon={mix(HANDOVER, -HANDOVER, linear(frame, 0, length))} house />
        </Svg>
      </Push>
      <Place x={EARTH.cx} y={closeY(EARTH.cy) - 104}>
        <Pop at={0.3 * fps}>
          <Tag on="dark">equador, 1.670 km/h</Tag>
        </Pop>
      </Place>
      <Place x={EARTH.cx} y={closeY(EARTH.cy + 250)}>
        <Pop at={numberAt}>
          <Tag on="note">São Paulo, cerca de 1.500 km/h</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

const POLE = { x: 840, y: 880, scale: 4.2 } as const;
// O disco de gelo em que ele gira: um carrossel quase parado.
const DISC = { rx: 450, ry: 70 } as const;
const SPOKES = 10;

/** No gelo do polo, o Explorador gira devagar no próprio lugar: "0 km/h". */
const OnThePole: React.FC<{ readonly zeroAt: number }> = ({ zeroAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const turned = linear(frame, 0, length);
  // O disco anda um quarto de volta no plano, para leste; ele vai junto, de frente para a câmera até além do perfil.
  const swing = turned * Math.PI * 0.5;
  // De 1 (três quartos) a 0 (de frente) e de volta a 1, do outro lado.
  const side = Math.abs(2 * turned - 1);
  return (
    <Frame
      backdrop={
        <Arrive from={1.18} focus={[POLE.x, 560]}>
          <IceBackdrop />
          <Svg>
            <ellipse cx={POLE.x} cy={POLE.y} rx={DISC.rx} ry={DISC.ry} fill={ice.groundShade} />
            {Array.from({ length: SPOKES }, (_, index) => {
              const angle = swing + (index / SPOKES) * Math.PI * 2;
              // Um raio é marcado, com uma conta na ponta: é ele que o olho segue para ver o disco andar.
              const marked = index === 0;
              const tip = [POLE.x + DISC.rx * Math.sin(angle), POLE.y + DISC.ry * Math.cos(angle)] as const;
              return (
                <g key={index}>
                  <line
                    x1={POLE.x}
                    y1={POLE.y}
                    x2={tip[0]}
                    y2={tip[1]}
                    stroke={marked ? tags.light.fill : ice.shadow}
                    strokeWidth={marked ? 12 : 8}
                    strokeLinecap="round"
                    opacity={marked ? 0.9 : 0.55}
                  />
                  {marked ? <circle cx={tip[0]} cy={tip[1]} r={20} fill={tags.light.fill} /> : null}
                </g>
              );
            })}
            <ellipse cx={POLE.x} cy={POLE.y} rx={DISC.rx} ry={DISC.ry} fill="none" stroke={ice.shadow} strokeWidth={10} />
            {/* A seta do giro, na beira de cá do disco: para leste. */}
            <g transform={`translate(${POLE.x} ${POLE.y})`}>
              <path
                d={`M${-DISC.rx * 0.5},${DISC.ry * 1.42} Q0,${DISC.ry * 1.9} ${DISC.rx * 0.5},${DISC.ry * 1.42}`}
                fill="none"
                stroke={tags.light.fill}
                strokeWidth={14}
                strokeLinecap="round"
              />
              <path
                d="M40,0 L-22,-30 L-22,30 Z"
                fill={tags.light.fill}
                transform={`translate(${DISC.rx * 0.5} ${DISC.ry * 1.42}) rotate(-22)`}
              />
            </g>
            <Explorer
              x={POLE.x}
              y={POLE.y}
              scale={POLE.scale}
              // O ovo não chega a perfil: para o giro se ver, ele começa de três quartos para oeste, passa de
              // frente no meio do plano, com as mãos juntas, e chega a três quartos para leste. A troca de
              // lado acontece de frente, onde a pose é simétrica.
              flip={turned < 0.5}
              pose={alive(
                {
                  ...CUP,
                  turn: 0.95 * side,
                  hip: [6 * side, CUP.hip[1]],
                  gaze: [0.7 * side, 0],
                  farHand: [mix(0, 58, side), mix(-40, -52, side)],
                  nearHand: [mix(0, -34, side), mix(-34, -24, side)],
                  nearAnkle: [-14, -6.2],
                  farAnkle: [14, -6.2],
                },
                frame / fps,
                "explorador",
              )}
              shadow={ice.shadow}
              held={<Mug />}
            />
          </Svg>
        </Arrive>
      }
    >
      <Place x={1470} y={400}>
        <Pop at={zeroAt}>
          <Tag on="light" size="label">
            0 km/h
          </Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

export const ByLatitudeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os três círculos">
      <ThreeRings at={[cue(scene, "lugar"), cue(scene, "perto"), cue(scene, "polos")]} />
    </Shot>
    <Shot range={shots[1]} name="São Paulo e o equador">
      <TwoSpeeds numberAt={cue(scene, "uns") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="no polo, zero">
      <OnThePole zeroAt={cue(scene, "zero") - shots[2].from} />
    </Shot>
  </>
);
