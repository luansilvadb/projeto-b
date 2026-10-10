import { useCurrentFrame, useVideoConfig } from "remotion";
import { blink, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { home, ink } from "../palette";
import { PEEK, Vig } from "../parts/Actor";
import { Caveat, CUT_BULGE, CutEarth, mixSea, SEA } from "../parts/CutEarth";
import { Arrow, Frame, HomeBackdrop, Push, SpaceBackdrop, Svg } from "../parts/kit";

const EARTH = { cx: 960, cy: 540, r: 320 } as const;
const TURN_SECONDS = 14;
// O tambor da máquina e a Terra em que ele vira: o mesmo círculo, no mesmo lugar.
const DRUM = { cx: 1010, cy: 560, r: 280 } as const;
const NO_SEA = { equator: 0, pole: 0 } as const;

/** No mesmo corte, a camada de mar veste a Terra acompanhando o formato dela; o giro a empurra para fora. */
const SeaWearsIt: React.FC<{ readonly seaAt: number; readonly pushAt: number }> = ({
  seaAt,
  pushAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pushed = ramp(frame, pushAt, 0.5 * fps);
  const rx = EARTH.r * (1 + CUT_BULGE + SEA.even.equator);
  // As setas pulsam para fora enquanto a fala explica o empurrão.
  const beat = 12 * wave(frame / fps, 1.1);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      {/* A câmera chega de perto do corte e abre até o planeta inteiro. */}
      <Push focus={[EARTH.cx + 260, EARTH.cy]} from={1.3} to={1} progress={ramp(frame, 0, 0.7 * fps)}>
        <Push focus={[EARTH.cx, EARTH.cy]} to={1.04}>
          <Svg>
            <CutEarth
              {...EARTH}
              spin={frame / fps / TURN_SECONDS}
              sea={mixSea(NO_SEA, SEA.even, ramp(frame, seaAt, 0.8 * fps))}
            />
            {([-1, 1] as const).map((side) => (
              <Arrow
                key={side}
                from={[EARTH.cx + side * (rx + 44 + beat), EARTH.cy]}
                to={[EARTH.cx + side * (rx + 170 + beat), EARTH.cy]}
                width={14}
                drawn={pushed}
              />
            ))}
          </Svg>
          {/* Encostada na camada de mar, do lado de fora. */}
          <Place x={600} y={290}>
            <Pop at={seaAt + 8}>
              <Caveat on="dark">exagerado</Caveat>
            </Pop>
          </Place>
        </Push>
      </Push>
    </Frame>
  );
};

/** A roupa no tambor: solta no meio, e colada na parede quando a centrífuga a empurra. */
const Clothes: React.FC<{ readonly pressed: number; readonly turns: number }> = ({
  pressed,
  turns,
}) => (
  <g transform={`translate(${DRUM.cx} ${DRUM.cy}) rotate(${turns * 360})`}>
    {Array.from({ length: 9 }, (_, index) => {
      const angle = (index / 9) * 360 + (index % 2) * 9;
      // Solta, cada peça fica a uma distância do meio; colada, todas na parede.
      const out = mix(DRUM.r * (0.25 + 0.3 * ((index * 5) % 3)) * 0.6, DRUM.r * 0.8, pressed);
      return (
        <ellipse
          key={index}
          cx={out}
          cy={0}
          rx={mix(48, 38, pressed)}
          ry={mix(56, 92, pressed)}
          fill={home.clothes[index % home.clothes.length]}
          transform={`rotate(${angle})`}
        />
      );
    })}
  </g>
);

/** O tambor redondo, visto pela escotilha. */
const Drum: React.FC<{ readonly pressed: number; readonly turns: number }> = ({
  pressed,
  turns,
}) => (
  <>
    <circle cx={DRUM.cx} cy={DRUM.cy} r={DRUM.r} fill={home.drum} />
    <Clothes pressed={pressed} turns={turns} />
  </>
);

/** Quantas voltas o tambor já deu: devagar no começo, depressa quando centrifuga. */
const drumTurns = (seconds: number, pressed: number) => seconds * (0.25 + 0.5 * pressed);

/** A máquina de lavar centrifugando, com a Vigília espiando pela escotilha. */
const Washer: React.FC<{ readonly pressAt: number }> = ({ pressAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const pressed = ramp(frame, pressAt, 0.9 * fps);
  // A máquina treme mais quanto mais depressa gira.
  const rattle = (2 + 4 * pressed) * wave(seconds, 0.09);
  // Os olhos dela acompanham a roupa dando a volta.
  const round = drumTurns(seconds, pressed) * Math.PI * 2;
  return (
    <Frame backdrop={<HomeBackdrop />}>
      <Push focus={[DRUM.cx, DRUM.cy]} to={1.05}>
        <Svg>
          <rect x={0} y={900} width={1920} height={180} fill={home.floor} />
          <rect x={0} y={900} width={1920} height={22} fill={home.floorShade} />
          <g transform={`translate(${rattle} 0)`}>
            {/* O painel é baixo: com a aproximação do plano, o topo da máquina ainda fica longe da borda. */}
            <rect x={640} y={120} width={740} height={790} rx={44} fill={home.washer} />
            <rect x={640} y={120} width={740} height={92} rx={44} fill={home.washerShade} />
            <circle cx={760} cy={166} r={30} fill={home.washer} />
            <rect x={754} y={140} width={12} height={30} rx={6} fill={home.drum} />
            <rect x={1040} y={148} width={220} height={36} rx={18} fill={home.drum} />
            <circle cx={DRUM.cx} cy={DRUM.cy} r={DRUM.r + 46} fill={home.washerShade} />
            <circle cx={DRUM.cx} cy={DRUM.cy} r={DRUM.r + 20} fill={home.washer} />
            <Drum pressed={pressed} turns={drumTurns(seconds, pressed)} />
            {/* O brilho do vidro da escotilha. */}
            <path
              d={`M${DRUM.cx - 210},${DRUM.cy - 110} A240,240 0 0 1 ${DRUM.cx - 60},${DRUM.cy - 232}`}
              fill="none"
              stroke={home.washer}
              strokeWidth={22}
              strokeLinecap="round"
              opacity={0.35}
            />
          </g>
          <Vig
            x={380}
            y={900}
            scale={3.3}
            pose={{
              ...PEEK,
              gaze: [0.8 + 0.15 * Math.cos(round), 0.1 + 0.35 * Math.sin(round)],
              nearLid: blink(seconds, "washer"),
              farLid: blink(seconds, "washer"),
              // Quando a roupa cola na parede, ela se espanta um pouco.
              mouth: [9, mix(0.3, 0.7, pressed), 0.2],
              lean: 18 + 2 * wave(seconds, 3.5),
            }}
            shadow={home.contact}
          />
        </Svg>
        {/* Presa ao lado da máquina, que é a comparação. */}
        <Place x={1480} y={300}>
          <Pop at={6}>
            <Caveat on="light">comparação</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

/** O tambor vira a Terra, no mesmo círculo: a água junta em volta do equador, num calombo. */
const DrumBecomesEarth: React.FC<{ readonly pileAt: number }> = ({ pileAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const morph = ramp(frame, 0.15 * fps, 0.6 * fps);
  const piled = ramp(frame, pileAt, 0.9 * fps);
  // Onde a rocha acaba, na cintura do lado do corte, e a espessura do calombo ali.
  const rock = DRUM.cx + DRUM.r * (1 + CUT_BULGE);
  const thick = DRUM.r * SEA.piled.equator;
  const marked = ramp(frame, pileAt + 0.3 * fps, 0.4 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      {/* Continua do enquadramento em que a máquina ficou. */}
      <Push focus={[DRUM.cx, DRUM.cy]} from={1.05} to={1.1}>
        <Svg>
          <g opacity={morph}>
            <CutEarth
              {...DRUM}
              bulge={CUT_BULGE * ramp(frame, 0.4 * fps, 0.8 * fps)}
              spin={seconds / TURN_SECONDS}
              sea={mixSea(SEA.even, SEA.piled, piled)}
            />
          </g>
          <g opacity={1 - morph}>
            <Drum pressed={1} turns={drumTurns(seconds, 1)} />
          </g>
          {/* O calombo, medido quando a fala o nomeia: um colchete da rocha até a borda da água. Seta apontando para dentro leria como algo que aperta. */}
          <path
            d={`M${rock},${DRUM.cy - 34} L${rock},${DRUM.cy + 34} M${rock},${DRUM.cy} L${mix(rock, rock + thick, marked)},${DRUM.cy} M${rock + thick},${DRUM.cy - 34} L${rock + thick},${DRUM.cy + 34}`}
            fill="none"
            stroke={ink.accent}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={marked}
          />
        </Svg>
        {/* Colada no colchete: o exagerado é a espessura do calombo. */}
        <Place x={rock + thick + 150} y={DRUM.cy}>
          <Pop at={0.7 * fps}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const WaterPiledScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o mar veste a Terra">
      <SeaWearsIt seaAt={cue(scene, "mar")} pushAt={cue(scene, "empurra")} />
    </Shot>
    <Shot range={shots[1]} name="a máquina de lavar">
      <Washer pressAt={cue(scene, "roupa") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="o tambor vira a Terra">
      <DrumBecomesEarth pileAt={cue(scene, "calombo") - shots[2].from} />
    </Shot>
  </>
);
