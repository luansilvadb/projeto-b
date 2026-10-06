import { AbsoluteFill } from "remotion";
import { useBoard, useBuild } from "./Camera";
import { mix, clamp01 } from "./timing";

/** Quem está no palco, do jeito que o plano o deixou: onde está e o desenho dele. */
export type Standing = {
  readonly x: number;
  readonly y: number;
  readonly node: React.ReactNode;
};

type Pose = { readonly x: number; readonly y: number; readonly scale: number };

// Em que trecho da troca quem não continua sai, e quem é novo entra. Um depois do outro.
const LEAVING = [0, 0.4] as const;
const ARRIVING = [0.35, 0.8] as const;

const within = ([from, to]: readonly [number, number], t: number) =>
  clamp01((t - from) / (to - from));

/**
 * Um personagem com identidade no palco. Quando o plano herda o cenário do
 * anterior, o palco confere o elenco pelo `id`: quem já estava vai do lugar
 * em que estava até o lugar novo; quem é novo entra crescendo; e quem não
 * continua é tirado por `Leftovers`. Sem `id`, ou fora desse caso, devolve a
 * posição pedida.
 *
 * `render` desenha o personagem parado numa posição: é o que o plano seguinte
 * usa para tirá-lo de cena, se ele não continuar.
 */
export const useActor = (
  id: string | undefined,
  x: number,
  y: number,
  render: (x: number, y: number) => React.ReactNode,
): Pose => {
  const { shot, heir, takeover } = useBuild();
  const board = useBoard();
  if (id === undefined || !board || shot === null) {
    return { x, y, scale: 1 };
  }
  const previous = heir === null ? undefined : board.actors.get(heir)?.get(id);
  const pose =
    heir === null || takeover >= 1
      ? { x, y, scale: 1 }
      : previous
        ? {
            x: mix(previous.x, x, takeover),
            y: mix(previous.y, y, takeover),
            scale: 1,
          }
        : { x, y, scale: within(ARRIVING, takeover) };
  // Escrito durante o desenho, como o resto do quadro de avisos: ver OneStage.
  board.actors.get(shot)?.set(id, {
    x: pose.x,
    y: pose.y,
    node: render(pose.x, pose.y),
  });
  return pose;
};

/**
 * Quem estava no plano anterior e não continua neste: sai encolhendo, de onde
 * estava. Vai na camada do assunto do cenário, depois do elenco do plano, para
 * já saber quem continua.
 */
export const Leftovers: React.FC = () => {
  const { shot, heir, takeover } = useBuild();
  const board = useBoard();
  if (!board || shot === null || heir === null || takeover >= 1) {
    return null;
  }
  const staying = board.actors.get(shot);
  const left = within(LEAVING, takeover);
  return (
    <>
      {[...(board.actors.get(heir) ?? [])]
        .filter(([id]) => !staying?.has(id))
        .map(([id, { x, y, node }]) => (
          <AbsoluteFill
            key={id}
            style={{ transformOrigin: `${x}px ${y}px`, scale: `${1 - left}` }}
          >
            {node}
          </AbsoluteFill>
        ))}
    </>
  );
};
