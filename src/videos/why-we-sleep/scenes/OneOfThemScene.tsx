import { useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant } from "../../../art/Elephant";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { elephant, idea, jellyfish, person, personInPajamas } from "../palette";
import { Bed, BED_SIZE } from "../parts/Bed";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  pulseCycles,
  pulseShape,
  steady,
} from "../parts/pulse";

type Hue = keyof typeof idea;

// Do centro do desenho da água-viva até onde o sino encosta no chão, em fração da largura do sino.
const RESTING = 124 / 660;

type Layout = {
  readonly ground: number;
  readonly elephant: { readonly x: number; readonly width: number };
  readonly person: { readonly x: number; readonly height: number };
  readonly jellyfish: { readonly x: number; readonly width: number };
};

/** Onde cada um fica, na mesma linha: a elefanta de um lado, a pessoa no meio, a água-viva do outro. */
const MEDIUM: Layout = {
  ground: 990,
  elephant: { x: 390, width: 640 },
  person: { x: 990, height: 740 },
  jellyfish: { x: 1560, width: 400 },
};
const WIDE: Layout = {
  ground: 870,
  // A cama é mais comprida que a pessoa de pé: a elefanta e a água-viva abrem para os lados,
  // e a ponta da tromba fica com um vazio até a cabeceira (encostava nela).
  elephant: { x: 330, width: 420 },
  person: { x: 1050, height: 470 },
  jellyfish: { x: 1640, width: 270 },
};

type TrioProps = {
  /** O enquadramento: de perto, com a pessoa de pé; aberto, com ela deitada. */
  readonly layout: Layout;
  readonly hue: Hue;
  /** Quanto os três dormem, de 0 a 1: a pessoa se deita, a elefanta fecha os olhos, a água-viva solta os braços. */
  readonly asleep: number;
  /** Quadro em que o "ZZZ" sobe; sem valor, não há. */
  readonly snoreAt?: number;
};

/**
 * A pessoa entre a elefanta e a água-viva, na mesma linha: somos um desses
 * animais. Acordados, ela está de pé; dormindo, ela se deita, a elefanta
 * dorme em pé e a água-viva pulsa devagar. A chamada final reusa o trio.
 */
const Trio: React.FC<TrioProps> = ({ layout, hue, asleep, snoreAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const { ground } = layout;
  const lying = asleep > 0.5;
  // Deitada, ela fica do tamanho que tinha de pé (a peça desenha a figura com 800 px).
  const bedScale = layout.person.height / 800;

  return (
    <>
      <SvgLayer>
        <IdeaShadow
          hue={hue}
          x={layout.elephant.x}
          y={ground + 6}
          width={layout.elephant.width * 0.8}
        />
        <IdeaShadow
          hue={hue}
          x={layout.person.x}
          y={ground + 6}
          width={
            lying ? BED_SIZE.width * bedScale + 60 : layout.person.height * 0.5
          }
        />
        <IdeaShadow
          hue={hue}
          x={layout.jellyfish.x}
          y={ground + 6}
          width={layout.jellyfish.width * 1.1}
        />
      </SvgLayer>
      {/* A elefanta olha para o meio do quadro: o desenho, que olha para a esquerda, é espelhado. */}
      <Place
        x={layout.elephant.x}
        y={ground}
        anchor="bottom"
        style={{
          scale: `-1 ${breath(seconds, "trio-elephant", { amplitude: 0.012, period: 4.5 })}`,
        }}
      >
        <Elephant
          width={layout.elephant.width}
          colors={elephant}
          lid={Math.max(asleep, blink(seconds, "trio-elephant"))}
          droop={asleep}
          trunk={0.2 * (1 - asleep)}
          ear={0.35 * (1 - asleep) + 0.1}
        />
      </Place>
      {lying ? (
        <Bed
          x={layout.person.x}
          y={ground}
          scale={bedScale}
          colors={personInPajamas}
          hue={hue}
          shadow={false}
          snoreAt={snoreAt}
          snoreSize={120}
        />
      ) : (
        <Place
          x={layout.person.x}
          y={ground}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, "you")}` }}
        >
          <Person
            height={layout.person.height}
            colors={person}
            expression="neutral"
            blink={blink(seconds, "you")}
          />
        </Place>
      )}
      <Place
        x={layout.jellyfish.x}
        y={ground - layout.jellyfish.width * RESTING}
      >
        <Cassiopea
          width={layout.jellyfish.width}
          colors={jellyfish.day}
          droop={0.8 * asleep}
          pulse={pulseShape(
            pulseCycles(
              frame,
              fps,
              steady(lying ? PULSES_ASLEEP : PULSES_AWAKE),
            ),
          )}
          sway={0.4 * wave(seconds, 5)}
        />
      </Place>
    </>
  );
};

type SleepingTrioShotProps = {
  readonly hue: Hue;
};

/** Os três dormindo lado a lado, em quadro aberto: é o segundo plano desta cena e o primeiro da chamada. */
export const SleepingTrioShot: React.FC<SleepingTrioShotProps> = ({ hue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SlowPush
      focus={[960, 620]}
      backdrop={<IdeaBackdrop hue={hue} spot={[0.5, 0.55]} />}
    >
      {/* Eles já chegam dormindo: o deitar é da etapa de animação. */}
      <Trio
        layout={WIDE}
        hue={hue}
        asleep={0.6 + 0.4 * ramp(frame, 0, 0.5 * fps)}
        snoreAt={0.5 * fps}
      />
      <Grain />
    </SlowPush>
  );
};

/** A pessoa do primeiro plano, grande, entre a elefanta e a água-viva. */
const AmongThemShot: React.FC = () => (
  <SlowPush
    focus={[960, 600]}
    backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}
  >
    <Trio layout={MEDIUM} hue="mint" asleep={0} />
    <Grain />
  </SlowPush>
);

export const OneOfThemScene: React.FC<SceneProps> = ({ shots }) => (
  <>
    <Shot range={shots[0]} name="um desses animais">
      <AmongThemShot />
    </Shot>
    <Shot range={shots[1]} name="ela se deita, como a elefanta e a água-viva">
      <SleepingTrioShot hue="mint" />
    </Shot>
  </>
);
