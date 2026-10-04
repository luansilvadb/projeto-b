import { AbsoluteFill } from "remotion";
import { Cassiopea } from "../../art/Cassiopea";
import { Label } from "../../components/Label";
import { Place } from "../../components/Place";
import { ink, jellyfish, lagoon } from "./palette";

type Pose = {
  readonly label: string;
  /** De cabeça para cima, nadando; ou pousada, de cabeça para baixo. */
  readonly swimming?: boolean;
  readonly pulse?: number;
  readonly droop?: number;
  readonly nerves?: number;
};

const ROWS: readonly { time: "day" | "night"; poses: readonly Pose[] }[] = [
  {
    time: "day",
    poses: [
      { label: "nadando", swimming: true },
      { label: "nadando, no pulso", swimming: true, pulse: 1 },
      { label: "pousada" },
      { label: "pousada, no pulso", pulse: 1 },
    ],
  },
  {
    time: "night",
    poses: [
      { label: "nadando, à noite", swimming: true },
      { label: "acordada" },
      { label: "dormindo", droop: 1 },
      { label: "a rede de nervos", nerves: 1 },
    ],
  },
];

const WIDTH = 240;
const COLUMN = 480;
const ROW = 540;

/** Folha de modelo da água-viva: as poses que o vídeo usa, de dia e de noite. */
export const JellyfishSheet: React.FC = () => (
  <AbsoluteFill>
    {ROWS.map(({ time, poses }, row) => (
      <AbsoluteFill
        key={time}
        style={{
          top: row * ROW,
          height: ROW,
          background: `linear-gradient(${lagoon[time].water[1]}, ${lagoon[time].water[3]})`,
        }}
      >
        {poses.map(({ label, swimming = false, ...pose }, column) => (
          <div key={label}>
            <Place
              x={COLUMN * (column + 0.5)}
              y={ROW * 0.4}
              style={{ rotate: swimming ? "180deg" : undefined }}
            >
              <Cassiopea width={WIDTH} colors={jellyfish[time]} {...pose} />
            </Place>
            <Place x={COLUMN * (column + 0.5)} y={ROW - 56}>
              <Label size="note" color={ink.dark} tag={ink.paper}>
                {label}
              </Label>
            </Place>
          </div>
        ))}
      </AbsoluteFill>
    ))}
  </AbsoluteFill>
);
