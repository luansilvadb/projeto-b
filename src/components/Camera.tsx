import { createContext, useContext, useMemo, useState } from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../format";
import type { Standing } from "./Actors";
import { Troupe } from "./Cast";

export type CameraState = {
  /** Deslocamento da câmera em pixels, no plano do assunto. */
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

const CameraContext = createContext<CameraState>({ x: 0, y: 0, zoom: 1 });
/** A câmera compartilhada também pode transformar camadas vetoriais dentro de um SVG. */
export const useCameraState = (): CameraState => useContext(CameraContext);

type FramePoint = readonly [number, number];

/**
 * Câmera que enquadra um ponto do plano do assunto: com a aproximação pedida,
 * o ponto `subject` do cenário vai parar em `at`, que por padrão é o centro
 * do quadro. É assim que um plano aberto vira médio ou close sem redesenhar.
 */
export const framing = (
  subject: FramePoint,
  zoom: number,
  at: FramePoint = [WIDTH / 2, HEIGHT / 2],
): CameraState => ({
  // As camadas crescem em volta do centro do quadro e depois se deslocam.
  x: WIDTH / 2 + zoom * (subject[0] - WIDTH / 2) - at[0],
  y: HEIGHT / 2 + zoom * (subject[1] - HEIGHT / 2) - at[1],
  zoom,
});

/**
 * A câmera a meio caminho entre dois enquadramentos, com `t` de 0 a 1. A
 * aproximação interpola em escala geométrica, para a velocidade aparente ser
 * a mesma indo de 1 para 2 ou de 2 para 4.
 */
export const cameraBetween = (
  from: CameraState,
  to: CameraState,
  t: number,
): CameraState => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
  zoom: from.zoom * (to.zoom / from.zoom) ** t,
});

type CameraProps = Partial<CameraState> & {
  readonly children: React.ReactNode;
};

/** Move todas as camadas filhas de uma vez; cada uma responde conforme sua profundidade. */
export const Camera: React.FC<CameraProps> = ({
  x = 0,
  y = 0,
  zoom = 1,
  children,
}) => {
  const own = useMemo(() => ({ x, y, zoom }), [x, y, zoom]);
  const state = useCarried("camera", own, cameraBetween);
  return (
    <CameraContext.Provider value={state}>{children}</CameraContext.Provider>
  );
};

type Carried = {
  /** A câmera e a luz do cenário, pelo nome. */
  readonly values: Record<string, unknown>;
  /** O elenco com identidade de cada plano que está no palco, pelo `id`. */
  readonly actors: Map<string, Map<string, Standing>>;
};

// O que o plano que está no palco deixa para o seguinte: a câmera e a luz do
// cenário. Não é estado do React, e sim um quadro de avisos preenchido durante
// o desenho de cada quadro: o plano que sai é desenhado antes do que chega, e
// o que chega lê o que ele acabou de escrever. Assim cada quadro sai igual,
// seja qual for o quadro por onde o render começou.
const CarryContext = createContext<Carried | null>(null);

/** O palco do vídeo: guarda o que passa de um plano para o seguinte quando os dois dividem o mesmo cenário. */
export const OneStage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [carried] = useState<Carried>(() => ({
    values: {},
    actors: new Map(),
  }));
  return (
    <CarryContext.Provider value={carried}>{children}</CarryContext.Provider>
  );
};

/** O quadro de avisos do palco, para quem cuida do elenco. */
export const useBoard = (): Carried | null => useContext(CarryContext);

/**
 * Um valor do cenário (a câmera, a luz do dia, a altura do astro) que
 * continua de um plano para o seguinte quando os dois estão no mesmo cenário:
 * o plano que chega parte do valor que o anterior tem agora e vai até o dele,
 * em vez de saltar. Fora desse caso devolve o valor recebido.
 */
const useCarried = <Value,>(
  name: string,
  value: Value,
  between: (from: Value, to: Value, t: number) => Value,
): Value => {
  const { tracked, takeover } = useBuild();
  const carried = useContext(CarryContext);
  if (!tracked || !carried) {
    return value;
  }
  const previous = carried.values[name] as Value | undefined;
  const current =
    takeover < 1 && previous !== undefined
      ? between(previous, value, takeover)
      : value;
  // Escrito durante o desenho, de propósito: é assim que o plano seguinte lê, no mesmo quadro, o valor deste.
  carried.values[name] = current;
  return current;
};

/** Um número do cenário que continua de um plano para o seguinte. */
export const useCarriedNumber = (name: string, value: number): number =>
  useCarried(name, value, (from, to, t) => from + (to - from) * t);

