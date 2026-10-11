import { useCurrentFrame, useVideoConfig } from "remotion";
import { blink, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { grown, Pop } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import { FPS } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, home, ink } from "../palette";
import { PEEK, Vig } from "../parts/Actor";
import { Caveat, CUT_BULGE, CutEarth, EscapeArrows, mixSea, SEA } from "../parts/CutEarth";
import { Globe } from "../parts/Globe";
import { Arrow, Frame, HomeBackdrop, Push, SpaceBackdrop, Svg } from "../parts/kit";

const EARTH = { cx: 960, cy: 540, r: 320 } as const;
const TURN_SECONDS = 14;
// O tambor da máquina e a Terra em que ele vira: o mesmo círculo, no mesmo lugar.
const DRUM = { cx: 1010, cy: 560, r: 280 } as const;
// A mesma Terra, de lado: de cima do polo o que se vê é a volta do equador, e é
// ela que tem o tamanho do tambor. O raio do polo é o que sobra.
const SIDE = { cx: DRUM.cx, cy: DRUM.cy, r: DRUM.r / (1 + CUT_BULGE) } as const;
const NO_SEA = { equator: 0, pole: 0 } as const;
// A que distância do meio a roupa fica quando cola na parede.
const AT_WALL = DRUM.r * 0.8;
// As voltas por segundo: o tambor centrifugando, e a câmera lenta em que a fala explica a curva.
const FAST = 0.75;
const SLOW = 0.12;

/** As voltas dadas até `frame` por algo cuja velocidade (voltas por segundo) muda no caminho. */
const turned = (frame: number, fps: number, speed: (at: number) => number): number => {
  let turns = 0;
  for (let at = 0; at < frame; at++) {
    turns += speed(at) / fps;
  }
  return turns;
};

/** A Terra em corte, girando, larga no equador: a seta do giro entra quando a fala diz quem a deixou assim. */
const SpunWide: React.FC<{ readonly spinAt: number }> = ({ spinAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drawn = ramp(frame, spinAt, 0.5 * fps);
  // O arco do giro, em volta do eixo, acima do polo: a metade de cá, indo para leste.
  const ring = { y: EARTH.cy - EARTH.r - 70, rx: 120, ry: 34 } as const;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      {/* A câmera chega de perto do corte e abre até o planeta inteiro. */}
      <Push focus={[EARTH.cx + 260, EARTH.cy]} from={1.3} to={1} progress={ramp(frame, 0, 0.7 * fps)}>
        <Push focus={[EARTH.cx, EARTH.cy]} to={1.04}>
          <Svg>
            <CutEarth {...EARTH} spin={frame / fps / TURN_SECONDS} />
            {drawn > 0 ? (
              <g>
                <path
                  d={`M${EARTH.cx - ring.rx},${ring.y} A${ring.rx},${ring.ry} 0 0 0 ${EARTH.cx + ring.rx},${ring.y}`}
                  fill="none"
                  stroke={ink.accent}
                  strokeWidth={14}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - drawn}
                />
                <path
                  d="M0,-34 L-26,12 L26,12 Z"
                  fill={ink.accent}
                  opacity={ramp(frame, spinAt + 0.4 * fps, 0.1 * fps)}
                  transform={`translate(${EARTH.cx + ring.rx} ${ring.y - 6})`}
                />
              </g>
            ) : null}
          </Svg>
          {/* Encostada na cintura, do lado de fora: é ela que está exagerada. */}
          <Place x={600} y={290}>
            <Pop at={8}>
              <Caveat on="dark">exagerado</Caveat>
            </Pop>
          </Place>
        </Push>
      </Push>
    </Frame>
  );
};

/**
 * A reta que a coisa tentaria seguir se nada a segurasse: uma seta em
 * tracejado, com o mesmo traço das setas de `EscapeArrows`. Sobre a máquina,
 * que é branca, leva um contorno escuro por baixo (`cased`).
 */
