import "../design/fonts";
import { palette, shape, typography } from "../design/tokens";

type LabelProps = {
  readonly size?: keyof typeof typography.size;
  /** Cor do texto. Por padrão, clara quando solto e escura dentro de etiqueta. */
  readonly color?: string;
  /**
   * Cor de fundo: transforma o texto numa etiqueta. Use o tom `base` ou
   * `light` de uma rampa da paleta, que são os que dão leitura ao texto escuro.
   */
  readonly tag?: string;
  /** Raio da etiqueta, quando não é o da direção de arte: 999 faz uma pílula. */
  readonly radius?: number;
  readonly children: React.ReactNode;
};

/** Texto de tela: números e termos que reforçam o que a narração diz. */
export const Label: React.FC<LabelProps> = ({
  size = "label",
  color,
  tag,
  radius = shape.tagRadius,
  children,
}) => (
  <div
    style={{
      fontFamily: typography.family,
      fontWeight: typography.weight,
      fontSize: typography.size[size],
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      color: color ?? (tag ? palette.ink : palette.paper),
      ...(tag
        ? {
            background: tag,
            borderRadius: radius,
            padding: "0.22em 0.6em",
          }
        : null),
    }}
  >
    {children}
  </div>
);
