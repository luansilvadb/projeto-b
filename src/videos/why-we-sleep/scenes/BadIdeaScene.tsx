import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Antelope } from "../../../art/Antelope";
import { Person } from "../../../art/Person";
import { framing } from "../../../components/Camera";
import { FlatStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Vignette } from "../../../vignette/Vignette";
import { FPS } from "../../../format";
import { antelope, ink, personInPajamas, savanna, sound } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { HUGGING, Pillow } from "../parts/Belongings";
import { LabWall } from "../parts/Laboratory";
import { LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { RatDiscs } from "../parts/RatDiscs";
import { VacantSign } from "../parts/VacantSign";
import { ALREADY_SHOWN, cue, ramp } from "../../../components/timing";
import { PULSES_ASLEEP, steady } from "../parts/pulse";
import script from "../script.json";
import {
  DOLPHIN,
  SEA_CAMERA,
  SeaShot,
  SwimmingDolphin,
} from "./DolphinProblemScene";
import { Herd, SavannaShot } from "./ElephantsScene";
import { Lab } from "./FloorTestScene";
import { BIRD, GlidingBird, SKY_CAMERA, SkyShot } from "./FrigatebirdScene";
import { DISCS_Y } from "./RatsAwakeScene";
import { Bench } from "./RatsQuestionScene";
import { Panel } from "./SoFarScene";

const HALF = 960;
const GROUND_Y = 820;

type SplitShotProps = {
  /** Quadro do plano em que o lado da realidade entra. */
  readonly realityAt: number;
};

/** O que seria de esperar e o que acontece: o mesmo bicho, alerta de um lado e dormindo do outro. */
const SplitShot: React.FC<SplitShotProps> = ({ realityAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const reality = ramp(frame, realityAt, 0.4 * fps);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.25, 0.5]} />}>
        <AbsoluteFill
          style={{ clipPath: `inset(0 0 0 ${100 - 50 * reality}%)` }}
        >
          <IdeaBackdrop hue="lilac" spot={[0.75, 0.5]} />
        </AbsoluteFill>
        <Place x={HALF / 2} y={150}>
          <Label size="note" color={ink.dark} tag={ink.paper}>
            Expectativa
          </Label>
        </Place>
        <Place x={HALF / 2} y={GROUND_Y} anchor="bottom">
          <div style={{ scale: `1 ${breath(seconds, "awake")}` }}>
            <Antelope
              width={700}
              colors={antelope}
              lid={0}
              ear={1}
              look={[0.6 * wave(seconds, 1.4), 0]}
            />
          </div>
        </Place>
        <div style={{ opacity: reality }}>
          <Place x={HALF * 1.5} y={150}>
            <Label size="note" color={ink.dark} tag={ink.paper}>
              Realidade
            </Label>
          </Place>
          <Place x={HALF * 1.5} y={GROUND_Y} anchor="bottom">
            <div
              style={{
                scale: `1 ${breath(seconds, "asleep", { amplitude: 0.02, period: 4.5 })}`,
              }}
            >
              <Antelope
                width={700}
                colors={antelope}
                rest={1}
                lid={1}
                ear={0.1}
              />
            </div>
          </Place>
          <Place x={HALF * 1.5 + 60} y={400}>
            <Onomatopoeia
              at={realityAt + 0.4 * fps}
              size={130}
              color={sound.warm}
              edge={sound.edge}
            >
              RONC
            </Onomatopoeia>
          </Place>
        </div>
      </FlatStage>
      <Grain />
    </AbsoluteFill>
  );
};

// Quem dorme, em seis quadros: três de cada lado do pedestal vazio, entrando um a um.
const GRID = {
  xs: [290, 1630],
  ys: [200, 540, 880],
  width: 460,
  height: 300,
} as const;
// O lugar de quem não dorme: no centro, e vazio. É o cenário-âncora do vídeo, que nasce aqui.
const VACANT = { x: 960, y: 1010, scale: 1.1 };
const STAGGER_SECONDS = 0.24;
const NIGHTFALL_SECONDS = 0.9;
const HERD = framing([1060, 640], 1.1);
const RAT = framing([960, DISCS_Y - 40], 2.2);
const YOU = { x: 960, y: 1230, height: 1000 };

