import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Build, Camera, framing, Layer } from "../../../components/Camera";
import {
  FlatStage,
  StageContext,
  Stay,
  Troupe,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  settle,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, sound } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { CUT_POINTS, LifeTree } from "../parts/LifeTree";
import { Search, SEARCH_PUSH } from "../parts/Search";
import { SeaFloor, Timeline } from "../parts/Timeline";
import {
  chalkTreeAtHandover,
  PRUNED_TREE,
  ShotPush,
  treeMorphed,
  treeTones,
} from "./BiggestMistakeScene";

const TREE = PRUNED_TREE;
const TREE_HEIGHT = TREE.width * 0.72;
// Onde a tesoura corta o ramo do chifre, em pixels do quadro.
const CUT = [
  TREE.x - TREE.width / 2 + TREE.width * CUT_POINTS[0][0],
  TREE.y - TREE_HEIGHT + TREE_HEIGHT * CUT_POINTS[0][1],
] as const;
// A tesoura para com o pino aqui, ao lado do ramo; vem de fora do quadro, pela esquerda.
const SCISSORS = {
  at: [CUT[0] + 120, CUT[1] + 70],
  from: [-260, CUT[1] + 330],
} as const;
const ENTER_SECONDS = 0.5;
const OPEN_FRAMES = 8;
// O corte: as lâminas abrem um pouco mais (o aviso), fecham em dois quadros e voltam a abrir a meio.
const WINDUP_FRAMES = 7;
const SNAP_FRAMES = 2;
const REOPEN = { after: 7, frames: 8, to: 0.7 };
// O galho cortado cai até sair do quadro, ganhando velocidade: em quadros, e em unidades do desenho da árvore.
const FALL = { frames: 20, to: 720 };
// O ramo do chifre não existe na árvore de giz: cresce da forquilha quando ela chega ao fundo lilás.
const ANTLER = { at: 4, frames: 12 };
// A aproximação lenta do plano, e em quantos quadros o fundo lilás toma a cor
// dele: mais depressa que o de sempre, porque a árvore troca o giz pelas
// cores do fundo novo no mesmo tempo.
const PRUNING_FOCUS = [900, 640] as const;
const PRUNING_PUSH = 0.06;
const BACKDROP_FRAMES = 14;
// A poda termina em cima da troca de plano: a tesoura, o "SNIP" e a árvore
// continuam por cima do fundo do mar e só então saem, um depois do outro,
// encolhendo cada um no próprio ponto. Em quadros do plano seguinte.
const LEFTOVER = {
  snip: [0, 9],
  scissors: [3, 12],
  tree: [5, 15],
  until: 16,
} as const;

/** Adianta a entrada no palco de quem está dentro, em quadros, e apressa o fundo: ele toma a cor em `backdrop` quadros. */
const Sooner: React.FC<{
  by?: number;
  backdrop?: number;
  children: React.ReactNode;
}> = ({ by = 0, backdrop, children }) => {
  const stage = useStage();
  const sooner = useMemo(
    () => ({
      ...stage,
      // Sem argumentos, quem pergunta é o fundo do plano; com eles, o elenco.
      enter: (delay?: number, frames?: number) =>
        delay === undefined && frames === undefined
          ? stage.enter(0, backdrop)
          : stage.enter(Math.max(0, (delay ?? 0) - by), frames),
    }),
    [stage, by, backdrop],
  );
  return (
    <StageContext.Provider value={sooner}>{children}</StageContext.Provider>
  );
};

type ScissorsProps = {
  readonly x: number;
  readonly y: number;
  /** Abertura das lâminas, de 0 (fechada) a 1. */
  readonly open: number;
  /** O tamanho, em fração do desenho: é por onde ela sai do palco. */
  readonly scale?: number;
};

