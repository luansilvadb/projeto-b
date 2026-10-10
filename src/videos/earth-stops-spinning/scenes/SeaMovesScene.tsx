import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { popOpacity, popScale } from "../../../components/Pop";
import { cue, linear, mix, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, storm, tags } from "../palette";
import { Globe } from "../parts/Globe";
import { Arrow, Frame, Push, Question, StormBackdrop, Svg } from "../parts/kit";

const EARTH = { cx: 960, cy: 545, r: 390 } as const;
// A terra firme deste plano, em unidades do disco (raio 100): uma ponta de
// continente a oeste e um continente inteiro a leste, com o oceano no meio.
const LAND = [
  "M -150 -46 C -92 -56 -68 -46 -63 -22 C -59 0 -71 14 -65 36 C -61 54 -82 66 -150 60 Z",
  "M 30 -62 C 50 -76 104 -72 112 -40 L 112 58 C 92 76 60 70 45 50 C 34 34 41 12 31 -4 C 20 -22 16 -50 30 -62 Z",
] as const;
// Quanto o mar anda sobre o fundo até o fim do plano, nas mesmas unidades.
const SLIDE = 17;

/** A Terra parada, de lado: o oceano inteiro segue para leste sobre o fundo e sobe na borda do continente. */
const OceanSlides: React.FC<{ readonly eastAt: number }> = ({ eastAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const id = useId();
  const seconds = frame / fps;
  // O mar não freia: anda a passo constante desde o começo.
  const slid = SLIDE * linear(frame, 0.3 * fps, length - 0.3 * fps);
  const k = EARTH.r / 100;
  return (
    <Frame backdrop={<StormBackdrop wind={0.6} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={1.05}>
        <Svg>
          <Globe {...EARTH} bare caps={false} shade={0.3}>
            <defs>
              {/* O mar é tudo o que não é a terra, levado para leste. */}
              <mask id={`${id}-sea`}>
                <rect x={-120} y={-120} width={240} height={240} fill="white" />
                <g transform={`translate(${slid} 0)`} fill="black">
                  {LAND.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </g>
              </mask>
            </defs>
            {/* O fundo, que parou junto com a rocha, e a terra firme sobre ele. */}
            <rect x={-120} y={-120} width={240} height={240} fill={storm.ground} />
            <g fill={storm.sand}>
              {LAND.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g mask={`url(#${id}-sea)`}>
              <rect x={-120} y={-120} width={240} height={240} fill={storm.sea} />
              {/* As cristas, que andam com a água. */}
              <g
                fill="none"
                stroke={storm.seaLight}
                strokeWidth={2.2}
                strokeLinecap="round"
                opacity={0.6}
              >
                {[-58, -30, -6, 22, 50, 74].map((y, index) => {
                  const x = -52 + ((index * 37) % 60) + slid + 2 * wave(seconds, 2.2, index / 6);
                  return <path key={y} d={`M${x},${y} q7,-5 14,0 q7,5 14,0`} />;
                })}
              </g>
            </g>
            {/* A espuma na frente e atrás da água. */}
            <g
              transform={`translate(${slid} 0)`}
              fill="none"
              stroke={storm.seaLight}
              strokeWidth={2.6}
              strokeLinejoin="round"
            >
              {LAND.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </Globe>
          {/* Para onde o mar vai: leste. */}
          {[-150, 10, 170].map((dy, index) => (
            <Arrow
              key={dy}
              from={[EARTH.cx - 190 + slid * k * 0.6, EARTH.cy + dy]}
              to={[EARTH.cx - 20 + slid * k * 0.6, EARTH.cy + dy]}
              color={ink.paper}
              width={14}
              drawn={settle(frame, eastAt + index * 3, 0.4 * fps)}
            />
          ))}
        </Svg>
      </Push>
    </Frame>
  );
};

// A praia, vista da areia: o horizonte é só mar, e a beira da água é uma
// diagonal que foge para um ponto do horizonte fora do quadro, a leste. A areia
// desce para a água em vez de dividir o horizonte com ela.
const BEACH = { horizon: 600, ruler: [1180, 900], top: 250, mark: 430, vanish: 2500 } as const;
// A que altura a beira da água passa na linha da régua: no começo do plano e quando chega ao pé dela.
const REACH = { from: 720, to: 872 } as const;
// Depois de chegar, a água vai e volta sem assentar: quanto cada onda passa do pé da régua, em pixels da
// areia, e de quanto em quanto tempo vem uma. Cada uma molha a régua até uma marca diferente.
const SURGES = [50, 112, 76, 142, 62, 124, 90] as const;
const SURGE = { arrive: 1.2, seconds: 1.5, climb: 2 } as const;

/** A altura da beira da água na linha da régua, a `seconds` do começo do plano. */
const reachAt = (seconds: number): number => {
  const since = (seconds - SURGE.arrive) / SURGE.seconds;
  if (since < 0) {
    const t = seconds / SURGE.arrive;
    return mix(REACH.from, REACH.to, t * t * (3 - 2 * t));
  }
  const surge = SURGES[Math.floor(since) % SURGES.length];
  return REACH.to + surge * (0.5 - 0.5 * Math.cos((since % 1) * Math.PI * 2));
};

/** Até que altura da régua a água chega, com a beira em `reach`: zero enquanto ela não passa do pé. */
const levelOf = (reach: number): number => Math.max(0, reach - BEACH.ruler[1]) * SURGE.climb;

/** A altura da beira da água em `x`, quando ela passa a `reach` de altura na linha da régua. */
const shoreY = (x: number, reach: number) =>
  BEACH.horizon +
  ((reach - BEACH.horizon) * (BEACH.vanish - x)) / (BEACH.vanish - BEACH.ruler[0]);

/** A beira da água, de oeste a leste: uma fileira de línguas de espuma, maiores perto da câmera. */
const foamEdge = (reach: number, seconds: number): string => {
  const lobes = 9;
  const step = (BEACH.vanish + 400) / lobes;
  return Array.from({ length: lobes }, (_, index) => {
    const from = -400 + index * step;
    const to = from + step;
    // Cada língua avança e recua no tempo dela.
    const tongue = (34 + 16 * wave(seconds, 1.9, index / 3.3)) * ((BEACH.vanish - from) / 1900);
    return `${index === 0 ? `M${from},${shoreY(from, reach).toFixed(1)} ` : ""}Q${from + step / 2},${(shoreY(from + step / 2, reach) + tongue).toFixed(1)} ${to},${shoreY(to, reach).toFixed(1)}`;
  }).join(" ");
};

/** A praia: a régua de nível na areia, a água chegando, e a escala em branco. */
const BlankRuler: React.FC<{ readonly askAt: number }> = ({ askAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const [rx, ry] = BEACH.ruler;
  // A água chega ao pé da régua e não assenta: cada onda sobe até uma marca diferente e recua.
  const reach = reachAt(seconds);
  const level = levelOf(reach);
  // A régua fica molhada até onde a onda mais alta já foi.
  const wet = Math.max(...Array.from({ length: frame + 1 }, (_, past) => levelOf(reachAt(past / fps))));
  const edge = foamEdge(reach, seconds);
  const asked = popScale(frame, askAt, 0.3 * fps);
  return (
    <Frame backdrop={<StormBackdrop wind={0.5} />}>
      {/* Chega de mais aberto e assenta na régua. */}
      <Push focus={[rx, 600]} from={1.18} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Push focus={[rx, 600]}>
          <Svg>
            {/* O mar, até o horizonte, com as ondas que vêm atrás da beira. */}
            <rect x={-400} y={BEACH.horizon} width={2900} height={900} fill={storm.sea} />
            {[0.34, 0.64].map((back, index) => {
              const y = mix(BEACH.horizon, reach, back) + 5 * wave(seconds, 2.6, 0.2 + index / 3);
              return (
                <path
                  key={back}
                  d={foamEdge(y, seconds + 0.7 * (index + 1))}
                  fill="none"
                  stroke={storm.seaLight}
                  strokeWidth={6 + 5 * index}
                  strokeLinecap="round"
                  opacity={0.4 + 0.25 * index}
                />
              );
            })}
            {/* A areia, da beira para cá: a seca, a faixa molhada à frente da água e a espuma. */}
            <path d={`${edge} L${BEACH.vanish},1500 L-400,1500 Z`} fill={storm.sand} />
            <path
              d={`${edge} L${BEACH.vanish},${BEACH.horizon + 46} L-400,${shoreY(-400, reach) + 150} Z`}
              fill={storm.dustDeep}
              opacity={0.26}
            />
            <path
              d={edge}
              fill="none"
              stroke={ink.paper}
              strokeWidth={20}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* A régua, fincada: os traços da escala, e nenhum número. */}
            <ellipse cx={rx} cy={ry + 4} rx={120} ry={20} fill={storm.dustDeep} opacity={0.4} />
            <rect x={rx - 42} y={BEACH.top} width={84} height={ry - BEACH.top + 10} rx={12} fill={storm.fixed} />
            <rect x={rx + 20} y={BEACH.top} width={22} height={ry - BEACH.top + 10} rx={10} fill={storm.dust} />
            {Array.from({ length: 11 }, (_, index) => (
              <rect
                key={index}
                x={rx - 42}
                y={BEACH.top + 50 + index * 54}
                width={index % 2 === 0 ? 46 : 26}
                height={9}
                fill={storm.carried}
              />
            ))}
            {/* A água na régua: o molhado que fica, a água de agora e a espuma na linha dela. */}
            <rect x={rx - 42} y={ry + 10 - wet} width={84} height={wet} fill={storm.sea} opacity={0.28} />
            {level > 0 ? (
              <>
                <rect x={rx - 42} y={ry + 10 - level} width={84} height={level} fill={storm.sea} opacity={0.9} />
                <rect x={rx - 54} y={ry + 4 - level} width={108} height={12} rx={6} fill={ink.paper} />
              </>
            ) : null}
            {/* Onde o número estaria: a marca aponta para uma interrogação. */}
            <g opacity={popOpacity(frame, askAt, 0.3 * fps)}>
              <path
                d={`M${rx + 56},${BEACH.mark} L${rx + 150},${BEACH.mark}`}
                stroke={tags.warm.fill}
                strokeWidth={10}
                strokeLinecap="round"
              />
              <g transform={`translate(${rx + 250} ${BEACH.mark}) scale(${asked})`}>
                <Question x={0} y={0} size={190} fill={tags.warm.fill} color={tags.warm.text} />
              </g>
            </g>
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

export const SeaMovesScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o mar segue para leste">
      <OceanSlides eastAt={cue(scene, "leste")} />
    </Shot>
    <Shot range={shots[1]} name="a régua em branco">
      <BlankRuler askAt={cue(scene, "conta") - shots[1].from} />
    </Shot>
  </>
);
