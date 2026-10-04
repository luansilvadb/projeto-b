import { useCurrentFrame, useVideoConfig } from "remotion";
import { Earth } from "../../../art/Earth";
import { Cast } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, sound } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { CUT_POINTS, LifeTree } from "../parts/LifeTree";
import { cue, linear, mix, ramp } from "../../../components/timing";
import { VACANT_HEIGHT, VacantSign } from "../parts/VacantSign";

const TREE = { x: 960, y: 1010, width: 1200 };
const TREE_HEIGHT = TREE.width * 0.72;
/** Onde a tesoura corta cada ramo caro, em pixels do quadro. */
const CUTS = CUT_POINTS.map(
  ([x, y]) =>
    [
      TREE.x - TREE.width / 2 + TREE.width * x,
      TREE.y - TREE_HEIGHT + TREE_HEIGHT * y,
    ] as const,
);
const SNIP_SECONDS = 0.25;

type ScissorsProps = {
  readonly x: number;
  readonly y: number;
  /** Abertura das lâminas, de 0 (fechada) a 1. */
  readonly open: number;
};

/** A tesoura: dois anéis e duas lâminas que se cruzam. */
const Scissors: React.FC<ScissorsProps> = ({ x, y, open }) => (
  <SvgLayer>
    <g transform={`translate(${x} ${y}) rotate(-90) scale(1.5)`}>
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * (6 + 22 * open)})`}>
          <path d="M-8,0 L8,0 L3,-170 L-3,-170 Z" fill={ink.dark} />
          <circle
            cx={side * 30}
            cy={60}
            r={36}
            fill="none"
            stroke={ink.tag}
            strokeWidth={18}
          />
        </g>
      ))}
      <circle r={12} fill={ink.paper} />
    </g>
  </SvgLayer>
);

type PruningShotProps = {
  /** Quadros do plano em que a tesoura corta o primeiro e o segundo ramo. */
  readonly cutAt: readonly [number, number];
};

/** A evolução poda o que custa caro: a tesoura corta o chifre grande demais e a cauda a mais. */
const PruningShot: React.FC<PruningShotProps> = ({ cutAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snip = SNIP_SECONDS * fps;
  const travel = ramp(frame, cutAt[0] + snip, cutAt[1] - cutAt[0] - 2 * snip);
  // A tesoura fecha em cada corte e reabre no caminho até o seguinte.
  const open =
    1 -
    ramp(frame, cutAt[0] - snip, snip) +
    ramp(frame, cutAt[0] + snip, snip) -
    ramp(frame, cutAt[1] - snip, snip);

  return (
    <SlowPush
      focus={[960, 640]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.45]} />}
    >
      <Place x={TREE.x} y={TREE.y} anchor="bottom">
        <LifeTree
          width={TREE.width}
          color={idea.lilac.contact}
          bud={ink.tag}
          eye={ink.dark}
          cut={[
            ramp(frame, cutAt[0], 0.7 * fps),
            ramp(frame, cutAt[1], 0.7 * fps),
          ]}
        />
      </Place>
      <Scissors
        x={mix(CUTS[0][0], CUTS[1][0], travel)}
        // No caminho de um ramo ao outro ela passa por baixo da copa.
        y={
          mix(CUTS[0][1], CUTS[1][1], travel) + 150 * Math.sin(Math.PI * travel)
        }
        open={open}
      />
      {CUTS.map(([x, y], index) => (
        <Place key={index} x={x + 190} y={y - 150}>
          <Onomatopoeia
            at={cutAt[index]}
            size={100}
            color={sound.hot}
            edge={sound.edge}
          >
            SNIP
          </Onomatopoeia>
        </Place>
      ))}
      <Grain />
    </SlowPush>
  );
};

const GLOBE = { x: 620, y: 540, radius: 330 };
const SIGN = { x: 1430, y: 880 };
const LENS = 120;

type MagnifierProps = {
  readonly x: number;
  readonly y: number;
};

/** A lupa de quem procura: o aro, o vidro e o cabo. */
const Magnifier: React.FC<MagnifierProps> = ({ x, y }) => (
  <SvgLayer>
    <line
      x1={x + LENS * 0.7}
      y1={y + LENS * 0.7}
      x2={x + LENS * 1.9}
      y2={y + LENS * 1.9}
      stroke={ink.dark}
      strokeWidth={34}
      strokeLinecap="round"
    />
    <circle cx={x} cy={y} r={LENS} fill={ink.ring} opacity={0.3} />
    <circle
      cx={x}
      cy={y}
      r={LENS}
      fill="none"
      stroke={ink.dark}
      strokeWidth={22}
    />
  </SvgLayer>
);

/** O planeta gira sob a lupa que procura quem vive sem dormir; ao lado, o lugar dele, vazio. */
const SearchShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 540]}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.32, 0.5]} />}
    >
      <Place x={GLOBE.x} y={GLOBE.y}>
        <Earth
          radius={GLOBE.radius}
          spin={0.6 * linear(frame, 0, durationInFrames)}
        />
      </Place>
      <Magnifier
        x={GLOBE.x + 170 * wave(seconds, 3.1)}
        y={GLOBE.y + 130 * wave(seconds, 2.3, 0.25)}
      />
      <VacantSign x={SIGN.x} y={SIGN.y} scale={1.25} />
      <Grain />
    </SlowPush>
  );
};

const CLOSE_SIGN = { x: 960, y: 990, scale: 1.5 };
// O centro do lugar vazio, sobre o pedestal, já na escala do close.
const EMPTY_SLOT = [
  CLOSE_SIGN.x,
  CLOSE_SIGN.y - (VACANT_HEIGHT - 174) * CLOSE_SIGN.scale,
] as const;

/** A lupa para sobre o lugar vazio: ninguém. */
const NobodyShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrive = ramp(frame, 0, 0.7 * fps);

  return (
    <SlowPush
      focus={[EMPTY_SLOT[0], EMPTY_SLOT[1]]}
      by={0.08}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.45]} />}
    >
      {/* O fundo fica: a cena seguinte usa o mesmo. Saem a lupa, por onde veio, e depois a placa. */}
      <Cast order={1} origin={[CLOSE_SIGN.x, CLOSE_SIGN.y]} drift={[0, 160]}>
        <VacantSign
          x={CLOSE_SIGN.x}
          y={CLOSE_SIGN.y}
          scale={CLOSE_SIGN.scale}
        />
      </Cast>
      <Cast origin={EMPTY_SLOT} drift={[-520, -160]}>
        <Magnifier
          x={mix(EMPTY_SLOT[0] - 520, EMPTY_SLOT[0] + 40, arrive)}
          y={mix(EMPTY_SLOT[1] - 160, EMPTY_SLOT[1], arrive)}
        />
      </Cast>
      <Grain />
    </SlowPush>
  );
};

export const ShouldHaveScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a evolução poda o que custa caro">
      <PruningShot cutAt={[cue(scene, "impiedosa"), cue(scene, "caros")]} />
    </Shot>
    <Shot range={shots[1]} name="a busca pelo planeta">
      <SearchShot />
    </Shot>
    <Shot range={shots[2]} name="o lugar continua vazio">
      <NobodyShot />
    </Shot>
  </>
);
