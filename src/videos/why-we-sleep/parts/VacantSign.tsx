import { useId } from "react";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { pedestal } from "../palette";

type VacantSignProps = {
  /** O meio da base do pedestal, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** O foco de luz que desce sobre o lugar vazio, de 0 a 1. */
  readonly light?: number;
};

const BASE = { width: 500, height: 44 };
const BODY = { bottom: 420, top: 340, height: 160 };
const TOP = { width: 400, height: 44 };
const SLOT = { rx: 130, ry: 150 };
/** Altura do pedestal, do chão ao tampo: quem o posiciona usa para pôr coisas em cima. */
export const PEDESTAL_HEIGHT = BASE.height + BODY.height + TOP.height;
/** Altura total, do chão ao alto do lugar vazio. */
export const VACANT_HEIGHT = PEDESTAL_HEIGHT + SLOT.ry * 2 + 24;

/**
 * O lugar do bicho que não dorme, o cenário-âncora do vídeo: um pedestal com
 * a placa "acordado 24 h" e, em cima dele, só um contorno tracejado sob um
 * foco de luz. É o mesmo desenho em todas as voltas, e fica vazio do gancho
 * ao fechamento.
 */
export const VacantSign: React.FC<VacantSignProps> = ({
  x,
  y,
  scale = 1,
  light = 1,
}) => {
  const id = useId();
  const bodyTop = y - BASE.height - BODY.height;
  const slotY = y - PEDESTAL_HEIGHT - SLOT.ry - 24;

  return (
    <div style={{ scale: `${scale}`, transformOrigin: `${x}px ${y}px` }}>
      <SvgLayer>
        <defs>
          <radialGradient id={id}>
            <stop offset={0} stopColor={pedestal.light} stopOpacity={0.85} />
            <stop offset={1} stopColor={pedestal.light} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* O foco: um cone que desce do alto e o clarão onde ele bate. */}
        <path
          d={`M${x - 150},${slotY - 700} L${x + 150},${slotY - 700} L${x + 290},${y - PEDESTAL_HEIGHT} L${x - 290},${y - PEDESTAL_HEIGHT} Z`}
          fill={pedestal.light}
          opacity={0.22 * light}
        />
        <circle
          cx={x}
          cy={slotY}
          r={SLOT.ry * 1.7}
          fill={`url(#${id})`}
          opacity={light}
        />
        <ellipse
          cx={x}
          cy={y + 6}
          rx={BASE.width * 0.62}
          ry={26}
          fill={pedestal.contact}
          opacity={0.3}
        />
        <path
          d={`M${x - BODY.bottom / 2},${y - BASE.height} L${x - BODY.top / 2},${bodyTop} L${x + BODY.top / 2},${bodyTop} L${x + BODY.bottom / 2},${y - BASE.height} Z`}
          fill={pedestal.body}
        />
        <path
          d={`M${x + BODY.top / 4},${bodyTop} L${x + BODY.top / 2},${bodyTop} L${x + BODY.bottom / 2},${y - BASE.height} L${x + BODY.bottom / 4},${y - BASE.height} Z`}
          fill={pedestal.shade}
        />
        <rect
          x={x - BASE.width / 2}
          y={y - BASE.height}
          width={BASE.width}
          height={BASE.height}
          rx={14}
          fill={pedestal.shade}
        />
        <rect
          x={x - TOP.width / 2}
          y={bodyTop - TOP.height}
          width={TOP.width}
          height={TOP.height}
          rx={14}
          fill={pedestal.top}
        />
        <ellipse
          cx={x}
          cy={slotY}
          rx={SLOT.rx}
          ry={SLOT.ry}
          fill="none"
          stroke={pedestal.shade}
          strokeWidth={10}
          strokeDasharray="30 24"
          strokeLinecap="round"
        />
      </SvgLayer>
      <Place x={x} y={y - BASE.height - BODY.height / 2}>
        <div
          style={{
            border: `6px solid ${pedestal.plaqueEdge}`,
            borderRadius: 22,
          }}
        >
          <Label size="note" color={pedestal.text} tag={pedestal.plaque}>
            acordado 24 h
          </Label>
        </div>
      </Place>
    </div>
  );
};
