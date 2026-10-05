import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Magnifier } from "../parts/Search";
import { FRONT, FRONT_OPENING, ShopFront } from "../parts/ShopFront";
import { Crate } from "../parts/ShopInside";

// A loja de longe: a câmera recua com a calçada presa à base do quadro.
const FAR = framing([960, 1080], 0.78, [960, 1080]);
// Onde a porta de enrolar cai no quadro, com a câmera recuada.
const DOOR = {
  x: FRONT.x,
  y: 1080 + (FRONT_OPENING.y + FRONT_OPENING.height / 2 - 1080) * FAR.zoom,
};

/** A loja de porta baixada, de longe, com a lupa sobre ela: o que acontece lá dentro ainda se estuda. */
const StudiedShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <ShopFront time="night" shutter={1} busy camera={FAR} />
      {/* A lupa do gancho, que vai e vem sobre a porta. */}
      <Magnifier
        x={DOOR.x - 20 + 110 * wave(seconds, 3.1)}
        y={DOOR.y - 10 + 50 * wave(seconds, 2.3, 0.25)}
        size={170}
      />
    </AbsoluteFill>
  );
};

// Da cintura para cima, à esquerda; o que ela lembra, num balão, à direita.
const YOU = { x: 700, y: 1330, height: 1100 };
const THOUGHT = { x: 1400, y: 360, size: 430 };
// As bolhas que ligam a cabeça ao balão: o centro e o raio de cada uma.
const TRAIL = [
  [1010, 520, 26],
  [1090, 470, 38],
] as const;

type RecallShotProps = {
  /** Quadros do plano em que ela abre os olhos e em que a lembrança aparece. */
  readonly wakeAt: number;
  readonly recallAt: number;
};

/** A pessoa acorda e reconhece o rosto da etiqueta de uma das caixas. */
const RecallShot: React.FC<RecallShotProps> = ({ wakeAt, recallAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.4, 0.5]} />
      <Place
        x={YOU.x}
        y={YOU.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Person
          height={YOU.height}
          colors={personInPajamas}
          expression={
            frame >= recallAt
              ? "curious"
              : frame >= wakeAt
                ? "sleepy"
                : "asleep"
          }
          blink={frame >= recallAt ? blink(seconds, "you") : 0}
        />
      </Place>
      <SvgLayer>
        {TRAIL.map(([x, y, radius], index) =>
          frame >= recallAt + index * 2 ? (
            <circle key={x} cx={x} cy={y} r={radius} fill={ink.ring} />
          ) : null,
        )}
      </SvgLayer>
      {/* O que ela lembra ao acordar: a caixa do depósito, com o rosto na etiqueta. */}
      <Place x={THOUGHT.x} y={THOUGHT.y}>
        <Pop at={recallAt + 4}>
          <svg
            width={THOUGHT.size}
            height={THOUGHT.size}
            viewBox="-100 -100 200 200"
          >
            <circle r={100} fill={ink.ring} />
            <Crate x={0} y={56} scale={1.15} memory="face" />
          </svg>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const StockroomSolidScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a loja de longe, sob a lupa">
      <StudiedShot />
    </Shot>
    <Shot range={shots[1]} name="ela acorda e reconhece o rosto">
      <RecallShot
        wakeAt={cue(scene, "dormir") - shots[1].from}
        recallAt={cue(scene, "guardar") - shots[1].from}
      />
    </Shot>
  </>
);
