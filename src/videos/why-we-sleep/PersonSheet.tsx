import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Person, type PersonColors } from "../../art/Person";
import { Label } from "../../components/Label";
import { Place } from "../../components/Place";
import { apron, idea, ink, person } from "./palette";

type PersonPose = Omit<
  React.ComponentProps<typeof Person>,
  "height" | "colors" | "finish"
>;

// As poses que o roteiro pede da pessoa: é nelas que a silhueta precisa contar a cena.
const poses = (box: string): readonly { label: string; pose: PersonPose }[] => [
  { label: "em pé", pose: {} },
  {
    // Os braços em contrapasso: o de trás do desenho vai à frente, o da frente fica para trás.
    label: "andando",
    pose: {
      expression: "sleepy",
      stride: { step: 1 },
      frontArm: { hand: [-178, -232], bend: 8 },
      backArm: { hand: [176, -304], bend: 22 },
    },
  },
  {
    // Quem boceja se espreguiça: os dois braços para fora e para cima, cada um num ângulo, e o corpo para trás.
    label: "bocejando",
    pose: {
      expression: "yawning",
      lean: -7,
      frontArm: { hand: [-158, -492], bend: -40 },
      backArm: { hand: [150, -520], bend: -22 },
    },
  },
  {
    // Quem dorme em pé desaba para um lado, e os braços caem a prumo, com um fio de vazio até o tronco.
    label: "dormindo",
    pose: {
      expression: "asleep",
      lean: 9,
      frontArm: { hand: [-122, -180], bend: 6 },
      backArm: { hand: [134, -158], bend: 16 },
    },
  },
  {
    // A caixa vai ao lado da cabeça, a caminho da prateleira: os quatro cantos dela ficam fora do contorno do corpo.
    label: "lojista",
    pose: {
      apron,
      lean: 5,
      frontArm: { hand: [150, -330], bend: -30 },
      backArm: { hand: [238, -322], bend: 26 },
      heldInFront: true,
      held: (
        <rect x={138} y={-452} width={190} height={124} rx={10} fill={box} />
      ),
    },
  },
];
const COLUMN = 360;
const HEIGHT = 440;
// A silhueta: a figura inteira numa cor só, para a construção ser julgada sem cor nem rosto.
const SILHOUETTE = Object.fromEntries(
  Object.keys(person).map((key) => [key, ink.dark]),
) as PersonColors;

/**
 * Folha da pessoa, para a etapa da silhueta (unidade `forma`, Construção): em
 * cima a do animatic aprovado, embaixo a construção nova. No quadro 0, numa
 * cor só; no 1, pintadas.
 */
export const PersonSheet: React.FC = () => {
  const silhouette = useCurrentFrame() === 0;
  const sheet = poses(silhouette ? ink.dark : person.shoe);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${idea.peach.top}, ${idea.peach.bottom})`,
      }}
    >
      {[false, true].map((finish, row) =>
        sheet.map(({ label, pose }, column) => (
          <div key={`${row}-${label}`}>
            <Place
              x={COLUMN * (column + 0.5)}
              y={480 + row * 510}
              anchor="bottom"
            >
              <Person
                height={HEIGHT}
                colors={silhouette ? SILHOUETTE : person}
                finish={finish}
                {...pose}
                // Em silhueta a caixa e o avental também são uma cor só.
                apron={
                  pose.apron && silhouette ? [ink.dark, ink.dark] : pose.apron
                }
              />
            </Place>
            {row === 1 ? (
              <Place x={COLUMN * (column + 0.5)} y={1038}>
                <Label size="note" color={ink.dark} tag={ink.paper}>
                  {label}
                </Label>
              </Place>
            ) : null}
          </div>
        )),
      )}
      {["antes", "depois"].map((label, row) => (
        <Place key={label} x={120} y={46 + row * 520}>
          <Label size="note" color={ink.dark} tag={ink.paper}>
            {label}
          </Label>
        </Place>
      ))}
    </AbsoluteFill>
  );
};
