import { useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, sound } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { CUT_POINTS, LifeTree } from "../parts/LifeTree";
import { Search } from "../parts/Search";
import { Timeline } from "../parts/Timeline";

const TREE = { x: 1040, y: 1010, width: 1240 };
const TREE_HEIGHT = TREE.width * 0.72;
// Onde a tesoura corta o ramo do chifre, em pixels do quadro.
const CUT = [
  TREE.x - TREE.width / 2 + TREE.width * CUT_POINTS[0][0],
  TREE.y - TREE_HEIGHT + TREE_HEIGHT * CUT_POINTS[0][1],
] as const;
const SNIP_SECONDS = 0.25;

type ScissorsProps = {
  readonly x: number;
  readonly y: number;
  /** Abertura das lâminas, de 0 (fechada) a 1. */
  readonly open: number;
};

/** A tesoura: duas lâminas que se cruzam no pino, cada uma com o cabo e o anel do outro lado. */
const Scissors: React.FC<ScissorsProps> = ({ x, y, open }) => (
  <SvgLayer>
    <g transform={`translate(${x} ${y}) rotate(-62) scale(1.7)`}>
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * (5 + 20 * open)})`}>
          <path d="M-11,6 L11,6 L4,-170 L-3,-170 Z" fill={ink.dark} />
          <path
            d="M0,6 L11,6 L4,-170 L0,-170 Z"
            fill={ink.ring}
            opacity={0.25}
          />
          <path
            d={`M0,0 L${-side * 26},66`}
            stroke={ink.tag}
            strokeWidth={18}
            strokeLinecap="round"
          />
          <circle
            cx={-side * 40}
            cy={100}
            r={32}
            fill="none"
            stroke={ink.tag}
            strokeWidth={16}
          />
        </g>
      ))}
      <circle r={11} fill={ink.paper} />
    </g>
  </SvgLayer>
);

type PruningShotProps = {
  /** Quadro do plano em que a tesoura corta o ramo do chifre. */
  readonly cutAt: number;
};

/** A evolução corrige o que pesa: a tesoura percorre a árvore e corta o ramo do chifre grande demais. */
const PruningShot: React.FC<PruningShotProps> = ({ cutAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snip = SNIP_SECONDS * fps;
  // A tesoura vem da copa, por baixo dos ramos, até o ramo que pesa.
  const arrived = settle(frame, 0, Math.max(6, cutAt - snip));
  const open =
    1 - ramp(frame, cutAt - snip, snip) + ramp(frame, cutAt + snip, snip);

  return (
    <SlowPush
      focus={[900, 640]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.45]} />}
    >
      <Place x={TREE.x} y={TREE.y} anchor="bottom">
        <LifeTree
          width={TREE.width}
          color={idea.lilac.contact}
          bud={ink.tag}
          eye={ink.dark}
          // Só o ramo do chifre: o outro ramo caro do desenho fica fora deste plano.
          cut={[ramp(frame, cutAt, fps), 1]}
        />
      </Place>
      <Scissors
        x={mix(CUT[0] + 600, CUT[0] + 120, arrived)}
        y={mix(CUT[1] + 300, CUT[1] + 70, arrived)}
        open={open}
      />
      <Place x={CUT[0] - 40} y={CUT[1] + 190}>
        <Onomatopoeia at={cutAt} size={110} color={sound.hot} edge={sound.edge}>
          SNIP
        </Onomatopoeia>
      </Place>
      <Grain />
    </SlowPush>
  );
};

type TimelineShotProps = {
  /** Quadros do plano em que a marca do sono e a etiqueta dos anos entram. */
  readonly sleepAt: number;
  readonly yearsAt: number;
};

/** A linha do tempo sobe do fundo do mar: o sono está nela desde o começo. */
const TimelineShot: React.FC<TimelineShotProps> = ({ sleepAt, yearsAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Timeline
        risen={settle(frame, 0, 0.6 * fps)}
        drawn={ramp(frame, 0.2 * fps, 1.2 * fps)}
        sleepAt={sleepAt}
        yearsAt={yearsAt}
      />
      <Grain />
    </>
  );
};

/** O globo gira sob a lupa que procura; ao lado, o pedestal espera por um dono. */
const SearchShot: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <SlowPush
      focus={[960, 540]}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.32, 0.5]} />}
    >
      <Search signAt={0.3 * fps} />
      <Grain />
    </SlowPush>
  );
};

export const TimeToFixScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a tesoura corta o ramo que pesa">
      <PruningShot cutAt={cue(scene, "corrigir") - 6} />
    </Shot>
    <Shot range={shots[1]} name="mais de 500 milhões de anos">
      <TimelineShot
        sleepAt={cue(scene, "sono") - shots[1].from}
        yearsAt={cue(scene, "quinhentos") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="a procura pelo planeta">
      <SearchShot />
    </Shot>
  </>
);
