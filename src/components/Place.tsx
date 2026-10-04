import { markFor } from "../video/stage";
import { useActor } from "./Actors";
import { castScale, useStage } from "./Cast";

type PlaceProps = {
  readonly x: number;
  readonly y: number;
  /**
   * Que ponto do conteúdo vai para (x, y): o centro, ou o meio da base, para
   * o que fica em pé no chão.
   */
  readonly anchor?: "center" | "bottom";
  readonly style?: React.CSSProperties;
  /**
   * A identidade de quem está aqui, para o palco: o mesmo `id` em dois planos
   * seguidos no mesmo cenário é o mesmo personagem, que vai de um lugar ao
   * outro em vez de sumir e aparecer.
   */
  readonly id?: string;
  readonly children: React.ReactNode;
};

/**
 * Põe o conteúdo num ponto do quadro, em pixels, pelo centro ou pela base.
 * Num palco dividido de fundo liso, o conteúdo entra crescendo desse ponto e
 * sai encolhendo nele, na marcação do elenco: da esquerda para a direita.
 */
export const Place: React.FC<PlaceProps> = ({
  x,
  y,
  anchor = "center",
  style,
  id,
  children,
}) => {
  const stage = useStage();
  const pose = useActor(id, x, y, (atX, atY) => (
    <Place x={atX} y={atY} anchor={anchor} style={style}>
      {children}
    </Place>
  ));

  return (
    <div
      style={{
        position: "absolute",
        left: pose.x,
        top: pose.y,
        // O canto desta caixa é o próprio ponto (x, y): o elenco cresce e encolhe em volta dele.
        transformOrigin: "0 0",
        scale: stage.cast
          ? `${castScale(stage, markFor("actor", x))}`
          : `${pose.scale}`,
      }}
    >
      <div
        style={{
          translate: anchor === "bottom" ? "-50% -100%" : "-50% -50%",
          // Quem está em pé gira e cresce a partir dos pés.
          transformOrigin: anchor === "bottom" ? "50% 100%" : undefined,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};
