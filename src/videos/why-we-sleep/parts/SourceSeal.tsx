import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Label } from "../../../components/Label";
import { shape } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { sourceSeal } from "../palette";

type SourceSealProps = {
  /** Autor e ano, como na lista de fontes: "Nath et al., 2017". */
  readonly children: string;
};

/**
 * O selo da fonte: fica no canto de baixo, à direita, enquanto a cena afirma
 * o que aquele estudo mediu. É o que diz a quem assiste que o fato não foi
 * inventado.
 */
export const SourceSeal: React.FC<SourceSealProps> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: `${shape.safeArea.y * 0.5}px ${shape.safeArea.x * 0.5}px`,
        opacity: interpolate(frame, [0.2 * fps, 0.6 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        pointerEvents: "none",
      }}
    >
      <Label
        size="seal"
        color={sourceSeal.text}
        tag={sourceSeal.fill}
        radius={999}
      >
        {children}
      </Label>
    </AbsoluteFill>
  );
};

/** A mesma cena, com o selo da fonte por cima do começo ao fim. */
export const withSource = (
  Scene: React.FC<SceneProps>,
  source: string,
): React.FC<SceneProps> => {
  const Sourced: React.FC<SceneProps> = (props) => (
    <>
      <Scene {...props} />
      <SourceSeal>{source}</SourceSeal>
    </>
  );
  return Sourced;
};
