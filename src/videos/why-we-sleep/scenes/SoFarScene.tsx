import { useCurrentFrame, useVideoConfig } from "remotion";
import { Build, framing } from "../../../components/Camera";
import { Stay, useStage } from "../../../components/Cast";
import { Grain, WithoutGrain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { HEIGHT, WIDTH } from "../../../format";
import { markFor } from "../../../video/stage";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { LabWall } from "../parts/Laboratory";
import { LURK, Lurker, PREY, Prey } from "../parts/Prey";
import { RatDiscs } from "../parts/RatDiscs";
import { cue, ramp } from "../../../components/timing";
import { SavannaShot } from "./ElephantsScene";
import { Lab } from "./FloorTestScene";
import { ZeroShot } from "./NoneZeroedScene";
import { DISCS_Y, RATS_MEDIUM } from "./RatsAwakeScene";
import { Bench } from "./RatsQuestionScene";

// Quanto o papel da moldura vazia aparece sobre o fundo, e em quantos quadros a lembrança a enche.
const EMPTY_PANEL_OPACITY = 0.45;
const FILL_FRAMES = 8;
const PANEL = { width: 500, height: 640, y: 540, border: 12 };
export const PANEL_X = [350, 960, 1570] as const;
const DANGER = framing([(PREY.x + LURK.x) / 2, PREY.y - 170], 1.1);

type PanelProps = {
  readonly x: number;
  /** Quadro do plano em que o quadro entra. */
  readonly at: number;
  /**
   * Quadro do plano em que a lembrança aparece dentro da moldura. Sem valor,
   * a moldura já entra cheia. Com ele, entra vazia e espera a fala.
   */
  readonly fillAt?: number;
  /** O ponto do plano original que fica no meio do quadro, na horizontal. */
  readonly focus?: number;
  /** O centro do quadro na vertical e o tamanho dele, quando não são os deste plano. */
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  /** Um plano inteiro do vídeo, que o quadro encolhe e recorta. */
  readonly children: React.ReactNode;
};

/** Um quadro de moldura clara com um plano já visto dentro: a lembrança de um capítulo. */
export const Panel: React.FC<PanelProps> = ({
  x,
  at,
  fillAt = at,
  focus = WIDTH / 2,
  y = PANEL.y,
  width = PANEL.width,
  height = PANEL.height,
  children,
}) => {
  const stage = useStage();
  const frame = useCurrentFrame();
  return (
    <Place x={x} y={y}>
      <Pop at={at}>
        <div
          style={{
            position: "relative",
            // O cartão sai do palco inteiro, encolhendo; o plano de dentro vai junto, parado.
            scale: `${1 - stage.leave(markFor("actor", x).leaveAt)}`,
            width,
            height,
            overflow: "hidden",
            borderRadius: 44,
            border: `${PANEL.border}px solid ${ink.paper}`,
          }}
        >
          {/* A moldura vazia: um papel claro, à espera da lembrança. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: ink.paper,
              opacity: EMPTY_PANEL_OPACITY,
            }}
          />
          <div
            style={{
              position: "absolute",
              // A lembrança enche a moldura de baixo para cima, sem fusão.
              clipPath: `inset(${(1 - ramp(frame, fillAt, FILL_FRAMES)) * 100}% 0 0 0)`,
              width: WIDTH,
              height: HEIGHT,
              left: width / 2 - (focus * height) / HEIGHT,
              scale: `${height / HEIGHT}`,
              transformOrigin: "0 0",
            }}
          >
            <WithoutGrain>
              <Stay>
                <Build>{children}</Build>
              </Stay>
            </WithoutGrain>
          </div>
        </div>
      </Pop>
    </Place>
  );
};

// As três molduras entram já no começo do plano, uma depois da outra, para o palco não ficar vazio.
const FRAME_STAGGER = 3;

type RecapShotProps = {
  /** Quadro do plano em que cada lembrança enche a moldura dela, na ordem da fala. */
  readonly at: readonly [number, number, number];
};

/** O que se sabe até aqui, em três quadros: dormir custa caro, ninguém parou, e quem é obrigado a parar adoece. */
const RecapShot: React.FC<RecapShotProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 540]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <Panel x={PANEL_X[0]} at={FRAME_STAGGER} fillAt={at[0]}>
        <SavannaShot camera={DANGER} daylight={0} orb={0.74}>
          <Lurker lit={1} seconds={seconds} />
          <Prey daylight={0} rest={1} asleep={1} seconds={seconds} />
        </SavannaShot>
      </Panel>
      <Panel x={PANEL_X[1]} at={2 * FRAME_STAGGER} fillAt={at[1]} focus={640}>
        <ZeroShot emptyAt={0} />
      </Panel>
      <Panel x={PANEL_X[2]} at={3 * FRAME_STAGGER} fillAt={at[2]}>
        <Lab camera={RATS_MEDIUM}>
          <LabWall />
          <Bench />
          <RatDiscs
            y={DISCS_Y}
            state={(index) => (index % 3 === 1 ? "awake" : "gone")}
            seconds={seconds}
          />
        </Lab>
      </Panel>
      <Grain />
    </SlowPush>
  );
};

export const SoFarScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="o que temos até aqui">
    <RecapShot
      at={[cue(scene, "custa"), cue(scene, "ninguém"), cue(scene, "obrigado")]}
    />
  </Shot>
);
