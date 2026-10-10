import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { blockDay, earth, home, ink, space } from "../palette";
import { NightSide } from "../parts/ClimateGlobes";
import { Globe } from "../parts/Globe";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";
import { SunDisc } from "../parts/Sky";

/** A janela do começo, vazia: o Sol parado no meio do vidro. */
const StuckSun: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const glass = KITCHEN.window;
  return (
    <Frame
      backdrop={
        <Push focus={[glass.x + glass.width / 2, glass.y + glass.height / 2]} from={1.1} to={1.18}>
          <Kitchen
            // 0,68 põe o disco na metade da altura do vidro. Ele não sobe nem desce.
            sun={0.68}
            sunAt={0.7}
            curtain={0.5 * wave(seconds, 5)}
            outside={
              // Só o clarão respira: o Sol está preso ali.
              <circle
                cx={glass.x + glass.width * 0.7}
                cy={glass.y + glass.height * 0.5}
                r={190}
                fill={space.sunCore}
                opacity={0.16 + 0.06 * wave(seconds, 3.5)}
              />
            }
          />
        </Push>
      }
    >
      {null}
    </Frame>
  );
};

// De cima, com o norte para quem olha: a Terra dá a volta no Sol no sentido
// anti-horário. Uma volta (`turn` de 0 a 1) começa em cima do quadro, onde a
// bandeira está na linha da sombra, amanhecendo.
const SUN = { cx: 960, cy: 540, r: 118 } as const;
const ORBIT = 360;
const EARTH_R = 80;

const orbitPoint = (turn: number): readonly [number, number] => {
  const angle = Math.PI / 2 + turn * Math.PI * 2;
  return [SUN.cx + ORBIT * Math.cos(angle), SUN.cy - ORBIT * Math.sin(angle)];
};

/** O trecho da órbita entre duas frações da volta (no máximo meia volta). */
const orbitArc = (from: number, to: number): string => {
  const [x0, y0] = orbitPoint(from);
  const [x1, y1] = orbitPoint(to);
  return `M${x0},${y0} A${ORBIT},${ORBIT} 0 0 0 ${x1},${y1}`;
};

/**
 * A Terra parada, vista de cima, num ponto da volta: os continentes e a
 * bandeirinha não giram (ela aponta sempre para a direita do quadro); só o
 * lado da noite acompanha o Sol.
 */
const Orbiter: React.FC<{ readonly turn: number }> = ({ turn }) => {
  const [x, y] = orbitPoint(turn);
  const angle = Math.PI / 2 + turn * Math.PI * 2;
  return (
    <g>
      <Globe cx={x} cy={y} r={EARTH_R} spin={0.08} shade={0} caps={false} />
      {/* A noite fica do lado oposto ao Sol. */}
      <NightSide cx={x} cy={y} r={EARTH_R} turn={(-angle * 180) / Math.PI} opacity={0.72} />
      {/*
        A bandeira, fincada no lado direito: é a prova de que a Terra não gira, e fica em cor cheia
        a volta inteira. Quem diz se ali é dia ou noite é o lado da Terra em que ela está fincada.
      */}
      <g transform={`translate(${x + EARTH_R - 8} ${y})`}>
        <path d="M46,-7 L124,-7 L124,-84 Z" fill={home.curtain} />
        <rect x={0} y={-8} width={128} height={16} rx={8} fill={ink.paper} />
      </g>
    </g>
  );
};

/** O Sol e a Terra de cima: a Terra dá a volta, e a bandeira passa meia volta no claro e meia no escuro. */
const OneLap: React.FC = () => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  // Uma volta no plano inteiro; o plano seguinte continua dela, no mesmo passo.
  const turn = frame / length;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.5, 0.5]} />}>
      <Push focus={[SUN.cx, SUN.cy]} to={1.04}>
        <Svg>
          <circle cx={SUN.cx} cy={SUN.cy} r={ORBIT} fill="none" stroke={earth.ghost} strokeWidth={4} strokeDasharray="6 18" opacity={0.35} />
          {/* O rastro guarda o que a bandeira viveu em cada trecho: luz, depois noite. */}
          <g fill="none" strokeWidth={14} strokeLinecap="round">
            {turn > 0.5 ? <path d={orbitArc(0.5, turn)} stroke={blockDay.night} /> : null}
            {turn > 0 ? <path d={orbitArc(0, Math.min(turn, 0.5))} stroke={space.sun} /> : null}
          </g>
          <SunDisc {...SUN} />
          <Orbiter turn={turn} />
        </Svg>
      </Push>
    </Frame>
  );
};

const MONTHS = 12;

type RingProps = {
  /** O quadro em que a fala chega aos seis meses de noite. */
  readonly nightAt: number;
  /** Quantos quadros a Terra leva numa volta: os do plano anterior. */
  readonly lap: number;
};

/** A volta vira um calendário em anel: doze meses, seis claros e seis escuros. */
const CalendarRing: React.FC<RingProps> = ({ nightAt, lap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // O rastro fino do plano anterior engrossa e se parte em meses.
  const formed = ramp(frame, 0, 0.7 * fps);
  const gap = 0.006 * formed;
  // A Terra segue a volta de onde o plano anterior parou, no mesmo passo. Quem acompanha a fala
  // é o anel: a metade clara incha quando o plano abre, e a escura quando a fala chega à noite.
  const turn = (frame / lap) % 1;
  const current = Math.floor(turn * MONTHS);
  const swell = (at: number) => ramp(frame, at, 0.3 * fps) * (1 - ramp(frame, at + 0.5 * fps, 0.6 * fps));
  const named = [swell(0.1 * fps), swell(nightAt)] as const;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.5, 0.5]} />}>
      <Push focus={[SUN.cx, SUN.cy]} from={1.04} to={0.94} progress={formed}>
        <Svg>
          <g fill="none">
            {Array.from({ length: MONTHS }, (_, month) => (
              <path
                key={month}
                d={orbitArc(month / MONTHS + gap, (month + 1) / MONTHS - gap)}
                stroke={month < MONTHS / 2 ? space.sun : blockDay.night}
                // O mês em que a Terra está fica mais largo.
                strokeWidth={
                  14 + 66 * formed + (month === current ? 22 * formed : 0) + 26 * named[month < MONTHS / 2 ? 0 : 1]
                }
                strokeLinecap={formed < 0.2 ? "round" : "butt"}
              />
            ))}
          </g>
          <SunDisc {...SUN} />
          <Orbiter turn={turn} />
        </Svg>
      </Push>
    </Frame>
  );
};

export const YearLongDayScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    {/*
      Os dois primeiros planos do roteiro (a Terra de hoje girando e os dois movimentos) ainda
      não têm desenho: até lá, o Sol parado na janela cobre os dois.
    */}
    <Shot range={{ from: shots[0].from, to: shots[1].to }} name="o Sol parado na janela">
      <StuckSun />
    </Shot>
    <Shot range={shots[2]} name="uma volta no Sol">
      <OneLap />
    </Shot>
    <Shot range={shots[3]} name="o calendário em anel">
      <CalendarRing nightAt={cue(scene, "seis", 2) - shots[3].from} lap={shots[2].to - shots[2].from} />
    </Shot>
  </>
);