/** A tesoura: duas lâminas que se cruzam no pino, cada uma com o cabo e o anel do outro lado. */
const Scissors: React.FC<ScissorsProps> = ({ x, y, open, scale = 1 }) => (
  <SvgLayer>
    <g transform={`translate(${x} ${y}) rotate(-62) scale(${1.7 * scale})`}>
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

type Pruning = {
  /** Quadros do plano da poda em que a tesoura entra e em que corta o ramo do chifre. */
  readonly enterAt: number;
  readonly cutAt: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Quanto alguém já saiu do palco, de 0 a 1, entre dois quadros: acelera para fora, como toda saída do elenco. */
const gone = (frame: number, [from, to]: readonly [number, number]): number =>
  interpolate(frame, [from, to], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

type PrunedProps = Pruning & {
  /** O quadro do plano da poda que se desenha: o plano seguinte continua a contagem depois do fim dele. */
  readonly at: number;
  /** Quanto o "SNIP", a tesoura e a árvore já saíram do palco, de 0 a 1 cada um. */
  readonly left?: readonly [number, number, number];
};

/**
 * A poda, num quadro dela: a árvore (que chega do quadro-negro trocando o giz
 * pelas cores do fundo lilás), a tesoura e o "SNIP". Quem a desenha é o plano
 * da poda e, nos primeiros quadros dele, o plano seguinte.
 */
const Pruned: React.FC<PrunedProps> = ({
  at,
  enterAt,
  cutAt,
  left = [0, 0, 0],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = at / fps;
  // A árvore vem de onde o quadro-negro a deixou.
  const morphed = treeMorphed(at);
  const from = chalkTreeAtHandover();
  // A tesoura vem de fora, pela esquerda, com peso, e para ao lado do ramo que pesa.
  const arrived = ramp(at, enterAt, ENTER_SECONDS * fps);
  // Chegando, as lâminas abrem; esperando, abrem e fecham um pouco, como quem
  // mede o corte; no corte, abrem mais e fecham de uma vez.
  const opened = settle(at, enterAt + ENTER_SECONDS * fps - 3, OPEN_FRAMES);
  const windup = ramp(at, cutAt - WINDUP_FRAMES - 1, WINDUP_FRAMES);
  const shut = linear(at, cutAt - 1, SNAP_FRAMES);
  const open =
    (opened * (1 + 0.14 * wave(seconds, 1.3)) + 0.3 * windup) * (1 - shut) +
    REOPEN.to * ramp(at, cutAt + REOPEN.after, REOPEN.frames);
  // Parada, a tesoura paira; a árvore balança um nada, do pé.
  const hover = arrived * (1 - left[1]);

  return (
    <>
      <Place
        x={mix(from.x, TREE.x, morphed)}
        y={mix(from.y, TREE.y, morphed)}
        anchor="bottom"
        style={{
          scale: `${1 - left[2]}`,
          rotate: `${0.5 * morphed * wave(seconds, 4.1, 0.3)}deg`,
        }}
      >
        <LifeTree
          width={mix(from.width, TREE.width, morphed)}
          {...treeTones(at, TREE)}
          costly={ramp(at, ANTLER.at, ANTLER.frames)}
          // Só o ramo do chifre: o outro ramo caro do desenho fica fora deste plano.
          cut={[drop(at, cutAt + 1, FALL.frames), 1]}
          dropTo={FALL.to}
        />
      </Place>
      <Scissors
        x={
          mix(SCISSORS.from[0], SCISSORS.at[0], arrived) +
          5 * hover * wave(seconds, 2.9)
        }
        y={
          mix(SCISSORS.from[1], SCISSORS.at[1], arrived) +
          7 * hover * wave(seconds, 2.3, 0.4)
        }
        open={open}
        scale={1 - left[1]}
      />
      <Place
        x={CUT[0] - 40}
        y={CUT[1] + 190}
        style={{ scale: `${1 - left[0]}` }}
      >
        <Onomatopoeia
          // O relógio aqui é o de quem desenha: no plano seguinte, o som já aconteceu.
          at={cutAt - (at - frame)}
          size={110}
          color={sound.hot}
          edge={sound.edge}
        >
          SNIP
        </Onomatopoeia>
      </Place>
    </>
  );
};

/** A evolução corrige o que pesa: a tesoura chega à árvore e corta o ramo do chifre grande demais. */
const PruningShot: React.FC<Pruning> = (pruning) => {
  const frame = useCurrentFrame();
  const stage = useStage();

  return (
    <Sooner backdrop={BACKDROP_FRAMES}>
      <ShotPush
        focus={PRUNING_FOCUS}
        by={PRUNING_PUSH}
        backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.45]} />}
      >
        {/*
          Nada daqui entra nem sai pela marcação do palco: a árvore já estava
          no quadro-negro e vem de lá, a tesoura entra por conta própria, e o
          corte termina em cima da troca. Quando o plano seguinte chega, é
          ele quem desenha o que ainda está no palco.
        */}
        {stage.handedOver ? null : (
          <Stay>
            <Pruned at={frame} {...pruning} />
          </Stay>
        )}
        <Grain />
      </ShotPush>
    </Sooner>
  );
};

// A linha começa a correr logo depois de a marca do sono acender, e corre com peso.
const LINE_AFTER_PIN_FRAMES = 4;
// A ponta da seta cresce com o primeiro trecho da linha, em vez de esperar parada por ela.
const ARROW_GROWS_OVER = 0.04;
const LINE_SECONDS = 1.5;
// A deriva lenta do plano: a câmera vai um pouco mais para perto, na direção para onde a linha corre.
const SEA_DRIFT = { by: 0.045, focus: [1180, 640] } as const;
// A marca do sono acende na palavra: o palco não a segura meio segundo.
const TIMELINE_SOONER = 14;

type TimelineShotProps = {
  /** Quadros do plano em que a marca do sono e a etiqueta dos anos entram. */
  readonly sleepAt: number;
  readonly yearsAt: number;
  /** A poda do plano anterior, que termina sobre o começo deste, e quantos quadros ele durou. */
  readonly pruning: Pruning;
  readonly pruningFrames: number;
};

/** No fundo do mar, a marca do sono acende e a linha do tempo corre dela até hoje. */
const TimelineShot: React.FC<TimelineShotProps> = ({
  sleepAt,
  yearsAt,
  pruning,
  pruningFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const lineAt = sleepAt + LINE_AFTER_PIN_FRAMES;
  const drawn = ramp(frame, lineAt, LINE_SECONDS * fps);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transformOrigin: `${SEA_DRIFT.focus[0]}px ${SEA_DRIFT.focus[1]}px`,
          scale: `${1 + (SEA_DRIFT.by * frame) / length}`,
        }}
      >
        {/* O fundo do mar é o fundo do plano: toma a cor dele sobre o anterior. A linha é elenco. */}
        <Sooner by={TIMELINE_SOONER}>
          <FlatStage
            backdrop={
              <Troupe cast={false}>
                <SeaFloor shimmer />
              </Troupe>
            }
          >
            <Timeline
              floor={false}
              eased
              alive
              arrow={Math.min(1, drawn / ARROW_GROWS_OVER)}
              drawn={drawn}
              sleepAt={sleepAt}
              yearsAt={yearsAt}
            />
          </FlatStage>
        </Sooner>
      </AbsoluteFill>
      {/*
        O que a poda deixou no palco: a árvore sem o galho, a tesoura e o
        "SNIP", do tamanho em que a aproximação lenta daquele plano os deixou.
      */}
      {frame >= LEFTOVER.until ? null : (
        <Stay>
          <AbsoluteFill
            style={{
              transformOrigin: `${PRUNING_FOCUS[0]}px ${PRUNING_FOCUS[1]}px`,
              scale: `${1 + PRUNING_PUSH}`,
            }}
          >
            <Pruned
              at={pruningFrames + frame}
              {...pruning}
              left={[
                gone(frame, LEFTOVER.snip),
                gone(frame, LEFTOVER.scissors),
                gone(frame, LEFTOVER.tree),
              ]}
            />
          </AbsoluteFill>
        </Stay>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

const CENTER = [960, 540] as const;
const LIGHT_SECONDS = 0.8;
// O globo e o pedestal já estão no lugar quando "Bastava" soa.
const SEARCH_SOONER = 14;

type SearchShotProps = {
  /** Quadro do plano em que o foco de luz acende sobre o pedestal. */
  readonly lightAt: number;
  /** Quadro do plano em que a placa do pedestal estoura. */
  readonly plaqueAt: number;
};

/** O globo gira sob a lupa que procura; ao lado, o pedestal espera por um dono. */
const SearchShot: React.FC<SearchShotProps> = ({ lightAt, plaqueAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // No fim destes quadros, a procura passa ao plano de perto.
  const frames = useShotLength();
  return (
    <AbsoluteFill>
      <Sooner by={SEARCH_SOONER}>
        <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.32, 0.5]} />}>
          <Build>
            {/*
              A aproximação lenta, com o fim marcado: quando o plano de perto
              chega, a câmera está em `SEARCH_PUSH`, e ele parte dali.
            */}
            <Camera
              {...framing(CENTER, 1 + (SEARCH_PUSH * frame) / frames, CENTER)}
            >
              <Layer depth={1}>
                <Troupe>
                  <Search
                    light={ramp(frame, lightAt, LIGHT_SECONDS * fps)}
                    plaqueAt={plaqueAt}
                    handoverAt={frames}
                  />
                </Troupe>
              </Layer>
            </Camera>
          </Build>
        </FlatStage>
      </Sooner>
      <Grain />
    </AbsoluteFill>
  );
};

export const TimeToFixScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const pruning: Pruning = {
    enterAt: cue(scene, "evolução"),
    cutAt: cue(scene, "corrigir"),
  };
  return (
    <>
      <Shot range={shots[0]} name="a tesoura corta o ramo que pesa">
        <PruningShot {...pruning} />
      </Shot>
      <Shot range={shots[1]} name="mais de 500 milhões de anos">
        <TimelineShot
          sleepAt={cue(scene, "sono") - shots[1].from}
          yearsAt={cue(scene, "quinhentos") - shots[1].from}
          pruning={pruning}
          pruningFrames={shots[0].to - shots[0].from}
        />
      </Shot>
      <Shot range={shots[2]} name="a procura pelo planeta">
        <SearchShot
          lightAt={cue(scene, "animal") - shots[2].from}
          plaqueAt={cue(scene, "viver") - shots[2].from}
        />
      </Shot>
    </>
  );
};