const Straight: React.FC<{
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
  readonly drawn: number;
  readonly cased?: boolean;
}> = ({ from, to, drawn, cased = false }) => {
  if (drawn <= 0) {
    return null;
  }
  const tip = [mix(from[0], to[0], drawn), mix(from[1], to[1], drawn)] as const;
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return (
    <g>
      {(cased ? [ink.dark, ink.paper] : [ink.paper]).map((color) => {
        const grow = color === ink.dark ? 10 : 0;
        return (
          <g key={color}>
            <line
              x1={from[0]}
              y1={from[1]}
              x2={tip[0]}
              y2={tip[1]}
              stroke={color}
              strokeWidth={12 + grow}
              strokeLinecap="round"
              strokeDasharray="18 24"
            />
            <path
              d="M26,0 L-16,-21 L-16,21 Z"
              fill={color}
              stroke={color}
              strokeWidth={grow}
              strokeLinejoin="round"
              transform={`translate(${tip[0]} ${tip[1]}) rotate(${angle})`}
            />
          </g>
        );
      })}
    </g>
  );
};

type DrumProps = {
  /** Quanto a roupa já foi do meio do tambor para a parede, de 0 a 1. */
  readonly pressed: number;
  /** Quanto ela se achata contra a parede, de 0 a 1. */
  readonly squashed: number;
  readonly turns: number;
  /** Quanto as outras peças cedem à que a fala acompanha, de 0 a 1. */
  readonly dimmed?: number;
};

/**
 * O tambor redondo, visto pela escotilha, girando no sentido da Terra vista de
 * cima do polo norte. A primeira peça é a que a fala acompanha: ela fica no
 * ângulo zero do tambor, e a reta e o ponto dos planos saem dali.
 */
const Drum: React.FC<DrumProps> = ({ pressed, squashed, turns, dimmed = 0 }) => (
  <>
    <circle cx={DRUM.cx} cy={DRUM.cy} r={DRUM.r} fill={home.drum} />
    <g transform={`translate(${DRUM.cx} ${DRUM.cy}) rotate(${-turns * 360})`}>
      {Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * 360 + (index % 2) * 9;
        // Solta, cada peça fica a uma distância do meio; colada, todas na parede.
        const out = mix(DRUM.r * (0.25 + 0.3 * ((index * 5) % 3)) * 0.6, AT_WALL, pressed);
        return (
          <ellipse
            key={index}
            cx={out + 8 * squashed}
            cy={0}
            rx={mix(48, 38, pressed) - 8 * squashed}
            ry={mix(56, 92, pressed) + 10 * squashed}
            fill={home.clothes[index % home.clothes.length]}
            opacity={index === 0 ? 1 : 1 - 0.6 * dimmed}
            transform={`rotate(${angle})`}
          />
        );
      })}
    </g>
  </>
);

type WasherCues = {
  /** Os quadros em que o tambor acelera, a peça tenta a reta, a parede acende e a roupa se espreme. */
  readonly fast: number;
  readonly tries: number;
  readonly wall: number;
  readonly squeezed: number;
};

/**
 * As voltas do tambor: devagar, depressa quando centrifuga, em câmera lenta
 * enquanto a fala explica a reta e a curva (a 0,75 volta por segundo a reta
 * varre o quadro e não se lê), e depressa de novo quando a roupa se espreme.
 */
const washerSpeed =
  (at: WasherCues, fps: number) =>
  (frame: number): number =>
    0.25 +
    (FAST - 0.25) * ramp(frame, at.fast, 0.6 * fps) -
    (FAST - SLOW) * ramp(frame, at.tries - 0.5 * fps, 0.6 * fps) +
    (FAST - SLOW) * ramp(frame, at.squeezed, 0.6 * fps);

