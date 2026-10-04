import { createContext, useContext, useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { CAST_ENTER_FRAMES, markFor, type Mark } from "../video/stage";

/**
 * O que um plano sabe do palco quando a cena dele o divide com a vizinha (ver
 * video/stage.ts). Quem preenche é o `Shot`; fora de um palco dividido, nada
 * entra nem sai: a cena abre pronta e termina em corte.
 */
export type Stage = {
  /** De 0 a 1, quanto do que chega já entrou; `delay` atrasa a entrada e `frames` diz quanto ela dura, em quadros. */
  readonly enter: (delay?: number, frames?: number) => number;
  /** De 0 a 1, quanto do que sai já saiu; `delay` atrasa a saída, em quadros. */
  readonly leave: (delay?: number) => number;
  /** Se a cena seguinte já chegou: o que as duas têm em comum passa a ser desenhado por ela. */
  readonly handedOver: boolean;
  /**
   * Se o que está aqui é elenco: cada `Place` e cada desenho cresce do próprio
   * ponto ao chegar e encolhe nele ao sair. Vale para tudo o que está solto
   * sobre o quadro; o que está dentro de uma camada de cenário não é elenco,
   * vai e vem com o chão.
   */
  readonly cast: boolean;
};

const OFFSTAGE: Stage = {
  enter: () => 1,
  leave: () => 0,
  handedOver: false,
  cast: false,
};

export const StageContext = createContext<Stage>(OFFSTAGE);

export const useStage = (): Stage => useContext(StageContext);

// Quanto a entrada passa do tamanho final antes de assentar, e em que ponto do caminho.
const OVERSHOOT = { scale: 1.06, at: 0.7 };

/**
 * A escala de um elemento do elenco na marcação dele: cresce com uma sobra ao
 * entrar e encolhe a zero ao sair. Fora de um palco dividido é sempre 1.
 */
export const castScale = (stage: Stage, mark: Mark): number => {
  const entered = stage.enter(mark.enterAt, CAST_ENTER_FRAMES);
  const popped =
    entered < OVERSHOOT.at
      ? (entered / OVERSHOOT.at) * OVERSHOOT.scale
      : OVERSHOOT.scale +
        ((entered - OVERSHOOT.at) / (1 - OVERSHOOT.at)) * (1 - OVERSHOOT.scale);
  return popped * (1 - stage.leave(mark.leaveAt));
};

type CastProps = {
  /** Quantos passos da cascata ele espera depois dos outros objetos de cena. */
  readonly order?: number;
  /** O ponto do qual o elemento cresce e para o qual encolhe, em pixels do quadro. */
  readonly origin: readonly [number, number];
  /** Para onde ele vai enquanto sai, em pixels. */
  readonly drift?: readonly [number, number];
  readonly children: React.ReactNode;
};

/**
 * Um elemento desenhado no quadro inteiro (um SVG, um grupo) que entra e sai
 * do palco em volta de um ponto dele. O que é posto com `Place` já faz isso
 * sozinho nos planos de fundo liso.
 */
export const Cast: React.FC<CastProps> = ({
  order = 0,
  origin,
  drift = [0, 0],
  children,
}) => {
  const stage = useStage();
  const mark = markFor("prop", 0, order);
  const left = stage.leave(mark.leaveAt);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${origin[0]}px ${origin[1]}px`,
        translate: `${drift[0] * left}px ${drift[1] * left}px`,
        scale: `${castScale(stage, mark)}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

type FlatStageProps = {
  /** O fundo liso do plano. */
  readonly backdrop: React.ReactNode;
  readonly children: React.ReactNode;
};

/**
 * Um plano de fundo liso num palco dividido: o fundo toma a cor dele sobre o
 * do plano anterior, e o que está por cima é elenco.
 */
export const FlatStage: React.FC<FlatStageProps> = ({ backdrop, children }) => {
  const stage = useStage();
  return (
    <>
      <AbsoluteFill style={{ opacity: stage.enter() }}>{backdrop}</AbsoluteFill>
      <Troupe>{children}</Troupe>
    </>
  );
};

type TroupeProps = {
  /** Se os filhos são elenco, ou se vão e vêm com o cenário em que estão. */
  readonly cast?: boolean;
  readonly children: React.ReactNode;
};

/** Diz se o que está dentro é elenco. Uma camada de cenário diz que não; um plano de fundo liso, que sim. */
export const Troupe: React.FC<TroupeProps> = ({ cast = true, children }) => {
  const stage = useStage();
  const troupe = useMemo(() => ({ ...stage, cast }), [stage, cast]);
  return (
    <StageContext.Provider value={troupe}>{children}</StageContext.Provider>
  );
};

type StayProps = {
  /**
   * De que lado o elemento é comum aos dois planos. Com "entering", ele já
   * estava no palco quando o plano chegou: não entra, mas sai. Com "leaving",
   * continua no plano seguinte: entra, mas não sai. Sem valor, nem um nem outro.
   */
  readonly only?: "entering" | "leaving";
  readonly children: React.ReactNode;
};

/**
 * O que dois planos têm em comum e por isso não entra nem sai: fica onde
 * está, e o plano seguinte assume o desenho.
 */
export const Stay: React.FC<StayProps> = ({ only, children }) => {
  const stage = useStage();
  const staying = useMemo(
    () => ({
      ...stage,
      enter: only === "leaving" ? stage.enter : OFFSTAGE.enter,
      leave: only === "entering" ? stage.leave : OFFSTAGE.leave,
    }),
    [stage, only],
  );
  return (
    <StageContext.Provider value={staying}>{children}</StageContext.Provider>
  );
};
