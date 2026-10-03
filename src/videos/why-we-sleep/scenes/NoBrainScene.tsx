import { useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { cameraBetween } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { POP_SECONDS, popOpacity, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { TextReveal } from "../../../components/TextReveal";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { JELLYFISH_SPOT } from "../parts/Lagoon";
import { LagoonShot } from "../parts/LagoonShot";
import { PULSES_ASLEEP, mix, ramp, steady, cue } from "../parts/timing";

// A lua fica onde a luz entra na lagoa, acima do título.
const MOON = { x: 806, y: 74, radius: 40 };
const TITLE = ["Até quem não tem cérebro", "dorme"] as const;

const NIGHTFALL_SECONDS = 0.3;
const CAMERA_SECONDS = 0.6;
const NERVES_SECONDS = 0.6;
// O cérebro procura lugar sobre ela, não encontra e vai para o lado.
const BRAIN_OVER = { x: JELLYFISH_SPOT.x, y: 560 };
const BRAIN_ASIDE = { x: 600, y: 548 };
const SEARCH_SECONDS = 0.4;
const ASIDE_SECONDS = 0.4;
// O peixe volta pela direita para ver o que acendeu.
const FISH_AWAY = { x: 1320, y: 540 };
const RETURN_SECONDS = 0.6;
// No plano aberto, o peixe desce até a areia e dorme.
const FISH_BED = { x: 1092, y: 752 };
const RECEDE_SECONDS = 1;
const LINE_GAP_SECONDS = 0.4;

type NervesShotProps = {
  readonly nightAt: number;
  /** Quadro do plano em que a câmera recua para o lugar vazio ao lado dela. */
  readonly openAt: number;
  readonly nervesAt: number;
  /** Quadro do plano em que o contorno do cérebro aparece, e em que vai para o lado. */
  readonly brainAt: number;
  readonly asideAt: number;
};

/** A lagoa escurece e a rede de nervos acende; o cérebro procura lugar e não encontra. */
const NervesShot: React.FC<NervesShotProps> = ({
  nightAt,
  openAt,
  nervesAt,
  brainAt,
  asideAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const back = ramp(frame, openAt, RETURN_SECONDS * fps);
  const searching = ramp(frame, brainAt, SEARCH_SECONDS * fps);
  const aside = ramp(frame, asideAt, ASIDE_SECONDS * fps);
  const brainScale = popScale(frame, brainAt, POP_SECONDS * fps);
  const wobble = searching < 1 ? 24 * Math.sin(searching * Math.PI * 3) : 0;

  return (
    <LagoonShot
      time="night"
      nightfall={ramp(frame, nightAt, NIGHTFALL_SECONDS * fps)}
      camera={cameraBetween(
        LAGOON.asleepEnd,
        LAGOON.inside,
        ramp(frame, openAt, CAMERA_SECONDS * fps),
      )}
      rhythm={steady(PULSES_ASLEEP)}
      droop={0.8}
      nerves={ramp(frame, nervesAt, NERVES_SECONDS * fps)}
      fish={{
        x: mix(FISH_AWAY.x, FISH_WATCHING.x, back),
        y: mix(FISH_AWAY.y, FISH_WATCHING.y, back),
        width: FISH_WATCHING.width,
        // Ele se espanta alguns quadros depois de o cérebro aparecer.
        mood: frame >= brainAt + 4 ? "scared" : "curious",
        look: [-0.9, 0.2],
        swimming: back < 1,
      }}
    >
      <Place
        x={mix(BRAIN_OVER.x, BRAIN_ASIDE.x, aside) + wobble}
        y={mix(BRAIN_OVER.y, BRAIN_ASIDE.y, aside) + 6 * wave(seconds, 2.4)}
        style={{
          rotate: `${mix(-4, -10, aside)}deg`,
          scale: `${brainScale}`,
          opacity: popOpacity(frame, brainAt, POP_SECONDS * fps),
        }}
      >
        <Brain width={190} color={ink.paper} dashed folds />
      </Place>
    </LagoonShot>
  );
};

/** A câmera recua até a lagoa inteira; o peixe desce para dormir e o título acende. */
const TitleShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const recede = ramp(frame, 0, RECEDE_SECONDS * fps);
  const arrived = RECEDE_SECONDS * fps;
  const titleAt = arrived;
  const asleep = frame >= arrived;

  return (
    <>
      <LagoonShot
        time="night"
        camera={cameraBetween(LAGOON.inside, LAGOON.wide, recede)}
        rhythm={steady(PULSES_ASLEEP)}
        droop={0.8}
        fish={{
          x: mix(FISH_WATCHING.x, FISH_BED.x, recede),
          y: mix(FISH_WATCHING.y, FISH_BED.y, recede),
          width: FISH_WATCHING.width,
          mood: asleep ? "asleep" : "curious",
          // Os olhos vão fechando enquanto ele desce.
          lid: asleep ? 0 : ramp(frame, arrived - 8, 8),
          tilt: mix(0, 10, recede),
          look: [-0.4, 0.6],
        }}
      >
        <SvgLayer>
          <circle
            cx={MOON.x}
            cy={MOON.y}
            r={MOON.radius * 3}
            fill={ink.moon}
            opacity={0.12 + 0.03 * wave(frame / fps, 3)}
          />
          <circle
            cx={MOON.x}
            cy={MOON.y}
            r={MOON.radius}
            fill={ink.moon}
            opacity={0.92}
          />
        </SvgLayer>
      </LagoonShot>
      <Place x={960} y={322}>
        <div
          style={{
            display: "grid",
            justifyItems: "center",
            // O título brilha como os cachos dela no escuro.
            filter: `drop-shadow(0 0 22px ${ink.glow})`,
          }}
        >
          <TextReveal at={titleAt}>
            <Label size="headline" color={ink.moon}>
              {TITLE[0]}
            </Label>
          </TextReveal>
          <TextReveal at={titleAt + LINE_GAP_SECONDS * fps}>
            <Label size="display" color={ink.moon}>
              {TITLE[1]}
            </Label>
          </TextReveal>
        </div>
      </Place>
    </>
  );
};

export const NoBrainScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a rede de nervos">
      <NervesShot
        nightAt={cue(scene, "detalhe")}
        openAt={cue(scene, "essa")}
        nervesAt={cue(scene, "água")}
        brainAt={cue(scene, "não")}
        asideAt={cue(scene, "cérebro")}
      />
    </Shot>
    <Shot range={shots[1]} name="a lagoa inteira e o título">
      <TitleShot />
    </Shot>
  </>
);
