import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Antelope, type AntelopeColors } from "../../art/Antelope";
import { Label } from "../../components/Label";
import { Place } from "../../components/Place";
import { antelope, ink, savanna } from "./palette";

type AntelopePose = Omit<
  React.ComponentProps<typeof Antelope>,
  "width" | "colors" | "finish"
>;

// As poses que o roteiro pede do antílope: é nelas que a silhueta precisa contar a cena.
const POSES: readonly { label: string; pose: AntelopePose }[] = [
  { label: "alerta", pose: { ear: 1, lid: 0 } },
  { label: "andando", pose: { gait: 0.15, ear: 0.6 } },
  { label: "olha para trás", pose: { lookBack: 1, ear: 1, lid: 0 } },
  { label: "com sono", pose: { droop: 0.7, lid: 0.6, tired: 1, ear: 0.1 } },
  { label: "dormindo", pose: { rest: 1, droop: 1, lid: 1, ear: 0 } },
];
const COLUMN = 384;
const WIDTH = 330;
// A silhueta: a figura inteira numa cor só, para a construção ser julgada sem cor nem rosto.
const SILHOUETTE = Object.fromEntries(
  Object.keys(antelope).map((key) => [key, ink.dark]),
) as AntelopeColors;

/**
 * Folha do antílope, para a etapa da silhueta (unidade `forma`, Construção):
 * em cima o do animatic, embaixo o de traço gordo. No quadro 0, numa cor só;
 * no 1, pintados.
 */
export const AntelopeSheet: React.FC = () => {
  const colors = useCurrentFrame() === 0 ? SILHOUETTE : antelope;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${savanna.day.sky[0]}, ${savanna.day.sky[1]})`,
      }}
    >
      {[false, true].map((finish, row) =>
        POSES.map(({ label, pose }, column) => (
          <div key={`${row}-${label}`}>
            <Place
              x={COLUMN * (column + 0.5)}
              y={470 + row * 500}
              anchor="bottom"
            >
              <Antelope
                width={WIDTH}
                colors={colors}
                finish={finish}
                {...pose}
              />
            </Place>
            {row === 1 ? (
              <Place x={COLUMN * (column + 0.5)} y={1030}>
                <Label size="note" color={ink.dark} tag={ink.paper}>
                  {label}
                </Label>
              </Place>
            ) : null}
          </div>
        )),
      )}
      {["antes", "depois"].map((label, row) => (
        <Place key={label} x={120} y={46 + row * 500}>
          <Label size="note" color={ink.dark} tag={ink.paper}>
            {label}
          </Label>
        </Place>
      ))}
    </AbsoluteFill>
  );
};
