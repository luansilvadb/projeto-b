import { Tag } from "../parts/Tag";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Calendar } from "../parts/Calendar";
import { BENCH_Y, LAB, LabWall } from "../parts/Laboratory";
import { RATS, RatDiscs, type RatState } from "../parts/RatDiscs";
import { cue, linear } from "../../../components/timing";
import { Lab } from "./FloorTestScene";
import { Bench } from "./RatsQuestionScene";

/** Altura do tampo dos discos: a calha fica pousada na bancada. */
export const DISCS_Y = BENCH_Y - 140;
/** Os ratos de perto, com a parede livre em cima para o calendário. */
export const RATS_MEDIUM = framing([960, 560], 1.12, [960, 600]);
// O experimento durou de 11 a 32 dias: o primeiro e o último rato a sair dele.
const FIRST_DAY = 11;
const LAST_DAY = 32;

/** O rato de cada disco sai do experimento num dia entre o primeiro e o último. */
const lastDayOf = (index: number) =>
  FIRST_DAY + ((LAST_DAY - FIRST_DAY) * index) / (RATS - 1);

type DiscsShotProps = {
  /** Quadro do plano em que o selo do experimento entra. */
  readonly yearAt: number;
};

/** Dez ratos em fila, cada um sobre um disco que gira sobre a água. */
const DiscsShot: React.FC<DiscsShotProps> = ({ yearAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Lab
        camera={cameraBetween(
          LAB.medium,
          RATS_MEDIUM,
          0.4 * (frame / durationInFrames),
        )}
      >
        <LabWall />
        <Bench />
        <RatDiscs y={DISCS_Y} state={() => "awake"} seconds={frame / fps} />
      </Lab>
      <Place x={960} y={400}>
        <Pop at={yearAt}>
          <Tag size="note" on="mint">
            ratos, 1989
          </Tag>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

type DeclineShotProps = {
  /** Quadros do plano em que o calendário começa a encher e em que chega ao último dia. */
  readonly countAt: number;
  readonly doneAt: number;
};

/** O calendário enche; entre o dia 11 e o dia 32 os ratos viram silhuetas, um a um. */
const DeclineShot: React.FC<DeclineShotProps> = ({ countAt, doneAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const day = LAST_DAY * linear(frame, countAt, doneAt - countAt);
  const state = (index: number): RatState =>
    day >= lastDayOf(index) ? "gone" : "awake";

  return (
    <AbsoluteFill>
      <Lab camera={RATS_MEDIUM}>
        <LabWall />
        <Bench />
        <RatDiscs y={DISCS_Y} state={state} seconds={frame / fps} />
      </Lab>
      <Calendar
        x={960}
        y={330}
        days={LAST_DAY}
        filled={day}
        label="de 11 a 32 dias"
        labelAt={doneAt}
      />
    </AbsoluteFill>
  );
};

export const RatsAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dez ratos acordados sem parar">
      <DiscsShot yearAt={cue(scene, "oitenta")} />
    </Shot>
    <Shot range={shots[1]} name="entre onze dias e um mês">
      <DeclineShot
        countAt={cue(scene, "morreram") - shots[1].from}
        doneAt={cue(scene, "depois") - shots[1].from}
      />
    </Shot>
  </>
);
