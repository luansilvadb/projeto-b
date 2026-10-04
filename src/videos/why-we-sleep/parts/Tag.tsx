import { Label } from "../../../components/Label";
import type { typography } from "../../../design/tokens";
import { tags, type TagTone } from "../palette";

type TagProps = {
  /** A família do fundo sobre o qual a etiqueta fica. */
  readonly on: TagTone;
  readonly size?: keyof typeof typography.size;
  readonly children: React.ReactNode;
};

/** A etiqueta do vídeo: uma pílula na cor que combina com o fundo do plano. */
export const Tag: React.FC<TagProps> = ({ on, size = "note", children }) => (
  <Label size={size} color={tags[on].text} tag={tags[on].fill} radius={999}>
    {children}
  </Label>
);