type Built = {
  /** De 0 a 1, quanto o fundo já tomou a cor dele. Só cresce: o fundo não sai, é coberto pelo da cena seguinte. */
  readonly lit: number;
  /** De 0 (abaixo do quadro) a 1 (no lugar), quanto as camadas já subiram. */
  readonly risen: number;
  /**
   * Se este cenário é o do palco, e não um cenário dentro de outro (um cartão,
   * uma folha de modelo): só o do palco passa a câmera e a luz adiante.
   */
  readonly tracked: boolean;
  /**
   * De 0 a 1, quanto o plano já assumiu o cenário que herdou do anterior. Em 1
   * o cenário é só dele; é o valor de todo plano que não herda nada.
   */
  readonly takeover: number;
  /** O nome do plano no palco, e o do plano de quem ele herdou o cenário. Sem palco, nenhum. */
  readonly shot: string | null;
  readonly heir: string | null;
};

const BUILT: Built = {
  lit: 1,
  risen: 1,
  tracked: false,
  takeover: 1,
  shot: null,
  heir: null,
};
const BuildContext = createContext<Built>(BUILT);

type BuildProps = Partial<Built> & { readonly children: React.ReactNode };

/**
 * Quanto do cenário já está no palco. Um cenário em camadas entra e sai de
 * cena assim: o fundo toma a cor dele e as outras camadas sobem de baixo do
 * quadro, as de perto por último, levando junto quem está em cima delas. Sem
 * valores, o cenário está pronto.
 */
export const Build: React.FC<BuildProps> = ({
  lit = 1,
  risen = 1,
  tracked = false,
  takeover = 1,
  shot = null,
  heir = null,
  children,
}) => {
  const board = useBoard();
  const built = useMemo(
    () => ({ lit, risen, tracked, takeover, shot, heir }),
    [lit, risen, tracked, takeover, shot, heir],
  );
  // O elenco do plano é anotado de novo a cada quadro: quem saiu de cena não fica na lista.
  if (shot !== null) {
    board?.actors.set(shot, new Map());
  }
  return (
    <BuildContext.Provider value={built}>{children}</BuildContext.Provider>
  );
};

export const useBuild = (): Built => useContext(BuildContext);

// Quanto uma camada desce para sumir do quadro inteiro, astro incluído: as de
// perto, mais. Num plano fechado tudo é maior, e a descida cresce junto.
const SINK = { base: 1000, perDepth: 300 };

// Quanto a camada em que se está desceu, na escala dela.
const SunkContext = createContext(0);

/**
 * O fundo de um cenário que é pintado na camada do assunto, e não ao longe:
 * uma parede, a água de um aquário. Ele não sobe com a camada: toma a cor
 * dele no lugar, como todo fundo.
 */
export const Wall: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lit } = useBuild();
  const sunk = useContext(SunkContext);
  return (
    <AbsoluteFill style={{ translate: `0 ${-sunk}px`, opacity: lit }}>
      {children}
    </AbsoluteFill>
  );
};

type LayerProps = {
  /** 0 é o infinito (não se move); 1 é o plano do assunto (acompanha a câmera por inteiro). */
  readonly depth: number;
  /**
   * Camada de luz: soma ao que está atrás em vez de cobrir. Halos precisam
   * disto, e precisa ser na camada, porque a mesclagem não atravessa um
   * elemento transformado.
   */
  readonly light?: boolean;
  readonly children: React.ReactNode;
};

/** Camada de parallax: quanto mais distante, menos reage ao movimento da câmera. */
export const Layer: React.FC<LayerProps> = ({
  depth,
  light = false,
  children,
}) => {
  const camera = useContext(CameraContext);
  const { lit, risen } = useBuild();
  const zoomed = 1 + (camera.zoom - 1) * depth;
  // O fundo não tem para onde descer: ele muda de cor sobre o fundo anterior.
  const sunk =
    depth === 0
      ? 0
      : (1 - risen) * (SINK.base + SINK.perDepth * depth) * zoomed;
  return (
    <AbsoluteFill
      style={{
        translate: `${-camera.x * depth}px ${sunk - camera.y * depth}px`,
        opacity: depth === 0 ? lit : undefined,
        scale: zoomed,
        mixBlendMode: light ? "screen" : undefined,
      }}
    >
      <SunkContext.Provider value={sunk / zoomed}>
        {/* Quem está numa camada do cenário vai e vem com ela, e não por conta própria. */}
        <Troupe cast={false}>{children}</Troupe>
      </SunkContext.Provider>
    </AbsoluteFill>
  );
};