type SleepersShotProps = {
  /** Os quadros já estão todos no lugar, e a noite cai em volta deles: é o plano que leva à vinheta. */
  readonly settled?: boolean;
};

/**
 * Todos os que dormem, cada um no próprio lugar: a elefanta na savana, a
 * fragata no céu, o golfinho no mar, a água-viva na lagoa, o rato no
 * laboratório e você na cama. São os planos de cada um, mais adiante no vídeo.
 */
const SleepersShot: React.FC<SleepersShotProps> = ({ settled = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const night = settled ? ramp(frame, 0, NIGHTFALL_SECONDS * fps) : 0;
  const sleepers = [
    <SavannaShot key="elefanta" camera={HERD} daylight={0} orb={0.8}>
      <Herd daylight={0} walking={0} asleep={1} seconds={seconds} />
    </SavannaShot>,
    <SkyShot key="fragata" camera={SKY_CAMERA.medium} daylight={0} orb={0.3}>
      <GlidingBird
        x={BIRD.x}
        y={BIRD.y}
        daylight={0}
        lid={1}
        seconds={seconds}
      />
    </SkyShot>,
    <SeaShot key="golfinho" camera={SEA_CAMERA.close}>
      <SwimmingDolphin
        x={DOLPHIN.x}
        y={DOLPHIN.y}
        tilt={0}
        lid={1}
        seconds={seconds}
      />
    </SeaShot>,
    <LagoonShot
      key="água-viva"
      time="night"
      camera={LAGOON.medium}
      rhythm={steady(PULSES_ASLEEP)}
      droop={0.8}
    />,
    <Lab key="rato" camera={RAT}>
      <LabWall />
      <Bench />
      <RatDiscs
        y={DISCS_Y}
        state={() => "asleep"}
        seconds={seconds}
        spinning={false}
      />
    </Lab>,
    <AbsoluteFill key="você">
      <IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />
      <Place x={YOU.x} y={YOU.y} anchor="bottom">
        <Person
          height={YOU.height}
          colors={personInPajamas}
          expression="asleep"
          {...HUGGING}
          held={<Pillow />}
        />
      </Place>
    </AbsoluteFill>,
  ];

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />
      <AbsoluteFill
        style={{
          opacity: night,
          background: `linear-gradient(${savanna.night.sky[0]}, ${savanna.night.sky[1]})`,
        }}
      />
      {sleepers.map((sleeper, index) => (
        <Panel
          key={sleeper.key}
          x={GRID.xs[Math.floor(index / 3)]}
          y={GRID.ys[index % 3]}
          width={GRID.width}
          height={GRID.height}
          focus={index === 3 ? 900 : undefined}
          at={
            settled ? ALREADY_SHOWN : Math.round(index * STAGGER_SECONDS * fps)
          }
        >
          {sleeper}
        </Panel>
      ))}
      <VacantSign {...VACANT} />
      <Grain />
    </AbsoluteFill>
  );
};

/** Quanto a vinheta dura: o silêncio que o roteiro reserva para ela no fim desta cena. */
export const VIGNETTE_FRAMES = Math.round(
  ((script.scenes.find((scene) => scene.id === "bad-idea")?.holdMs ?? 0) /
    1000) *
    FPS,
);

export const BadIdeaScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="expectativa e realidade">
      <SplitShot realityAt={cue(scene, "péssima")} />
    </Shot>
    <Shot range={shots[1]} name="todos os que dormem, um a um">
      <SleepersShot />
    </Shot>
    <Shot range={shots[2]} name="a noite cai sobre todos">
      <SleepersShot settled />
    </Shot>
    {/* No silêncio depois da fala, a vinheta do canal abre num círculo sobre o plano. */}
    <Sequence
      from={scene.durationInFrames - scene.holdFrames}
      durationInFrames={scene.holdFrames}
      name="vinheta"
    >
      <Vignette />
    </Sequence>
  </>
);
