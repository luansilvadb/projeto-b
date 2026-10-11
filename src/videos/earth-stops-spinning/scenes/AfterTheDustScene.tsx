import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { clamp01, cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, ink, storm } from "../palette";
import { Globe } from "../parts/Globe";
import { Arrow, Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { LeverStation } from "../parts/Lever";
import { STAGE } from "./SwitchOffScene";

// O mesmo ritmo e a mesma retomada de `WhyNotStopScene`, que religa a alavanca mais adiante.
const TURN_SECONDS = 14;
const SPIN_UP_SECONDS = 1.8;

/** As voltas dadas `seconds` depois de ligada: parte de parada, acelera e segue no ritmo de sempre. */
const spunUp = (seconds: number): number => {
  const t = Math.max(0, seconds);
  return (t < SPIN_UP_SECONDS ? (t * t) / (2 * SPIN_UP_SECONDS) : t - SPIN_UP_SECONDS / 2) / TURN_SECONDS;
};

/**
 * As voltas dadas enquanto a Terra freia por igual de `from` a `to` (em segundos), partindo do
 * ritmo de sempre: sem degrau nenhum, que é o contrário do tranco do primeiro experimento.
 */
const slowedDown = (seconds: number, from: number, to: number): number => {
  const u = clamp01((seconds - from) / (to - from));
  return (Math.min(seconds, from) + (to - from) * (u - (u * u) / 2)) / TURN_SECONDS;
};

// Os continentes de `parts/Globe.tsx`, na mesma faixa de 400 que se repete, cada um com o meio
// dele: a Terra deste plano é a do vídeo, mas aqui a terra seca precisa mudar de contorno, e o
// `Globe` só desenha a faixa inteira. É em volta do meio, na linha do equador, que cada um muda.
const STRIP = 400;
const LANDS = [
  {
    at: -37,
    d: "M -60 -50 C -40 -70 -10 -60 -5 -35 C 0 -15 -25 -5 -20 15 C -15 35 0 50 -10 70 C -20 80 -35 60 -40 40 C -45 20 -60 10 -65 -10 C -70 -30 -70 -40 -60 -50 Z",
    shade: "M -40 40 C -30 50 -12 52 -10 70 C -20 80 -35 60 -40 40 Z",
  },
  {
    at: 76,
    d: "M 40 -60 C 70 -75 110 -65 120 -40 C 128 -20 105 -10 95 5 C 88 20 95 45 80 55 C 65 62 55 40 50 20 C 46 0 25 -5 25 -25 C 25 -45 30 -55 40 -60 Z",
    shade: "M 60 30 C 72 36 90 40 80 55 C 65 62 58 44 60 30 Z",
  },
  { at: 166, d: "M 150 20 C 165 12 185 18 188 32 C 190 45 172 52 158 48 C 146 44 142 28 150 20 Z" },
  { at: 255, d: "M 230 -40 C 250 -55 280 -45 285 -25 C 288 -8 268 0 252 -4 C 236 -8 222 -25 230 -40 Z" },
  { at: 318, d: "M 300 10 C 320 0 345 12 342 34 C 340 52 318 60 304 48 C 292 38 290 18 300 10 Z" },
] as const;
// Para onde a terra seca vai quando a água sai do equador: mais larga na cintura, mais curta para
// os polos. É só o começo, e pouco: quanto e por quê são das cenas seguintes.
const SETTLED = { wide: 1.2, tall: 0.74 } as const;
// A Terra para com os dois continentes grandes de frente e um vão de mar no meio do disco.
const STOPPED_SPIN = 0;

type EarthProps = {
  readonly spin: number;
  /** Quanto a água já saiu do equador, e quanto do contorno antigo está à vista, de 0 a 1. */
  readonly moved?: number;
  readonly ghost?: number;
  readonly shade?: number;
};

/** A Terra do vídeo, com a terra seca desenhada aqui para poder mudar de contorno. */
const Earth: React.FC<EarthProps> = ({ spin, moved = 0, ghost = 0, shade }) => {
  const drift = (((spin % 1) + 1) % 1) * STRIP;
  const copies = [drift - STRIP, drift];
  const about = (at: number) =>
    `translate(${at} 0) scale(${mix(1, SETTLED.wide, moved)} ${mix(1, SETTLED.tall, moved)}) translate(${-at} 0)`;
  return (
    <Globe {...STAGE.earth} bare shade={shade}>
      {copies.map((offset) => (
        <g key={offset} transform={`translate(${offset} 0)`}>
          {LANDS.map((land) => (
            <g key={land.at} transform={about(land.at)}>
              <path d={land.d} fill={earth.land} />
              {"shade" in land ? <path d={land.shade} fill={earth.landShade} opacity={0.55} /> : null}
            </g>
          ))}
          {/* O contorno de antes, que não se mexe. */}
          {ghost > 0
            ? LANDS.map((land) => (
                <path
                  key={land.at}
                  d={land.d}
                  fill="none"
                  stroke={earth.ghost}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                  opacity={ghost}
                />
              ))
            : null}
        </g>
      ))}
    </Globe>
  );
};

// Onde ficam as duas etiquetas da cena: acima da alavanca, que é o que elas qualificam.
const TAG = { x: 1400, y: 330 } as const;

type ResetProps = {
  /** O quadro em que ela devolve a alavanca para ligado. */
  readonly resetAt: number;
  /** As voltas com que a Terra está parada no começo. */
  readonly spin: number;
};

/** Em que ponto do giro a Terra está, `frame` quadros depois de a alavanca voltar para ligado. */
const resumed = (frame: number, fps: number): number => spunUp(frame / fps - 0.3);

/**
 * O fim do primeiro experimento: a Terra parada, com a poeira dele no ar, e a alavanca desligada.
 * A Vigília devolve a alavanca para ligado, e tudo volta ao começo: a poeira some e a Terra gira.
 */
const StartOver: React.FC<ResetProps> = ({ resetAt, spin }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const globe = STAGE.earth;
  const k = globe.r / 100;
  const on = ramp(frame, resetAt, 0.5 * fps);
  const looked = ramp(frame, resetAt + 0.8 * fps, 0.4 * fps);
  // A poeira some junto com o empurrão: é a alavanca que desfaz o estrago, e não o tempo.
  const dusty = 1 - ramp(frame, resetAt + 0.1 * fps, 0.6 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1200, 640]} to={1.04}>
        <Svg>
          <Earth spin={spin + resumed(frame - resetAt, fps)} shade={mix(0.32, 0.44, dusty)} />
          {/*
            A poeira do primeiro experimento, ainda no ar: um véu sobre a Terra e nuvens baixas em
            volta dela, na cor do chão da parada. Nuvens, e não pontos soltos, que leriam como confete.
          */}
          <circle cx={globe.cx} cy={globe.cy} r={globe.r + 2} fill={storm.dust} opacity={0.3 * dusty} />
          {Array.from({ length: 22 }, (_, index) => {
            const pick = (trait: string) => random(`after-dust-${trait}-${index}`);
            const turn = ((index + 0.6 * pick("turn")) / 22) * Math.PI * 2;
            const reach = globe.r * (0.8 + 0.3 * pick("reach"));
            const size = (34 + 30 * pick("size")) * dusty;
            const x = globe.cx + reach * Math.cos(turn) + 5 * k * wave(seconds, 5, pick("phase"));
            const y = globe.cy + reach * Math.sin(turn) + 4 * k * wave(seconds, 7, pick("drift"));
            return (
              // Ao sumir, cada nuvem encolhe no lugar.
              <g key={index} fill={pick("tone") > 0.35 ? storm.dust : storm.dustDeep} opacity={0.5 + 0.3 * pick("opacity")}>
                <circle cx={x} cy={y} r={size} />
                <circle cx={x - size * 0.9} cy={y + size * 0.3} r={size * 0.7} />
                <circle cx={x + size * 0.95} cy={y + size * 0.25} r={size * 0.75} />
              </g>
            );
          })}
          <LeverStation
            {...STAGE.lever}
            on={on}
            // Ela olha o estrago, e só então pega a haste.
            hands={ramp(frame, resetAt - 0.7 * fps, 0.5 * fps)}
            rest={{ turn: 0.15, gaze: [-0.8, -0.3], nod: -0.2, mouth: [10, 0, -0.5], nearBrow: [0.3, 2], farBrow: [0.3, 2] }}
            grip={{
              // O mesmo empurrão de `WhyNotStopScene`: o corpo vai junto com a haste, e depois ela confere a Terra.
              lean: 4 + 10 * on - 10 * looked,
              turn: mix(0.9, 0.2, looked),
              gaze: [mix(0.6, -0.8, looked), -0.4],
              mouth: [11, 0, mix(-0.2, 0.8, looked)],
              grit: 1 - on,
            }}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
      <Place {...TAG}>
        <Pop at={resetAt + 0.5 * fps}>
          <Tag on="dark">de novo</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

// Em quantos dentes a alavanca desce.
const NOTCHES = 5;

type SlowProps = {
  /** As voltas com que a Terra entra no plano, girando no ritmo de sempre. */
  readonly spin: number;
  /** Os quadros em que ela começa a baixar a alavanca e em que a Terra para. */
  readonly easeAt: number;
  readonly stopAt: number;
  /** Os quadros da etiqueta e do mar. */
  readonly tagAt: number;
  readonly seaAt: number;
};

/**
 * O segundo experimento: a alavanca desce dente por dente, e a Terra perde o giro por igual, sem
 * poeira e sem tranco, até parar. Só então o mar começa a sair do contorno antigo.
 */
const SlowDown: React.FC<SlowProps> = ({ spin, easeAt, stopAt, tagAt, seaAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Cada dente é um movimento curto e uma espera: a mão é cuidadosa, e a Terra não sente o degrau.
  const step = (stopAt - easeAt) / NOTCHES;
  const notched =
    Array.from({ length: NOTCHES }, (_, notch) => ramp(frame, easeAt + notch * step, Math.min(step, 0.35 * fps))).reduce(
      (sum, done) => sum + done,
      0,
    ) / NOTCHES;
  const stopped = ramp(frame, stopAt, 0.5 * fps);
  const moved = ramp(frame, seaAt, 2.6 * fps);
  // A câmera chega perto da Terra quando o assunto passa a ser o mar.
  const close = ramp(frame, seaAt - 0.4 * fps, 1.4 * fps);
  const flow = ramp(frame, seaAt + 0.3 * fps, 1.2 * fps);
  const globe = STAGE.earth;
  const k = globe.r / 100;
  // O vão de mar no meio do disco, onde as setas cabem sem cobrir terra.
  const gap = globe.cx + 9 * k;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1200, 640]} from={1.04} to={1.04}>
        <Push focus={[globe.cx + 200, globe.cy]} from={1} to={1.16} progress={close}>
          <Svg>
            <Earth
              spin={spin + slowedDown(frame / fps, easeAt / fps, stopAt / fps)}
              moved={moved}
              ghost={ramp(frame, seaAt, 0.5 * fps)}
            />
            {/* A água indo do equador para os polos: só o sentido, sem tamanho. */}
            {[-1, 1].map((side) => (
              <Arrow
                key={side}
                from={[gap, globe.cy + side * 14 * k]}
                to={[gap, globe.cy + side * 74 * k]}
                color={earth.waterLight}
                width={12}
                drawn={flow}
              />
            ))}
            <LeverStation
              {...STAGE.lever}
              on={1 - notched}
              hands={1}
              grip={{
                // Sem esforço: ela baixa a haste olhando para ela, e no fim confere a Terra.
                lean: mix(4, 8, notched) - 6 * stopped,
                turn: mix(mix(0.2, 0.9, ramp(frame, 0, 0.5 * fps)), 0.2, stopped),
                gaze: [mix(0.6, -0.8, stopped), -0.4],
                mouth: [10, 0, 0.3],
              }}
              shadow={ink.dark}
            />
          </Svg>
        </Push>
      </Push>
      <Place {...TAG}>
        <Pop at={tagAt}>
          <Tag on="dark">aos poucos, em décadas</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

export const AfterTheDustScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const [first, second] = shots;
  const resetAt = cue(scene, "repetir");
  const easeAt = cue(scene, "perdendo") - second.from;
  const stopAt = cue(scene, "para", 3) - second.from;
  // As voltas são contadas de trás para a frente, a partir de onde a Terra para, para ela chegar
  // lá com os continentes de frente: o que ela gira freando, e o que gira no primeiro plano.
  const entering = STOPPED_SPIN - slowedDown(stopAt / fps, easeAt / fps, stopAt / fps);
  const wrecked = entering - resumed(first.to - first.from - resetAt, fps);
  return (
    <>
      <Shot range={first} name="a alavanca volta para ligado: de novo">
        <StartOver resetAt={resetAt} spin={wrecked} />
      </Shot>
      <Shot range={second} name="a alavanca desce aos poucos">
        <SlowDown
          spin={entering}
          easeAt={easeAt}
          stopAt={stopAt}
          tagAt={cue(scene, "décadas") - second.from}
          seaAt={cue(scene, "mar") - second.from}
        />
      </Shot>
    </>
  );
};
