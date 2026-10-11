import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, mix, ramp, settle, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, ink, space } from "../palette";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { STAND } from "../parts/Actor";
import { alive } from "../parts/EndAlive";
import { Globe, House, landPoint, LatitudeRing, spinFor } from "../parts/Globe";
import { Arrow, Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { LeverStation } from "../parts/Lever";
import { STAGE } from "./SwitchOffScene";

const TURN_SECONDS = 14;

// Solta a haste, ela ainda está virada para a alavanca, de olho nas mãos.
const LET_GO: VigiliaPose = { ...STAND, turn: 0.8, nod: 0.25, gaze: [0.5, 0.6], mouth: [11, 0, 0.5] };
// Um passo para trás, os braços soltos, olhando a Terra por cima do ombro.
const WATCHING: VigiliaPose = {
  ...STAND,
  hip: [-16, -26],
  turn: 0.15,
  nod: -0.3,
  gaze: [-0.8, -0.4],
  mouth: [11, 0, 0.9],
  nearAnkle: [-28, -6.2],
  farAnkle: [0, -6.2],
};

/** A Terra girando, a alavanca ligada: a Vigília tira as mãos dela, limpa-as, recua um passo e fica olhando a Terra girar. */
const HandsOff: React.FC<{ readonly releaseAt: number }> = ({ releaseAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const released = ramp(frame, releaseAt, 0.6 * fps);
  // O que ela faz com o tempo que sobra: bate uma mão na outra, dá o passo, vira-se e concorda com a cabeça.
  const dustAt = releaseAt + 0.55 * fps;
  const stepAt = dustAt + 0.95 * fps;
  const nodAt = stepAt + 1.5 * fps;
  const dusting = ramp(frame, dustAt, 0.25 * fps) * (1 - ramp(frame, stepAt - 0.1 * fps, 0.3 * fps));
  const rub = Math.sin(((frame - dustAt) / fps) * 3.2 * Math.PI * 2);
  const stepped = ramp(frame, stepAt, 0.5 * fps);
  // Um pé de cada vez: o de trás sai primeiro, e cada um se ergue no caminho.
  const lift = (from: number) => 6 * Math.sin(Math.PI * ramp(frame, from, 0.28 * fps));
  const back = mixPose(LET_GO, WATCHING, stepped);
  const acting: VigiliaPose = {
    ...back,
    nearHand: [mix(back.nearHand[0], 20 + 6 * rub, dusting), mix(back.nearHand[1], -50 - 5 * rub, dusting)],
    farHand: [mix(back.farHand[0], 30 - 6 * rub, dusting), mix(back.farHand[1], -52 + 5 * rub, dusting)],
    nearAnkle: [mix(LET_GO.nearAnkle[0], WATCHING.nearAnkle[0], ramp(frame, stepAt, 0.28 * fps)), -6.2 - lift(stepAt)],
    farAnkle: [
      mix(LET_GO.farAnkle[0], WATCHING.farAnkle[0], ramp(frame, stepAt + 0.22 * fps, 0.28 * fps)),
      -6.2 - lift(stepAt + 0.22 * fps),
    ],
    // O aceno: duas descidas pequenas da cabeça, que morrem.
    nod: back.nod + Math.abs(shake(frame, nodAt, 0.9 * fps, 0.45, 1)),
  };
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      {/* O mesmo palco da alavanca, agora de mais longe: a câmera recua. */}
      <Push focus={[1200, 640]} from={1.08} to={1}>
        <Svg>
          <Globe {...STAGE.earth} spin={frame / fps / TURN_SECONDS} />
          <LeverStation
            {...STAGE.lever}
            on={1}
            hands={1 - released}
            rest={alive(acting, frame / fps, "still-spinning")}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

const EARTH = { cx: 960, cy: 540, r: 350 } as const;
// Onde a casinha está no fim do plano, em unidades de raio 100: a leste do meio, ainda de frente.
// De onde ela parte sai da conta, porque ela vai com o chão dela (`HOME_LAND`) e o tempo do plano é o da fala.
const HOME_TO = 62;
// A noite é a fatia de oeste do disco, e o Sol fica a leste: quem é levado para leste sai do
// escuro e amanhece, e a casinha termina o plano (e o vídeo) no claro. A linha entre os dois
// lados é a meia elipse desta largura, em unidades de raio 100.
const NIGHT_WIDTH = 30;
const NIGHT = `M0,${-EARTH.r} A${EARTH.r},${EARTH.r} 0 0 0 0,${EARTH.r} A${(NIGHT_WIDTH * EARTH.r) / 100},${EARTH.r} 0 0 1 0,${-EARTH.r} Z`;
// Onde a linha passa na altura da casinha.
const DAWN = -NIGHT_WIDTH * 0.95;

type Props = {
  /** O quadro em que cada coisa acontece: o mar acende, a noite aparece com a casinha nela, a casinha cruza a linha, o embalo, a velocidade. */
  readonly at: readonly [number, number, number, number, number];
};

/** O que a rotação faz, de volta: o mar na cintura, o dia e a noite se alternando, e a casinha correndo para leste. */
const WhatItDoes: React.FC<Props> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // O globo gira num passo só, amarrado à fala: o chão da casinha está na linha do dia e da noite
  // quando a fala passa de um para a outra, e no lugar dele no fim do plano.
  const turned = (frame - at[2]) / Math.max(1, length - at[2]);
  const spin = mix(spinFor(DAWN), spinFor(HOME_TO), turned);
  // A casinha vai com o chão: presa à mancha de terra dela.
  const spot = landPoint(EARTH.r, spin);
  const house = { x: EARTH.cx + spot.x, y: EARTH.cy + spot.y };
  const going = popOpacity(frame, at[3] + 0.2 * fps, 0.3 * fps);
  const night = ramp(frame, at[1] - 0.2 * fps, 0.4 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.9, 0.1]} />}>
      {/* Chega de mais perto e assenta na Terra inteira. */}
      <Push focus={[EARTH.cx, EARTH.cy]} from={1.22} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Push focus={[EARTH.cx, EARTH.cy]} to={1.04}>
          <Svg>
            {/* A sombra de volume do disco dá lugar à noite: as duas juntas liam como duas linhas. */}
            <Globe {...EARTH} spin={spin} lightFrom={1} shade={0.32 * (1 - night)} />
            <LatitudeRing
              {...EARTH}
              lat={0}
              color={earth.waterLight}
              width={26}
              opacity={0.9 * popOpacity(frame, at[0], 0.4 * fps)}
            />
            <g opacity={popOpacity(frame, at[1], 0.3 * fps)}>
              <House
                {...house}
                size={86 * popScale(frame, at[1], 0.3 * fps)}
                rotate={(spot.x / EARTH.r) * 70}
              />
            </g>
            {/* A noite por cima do mar e da casinha: ela escurece enquanto está nela e acende ao cruzar a linha. */}
            <path
              d={NIGHT}
              transform={`translate(${EARTH.cx} ${EARTH.cy})`}
              fill={space.sky[0]}
              opacity={0.7 * night}
            />
            {/* A seta do embalo, à frente da casinha, para leste. */}
            <Arrow
              from={[house.x + 56, house.y - 34]}
              to={[house.x + 150, house.y - 34]}
              drawn={ramp(frame, at[3] + 0.2 * fps, 0.4 * fps)}
              opacity={going}
            />
          </Svg>
        </Push>
      </Push>
      <Place x={1490} y={900}>
        <Pop at={at[4]}>
          <Tag on="dark">mais de 1.000 km/h</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

export const StillSpinningScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const from = shots[1].from;
  return (
    <>
      <Shot range={shots[0]} name="ela tira as mãos da alavanca">
        <HandsOff releaseAt={cue(scene, "continuar")} />
      </Shot>
      <Shot range={shots[1]} name="o que o giro faz">
        <WhatItDoes
          at={[
            cue(scene, "mar") - from,
            // Em "alterna", e não em "dia": com a fala real, "dia" cai meio segundo antes de "noite", e a
            // casinha aparecia já em cima da linha, sem tempo de ser vista no escuro.
            cue(scene, "alterna") - from,
            cue(scene, "noite") - from,
            cue(scene, "leva") - from,
            cue(scene, "mais") - from,
          ]}
        />
      </Shot>
    </>
  );
};