/** A máquina de lavar centrifugando: uma peça tenta seguir reto, e a parede do tambor a obriga a fazer a curva. */
const Washer: React.FC<{ readonly at: WasherCues }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const speed = washerSpeed(at, fps);
  const turns = turned(frame, fps, speed);
  const pressed = ramp(frame, at.fast, 0.9 * fps);
  const squashed = ramp(frame, at.squeezed, 0.5 * fps);
  // A explicação: vale da tentativa até a roupa se espremer, quando o tambor volta a correr.
  const explaining = ramp(frame, at.tries, 0.4 * fps) * (1 - ramp(frame, at.squeezed, 0.4 * fps));
  const held = ramp(frame, at.wall, 0.4 * fps) * (1 - ramp(frame, at.squeezed, 0.4 * fps));
  // A máquina treme mais quanto mais depressa gira.
  const rattle = (1 + 7 * speed(frame)) * wave(seconds, 0.09);
  // Os olhos dela acompanham a peça dando a volta.
  const round = -turns * Math.PI * 2;
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
            <Drum pressed={pressed} squashed={squashed} turns={turns} dimmed={explaining} />
            {/* O brilho do vidro da escotilha. */}
            <path
              d={`M${DRUM.cx - 210},${DRUM.cy - 110} A240,240 0 0 1 ${DRUM.cx - 60},${DRUM.cy - 232}`}
              fill="none"
              stroke={home.washer}
              strokeWidth={22}
              strokeLinecap="round"
              opacity={0.35}
            />
            {/* Presas à peça, giram com ela: a parede que a segura, acesa, e a reta que ela tentaria seguir, que atravessa a parede. */}
            <g transform={`translate(${DRUM.cx} ${DRUM.cy}) rotate(${-turns * 360})`}>
              <path
                d={`M${(DRUM.r - 9) * Math.cos(0.3)},${(DRUM.r - 9) * Math.sin(0.3)} A${DRUM.r - 9},${DRUM.r - 9} 0 0 0 ${(DRUM.r - 9) * Math.cos(1.25)},${-(DRUM.r - 9) * Math.sin(1.25)}`}
                fill="none"
                stroke={ink.accent}
                strokeWidth={18}
                strokeLinecap="round"
                opacity={held}
              />
              <g opacity={explaining}>
                <Straight
                  from={[AT_WALL, -60]}
                  to={[AT_WALL, -340]}
                  drawn={ramp(frame, at.tries, 0.5 * fps)}
                  cased
                />
              </g>
            </g>
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
              // Quando a roupa se espreme na parede, ela se espanta um pouco.
              mouth: [9, mix(0.3, 0.7, squashed), 0.2],
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

// As manchas da Terra vista de cima do polo norte, em unidades de raio 100: em volta da calota, sem ser lugar nenhum.
const POLAR_LAND = [
  "M 20 -82 C 50 -88 78 -58 72 -28 C 68 -6 42 -10 32 -30 C 24 -46 4 -62 20 -82 Z",
  "M -76 -32 C -62 -62 -30 -56 -25 -30 C -20 -8 -40 12 -60 16 C -80 19 -90 -10 -76 -32 Z",
  "M -30 46 C -10 34 16 44 20 66 C 24 86 0 96 -20 88 C -40 80 -46 56 -30 46 Z",
  "M 50 18 C 70 8 92 24 86 46 C 80 64 60 66 50 50 C 44 40 42 26 50 18 Z",
] as const;

type EarthCues = {
  /** Os quadros em que as setas da gravidade entram, a vista passa ao corte de lado, os polos são marcados e o mar aparece. */
  readonly gravity: number;
  readonly side: number;
  readonly poles: number;
  readonly keeps: number;
  readonly water: number;
};

/**
 * O tambor vira a Terra vista de cima do polo: no lugar da parede, a gravidade.
 * Depois, o corte de lado: a tentativa de escapar é grande no equador e nula
 * nos polos. A passagem de uma vista à outra é uma fusão curta no mesmo lugar:
 * girar a vista dentro do plano pediria um planeta em três dimensões.
 */
