import { Leftovers } from "../../../components/Actors";
import { useId } from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Layer } from "../../../components/Camera";
import { Drifters } from "../../../components/Drifters";
import { wave } from "../../../components/Idle";
import { SvgLayer } from "../../../components/SvgLayer";
import { openSea } from "../palette";

/** A linha da superfície no plano do assunto. */
export const SURFACE_Y = 430;

type OpenSeaProps = {
  /** O assunto, no plano da água: o que fica abaixo da superfície ganha o véu da água por cima. */
  readonly children: React.ReactNode;
};

const WAVE_SECONDS = 2.8;
// Reflexos do sol na água, perto da superfície: x e largura.
const GLINTS = [
  [200, 120],
  [520, 80],
  [900, 160],
  [1300, 100],
  [1700, 140],
] as const;

/**
 * O mar aberto do golfinho: céu creme, a superfície com espuma cortando o
 * quadro, água turquesa que escurece para baixo, reflexos e bolhas. O que o
 * assunto faz abaixo da linha fica visto através da água.
 */
export const OpenSea: React.FC<OpenSeaProps> = ({ children }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const swell = 8 * wave(seconds, WAVE_SECONDS);
  const surface = (phase: number) =>
    `M-400,${SURFACE_Y + swell} C0,${SURFACE_Y - 14 + swell * phase} 400,${SURFACE_Y + 14 - swell} 800,${SURFACE_Y + swell * phase} C1200,${SURFACE_Y - 14 - swell} 1600,${SURFACE_Y + 14 + swell * phase} 2300,${SURFACE_Y + swell}`;

  return (
    <>
      <Layer depth={0}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(${openSea.sky[0]}, ${openSea.sky[1]})`,
          }}
        />
      </Layer>

      <Layer depth={0.4}>
        <SvgLayer>
          {/* Ondas distantes, um pouco acima da linha. */}
          {[0, 1, 2].map((row) => (
            <path
              key={row}
              d={`M-400,${SURFACE_Y - 30 - row * 22} ${Array.from({ length: 12 }, (_, i) => `q110,-${10 + 4 * wave(seconds, WAVE_SECONDS, i / 5 + row / 3)} 220,0`).join(" ")}`}
              fill="none"
              stroke={openSea.surface}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.4 - row * 0.1}
            />
          ))}
        </SvgLayer>
      </Layer>

      <Layer depth={1}>
        <SvgLayer>
          <defs>
            <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} stopColor={openSea.surface} stopOpacity={0.5} />
              <stop offset={1} stopColor={openSea.surface} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${id}-water`} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} stopColor={openSea.water[0]} />
              <stop offset={0.25} stopColor={openSea.water[1]} />
              <stop offset={0.6} stopColor={openSea.water[2]} />
            </linearGradient>
          </defs>
          {/* A água, no plano do assunto: a linha acompanha a câmera. */}
          <rect
            x={-1200}
            y={SURFACE_Y}
            width={4400}
            height={2000}
            fill={`url(#${id}-water)`}
          />
          {/* Luz entrando pela superfície. */}
          <rect
            x={-400}
            y={SURFACE_Y}
            width={2700}
            height={260}
            fill={`url(#${id})`}
          />
          {GLINTS.map(([x, width], index) => (
            <ellipse
              key={x}
              cx={x + 20 * wave(seconds, 3.4, index / 5)}
              cy={SURFACE_Y + 40 + index * 14}
              rx={width / 2}
              ry={5}
              fill={openSea.foam}
              opacity={0.25 + 0.2 * wave(seconds, 1.9, index / 3)}
            />
          ))}
        </SvgLayer>
        {children}
        <Leftovers />
        <SvgLayer>
          {/* O véu da água por cima do que está submerso, e a espuma da linha. */}
          <path
            d={`${surface(1)} L2300,1400 L-400,1400 Z`}
            fill={openSea.water[0]}
            opacity={0.28}
          />
          <path
            d={surface(1)}
            fill="none"
            stroke={openSea.foam}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d={surface(-1)}
            fill="none"
            stroke={openSea.surface}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.7}
            transform="translate(0 14)"
          />
        </SvgLayer>
      </Layer>

      <Layer depth={0.9}>
        <AbsoluteFill style={{ clipPath: `inset(${SURFACE_Y + 20}px 0 0 0)` }}>
          <Drifters
            seed="sea-bubbles"
            count={30}
            color={openSea.foam}
            opacity={0.45}
            size={[2, 6]}
            speed={2.4}
          />
        </AbsoluteFill>
      </Layer>

      <Layer depth={1.4}>
        {/* Uma onda desfocada em primeiro plano, que sobe e desce. */}
        <AbsoluteFill
          style={{
            filter: "blur(12px)",
            translate: `0 ${12 * wave(seconds, WAVE_SECONDS, 0.3)}px`,
          }}
        >
          <SvgLayer>
            {Array.from({ length: 6 }, (_, index) => {
              const pick = (trait: string) =>
                random(`sea-front-${trait}-${index}`);
              return (
                <ellipse
                  key={index}
                  cx={pick("x") * 1920}
                  cy={1060 + pick("y") * 80}
                  rx={200 + pick("w") * 200}
                  ry={40 + pick("h") * 30}
                  fill={openSea.water[2]}
                  opacity={0.5}
                />
              );
            })}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>
    </>
  );
};

/** O sopro do golfinho ao respirar: um jato que sobe e se abre, de 0 a 1. */
export const Spout: React.FC<{ x: number; y: number; progress: number }> = ({
  x,
  y,
  progress,
}) => {
  if (progress <= 0 || progress >= 1) {
    return null;
  }
  return (
    <SvgLayer>
      {[-1, 0, 1].map((lean) => (
        <ellipse
          key={lean}
          cx={x + lean * 40 * progress}
          cy={y - 90 * progress - 30}
          rx={18 + 14 * progress}
          ry={30 + 30 * progress}
          fill={openSea.spray}
          opacity={0.9 * (1 - progress)}
        />
      ))}
    </SvgLayer>
  );
};
