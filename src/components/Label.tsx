import "../design/fonts";
import { palette, typography } from "../design/tokens";

type LabelProps = {
  readonly size?: keyof typeof typography.size;
  readonly color?: string;
  readonly children: React.ReactNode;
};

/** Texto de tela: números e termos que reforçam o que a narração diz. */
export const Label: React.FC<LabelProps> = ({
  size = "label",
  color = palette.paper,
  children,
}) => (
  <div
    style={{
      fontFamily: typography.family,
      fontWeight: typography.weight,
      fontSize: typography.size[size],
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      color,
    }}
  >
    {children}
  </div>
);
