import { Label } from "../../../components/Label";
import { palette } from "../../../design/tokens";

type PulseCounterProps = {
  readonly value: number;
};

/** Contador de pulsos da água-viva: o mesmo no começo e no fim do vídeo. */
export const PulseCounter: React.FC<PulseCounterProps> = ({ value }) => (
  <div style={{ display: "grid", justifyItems: "center", gap: 16 }}>
    <Label size="display">{value}</Label>
    <Label size="note" tag={palette.accent.base}>
      pulsos por minuto
    </Label>
  </div>
);
