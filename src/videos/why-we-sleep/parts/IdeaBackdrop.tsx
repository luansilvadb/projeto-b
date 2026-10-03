import { AbsoluteFill } from "remotion";
import { idea } from "../palette";

type IdeaBackdropProps = {
  /** O matiz do fundo: troca a cada ideia. */
  readonly hue: keyof typeof idea;
  /** Onde fica a mancha clara de apoio, em fração do quadro. */
  readonly spot?: readonly [number, number];
};

/**
 * Fundo liso dos planos de explicação: um degradê, uma mancha clara atrás do
 * assunto e os cantos um pouco mais escuros. Nunca uma cor só.
 */
export const IdeaBackdrop: React.FC<IdeaBackdropProps> = ({
  hue,
  spot = [0.5, 0.42],
}) => {
  const colors = idea[hue];
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${colors.top}, ${colors.bottom})` }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 620px at ${spot[0] * 100}% ${spot[1] * 100}%, ${colors.spot}B3, transparent)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 60%, ${colors.contact}26)`,
        }}
      />
    </AbsoluteFill>
  );
};

type ContactShadowProps = {
  readonly hue: keyof typeof idea;
  readonly x: number;
  readonly y: number;
  readonly width: number;
};

/** Sombra de contato de quem está em pé sobre um fundo de ideia. Vai dentro de um SvgLayer. */
export const IdeaShadow: React.FC<ContactShadowProps> = ({
  hue,
  x,
  y,
  width,
}) => (
  <ellipse
    cx={x}
    cy={y}
    rx={width / 2}
    ry={width * 0.06}
    fill={idea[hue].contact}
    opacity={0.24}
  />
);