const DrumBecomesEarth: React.FC<{ readonly at: EarthCues; readonly from: number }> = ({
  at,
  from,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const morph = ramp(frame, 0.15 * fps, 0.6 * fps);
  // O tambor chega correndo e a Terra gira devagar, para a reta do ponto se ler.
  const turns = from + turned(frame, fps, (now) => mix(FAST, SLOW, ramp(now, 0, 0.7 * fps)));
  const side = ramp(frame, at.side, 0.35 * fps);
  const pulled = ramp(frame, at.gravity, 0.4 * fps);
  // As setas pulsam: a gravidade puxando, e depois a tentativa de escapar empurrando.
  const beat = 10 * wave(seconds, 1.1);
  const sea = mixSea(NO_SEA, SEA.even, ramp(frame, at.water, 0.8 * fps));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      {/* Continua do enquadramento em que a máquina ficou, e chega mais perto. */}
      <Push focus={[DRUM.cx, DRUM.cy]} from={1.05} to={1.25}>
        <Svg>
          {side < 1 ? (
            <g opacity={1 - side}>
              <g opacity={morph}>
                <Globe {...DRUM} bare caps={false} shade={0.2}>
                  <g transform={`rotate(${-turns * 360})`}>
                    {POLAR_LAND.map((d) => (
                      <path key={d} d={d} fill={earth.land} />
                    ))}
                    <circle r={17} fill={earth.ice} />
                  </g>
                </Globe>
              </g>
              <g opacity={1 - morph}>
                <Drum pressed={1} squashed={1} turns={turns} />
              </g>
              {/* No lugar da parede: a gravidade, de todos os lados, apontando para dentro. */}
              {Array.from({ length: 8 }, (_, index) => {
                const angle = ((index + 0.5) / 8) * Math.PI * 2;
                const point = (out: number) =>
                  [DRUM.cx + out * Math.cos(angle), DRUM.cy + out * Math.sin(angle)] as const;
                return (
                  <Arrow
                    key={index}
                    from={point(DRUM.r + 170 - beat)}
                    to={point(DRUM.r + 62 - beat)}
                    width={14}
                    drawn={pulled}
                  />
                );
              })}
              {/* O ponto no equador, que é a borda desta vista, e a reta por onde ele tentaria sair. */}
              <g transform={`translate(${DRUM.cx} ${DRUM.cy}) rotate(${-turns * 360})`}>
                <Straight
                  from={[mix(AT_WALL, DRUM.r, morph), -40]}
                  to={[mix(AT_WALL, DRUM.r, morph), -270]}
                  drawn={ramp(frame, 0.5 * fps, 0.5 * fps)}
                />
                <circle
                  cx={DRUM.r}
                  r={20}
                  fill={ink.paper}
                  stroke={earth.shade}
                  strokeWidth={8}
                  opacity={morph}
                />
              </g>
            </g>
          ) : null}
          {side > 0 ? (
            <g opacity={side}>
              <CutEarth {...SIDE} spin={seconds / TURN_SECONDS} sea={sea} />
              <EscapeArrows
                {...SIDE}
                sea={sea}
                strength={ramp(frame, at.side + 0.2 * fps, 0.5 * fps)}
                // Quando a fala diz o que ela mantém, as setas empurram mais.
                beat={beat * (0.5 + ramp(frame, at.keeps, 0.4 * fps))}
              />
              {/* Em cima dos polos, nenhuma seta: a marca leva o olho até lá para ver que não há. */}
              {([-1, 1] as const).map((pole) => (
                <circle
                  key={pole}
                  cx={SIDE.cx}
                  cy={SIDE.cy + pole * SIDE.r * (1 + sea.pole)}
                  r={16 * grown(frame, at.poles)}
                  fill={ink.paper}
                  stroke={earth.shade}
                  strokeWidth={7}
                />
              ))}
            </g>
          ) : null}
        </Svg>
        {/* Encostada na cintura, do lado de fora, acima das setas: é ela que está exagerada. */}
        <Place x={SIDE.cx - 400} y={SIDE.cy - 250}>
          <Pop at={at.side + 0.4 * fps}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const WaterPiledScene: React.FC<SceneProps> = ({ scene, shots }) => {
  // As deixas de um plano contam do começo dele.
  const washer = (word: string, occurrence = 1) => cue(scene, word, occurrence) - shots[1].from;
  const planet = (word: string, occurrence = 1) => cue(scene, word, occurrence) - shots[2].from;
  const washerCues: WasherCues = {
    fast: washer("depressa"),
    tries: washer("tenta"),
    wall: washer("parede"),
    squeezed: washer("espremida"),
  };
  return (
    <>
      <Shot range={shots[0]} name="larga no equador, girando">
        <SpunWide spinAt={cue(scene, "foi")} />
      </Shot>
      <Shot range={shots[1]} name="a máquina de lavar">
        <Washer at={washerCues} />
      </Shot>
      <Shot range={shots[2]} name="o tambor vira a Terra">
        <DrumBecomesEarth
          // O tambor continua da volta em que a máquina ficou.
          from={turned(shots[1].to - shots[1].from, FPS, washerSpeed(washerCues, FPS))}
          at={{
            gravity: planet("gravidade"),
            side: planet("equador"),
            poles: planet("polos"),
            keeps: planet("segura"),
            water: planet("água"),
          }}
        />
      </Shot>
    </>
  );
};
