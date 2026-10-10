import { Cup, FLUNG, Vig } from "./Actor";

type FlungVigProps = {
  /** O chão embaixo dela, se estivesse de pé: ela gira em volta do meio do corpo. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** Quanto ela já rodou no ar, em graus. */
  readonly tumble?: number;
  /** A cor dos riscos que ficam para trás, a oeste; sem valor, não há riscos. */
  readonly streaks?: string;
};

/**
 * A Vigília arremessada para leste (a direita do quadro), inteira e com a
 * xícara na mão: é cartum, ninguém se fere. Vai dentro de um SVG. Quem chama
 * dá o caminho; aqui ficam a pose, a xícara e os riscos da velocidade.
 */
export const FlungVig: React.FC<FlungVigProps> = ({ x, y, scale = 1, tumble = 0, streaks }) => (
  <>
    {streaks ? (
      <g stroke={streaks} strokeWidth={7 * scale} strokeLinecap="round" opacity={0.7}>
        {[-118, -78, -36].map((dy, index) => (
          <line
            key={dy}
            x1={x - (150 + 34 * (index % 2)) * scale}
            y1={y + dy * scale}
            x2={x - (250 + 60 * ((index + 1) % 2)) * scale}
            y2={y + dy * scale}
          />
        ))}
      </g>
    ) : null}
    <g transform={`rotate(${tumble} ${x} ${y - 70 * scale})`}>
      {/* O café fica para trás na xícara: a superfície sobe do lado de onde ela veio. */}
      <Vig x={x} y={y} scale={scale} pose={FLUNG} held={<Cup slosh={24} />} />
    </g>
  </>
);
