import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Person, type PersonColors } from "../../art/Person";
import { Label } from "../../components/Label";
import { Place } from "../../components/Place";
import { apron, idea, ink, person } from "./palette";

type PersonPose = Omit<
  React.ComponentProps<typeof Person>,
  "height" | "colors"
>;
type FaceStudy = Pick<PersonPose, "expression" | "look" | "blink">;

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
const faceStudies: readonly (readonly { label: string; pose: FaceStudy }[])[] = [
  [
    { label: "neutro", pose: { expression: "neutral" } },
    { label: "curioso", pose: { expression: "curious" } },
    { label: "dúvida", pose: { expression: "puzzled" } },
  ],
  [
    { label: "espanto", pose: { expression: "surprised" } },
    { label: "sono", pose: { expression: "sleepy" } },
    { label: "bocejo", pose: { expression: "yawning" } },
  ],
  [
    { label: "dormindo", pose: { expression: "asleep" } },
    { label: "lendo", pose: { expression: "reading" } },
    {
      label: "olhar dirigido",
      pose: { expression: "curious", look: [0.85, -0.1] },
    },
  ],
  [0, 0.5, 1].map((blink) => ({
    label: blink === 0 ? "olhar aberto" : blink === 1 ? "piscada fechada" : "piscada",
    pose: { expression: "curious" as const, look: [0.85, -0.1] as const, blink },
  })),
];
const COLUMN = 360;
const HEIGHT = 520;
const FACE_COLUMN = 640;
const FACE_HEIGHT = 1300;
// A silhueta: a figura inteira numa cor só, para a construção ser julgada sem cor nem rosto.
const SILHOUETTE = Object.fromEntries(
  Object.keys(person).map((key) => [key, ink.dark]),
) as PersonColors;

/**
 * Folha de modelo da pessoa (unidade `forma`, Construção), nas poses que o
 * roteiro pede. No quadro 0, numa cor só; no 1, pintada.
 */
export const PersonSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const silhouette = frame === 0;
  const sheet = poses(silhouette ? ink.dark : person.shoe);
  const faceStudy = faceStudies[frame - 2];
  if (faceStudy) {
    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(${idea.peach.top}, ${idea.peach.bottom})`,
        }}
      >
        {faceStudy.map(({ label, pose }, column) => (
          <div key={label}>
            <div
              style={{
                position: "absolute",
                left: column * FACE_COLUMN,
                top: 0,
                width: FACE_COLUMN,
                height: 570,
                overflow: "hidden",
              }}
            >
              <Place x={FACE_COLUMN / 2} y={FACE_HEIGHT} anchor="bottom">
                <Person height={FACE_HEIGHT} colors={person} {...pose} />
              </Place>
            </div>
            <Place x={column * FACE_COLUMN + FACE_COLUMN / 2} y={620}>
              <Label size="note" color={ink.dark} tag={ink.paper}>
                {label}
              </Label>
            </Place>
          </div>
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${idea.peach.top}, ${idea.peach.bottom})`,
      }}
    >
      {sheet.map(({ label, pose }, column) => (
        <div key={label}>
          <Place x={COLUMN * (column + 0.5)} y={820} anchor="bottom">
            <Person
              height={HEIGHT}
              colors={silhouette ? SILHOUETTE : person}
              {...pose}
              // Em silhueta a caixa e o avental também são uma cor só.
              apron={
                pose.apron && silhouette ? [ink.dark, ink.dark] : pose.apron
              }
            />
          </Place>
          <Place x={COLUMN * (column + 0.5)} y={930}>
            <Label size="note" color={ink.dark} tag={ink.paper}>
              {label}
            </Label>
          </Place>
        </div>
      ))}
    </AbsoluteFill>
  );
};
