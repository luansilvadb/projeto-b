import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  Bedroom,
  EmptyDisc,
  Friend,
  Gardner,
  ROOM,
  TossedCoin,
  View,
} from "../parts/Gardner";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";

// O bloco de Gardner é lilás: a blusa laranja dele some no pêssego.
const HUE = "lilac";

// O disco começa no centro, grande, e vai para o canto de baixo, à esquerda (o selo da fonte ocupa o da direita).
const DISC = {
  from: { x: 960, y: 560, scale: 1.5 },
  to: { x: 310, y: 840, scale: 0.5 },
};
const NEWCOMER = { x: 1000, y: 980, height: 720 };

type DiscShotProps = {
  /** Quadro do plano em que a etiqueta de nome entra. */
  readonly nameAt: number;
};

/** O disco dos ratos, vazio, encolhe para o canto; no lugar dele entra o rapaz. */
const DiscShot: React.FC<DiscShotProps> = ({ nameAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const away = ramp(frame, 0.3 * fps, 0.6 * fps);
  const enter = 0.7 * fps;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={HUE} spot={[0.52, 0.5]} />
      <EmptyDisc
        x={mix(DISC.from.x, DISC.to.x, away)}
        y={mix(DISC.from.y, DISC.to.y, away)}
        scale={mix(DISC.from.scale, DISC.to.scale, away)}
      />
      <SvgLayer>
        <g opacity={ramp(frame, enter, 0.2 * fps)}>
          <IdeaShadow hue={HUE} x={NEWCOMER.x} y={NEWCOMER.y + 6} width={340} />
        </g>
      </SvgLayer>
      <Gardner {...NEWCOMER} enter={enter} nameAt={nameAt} on={HUE} />
      <Grain />
    </AbsoluteFill>
  );
};

type Framing = {
  readonly focus: readonly [number, number];
  readonly zoom: number;
};

// O quarto inteiro, e de perto: o cartaz e as três cabeças viradas para ele.
const WHOLE: Framing = { focus: [960, 540], zoom: 1 };
const ON_POSTER: Framing = { focus: [755, 520], zoom: 1.4 };
const CAMERA_SECONDS = 0.5;

// A moeda sai da mão do amigo da esquerda, passa por cima de Gardner e cai no chão, entre ele e o outro amigo.
const TOSS = { from: [425, 520], to: [720, 938], rise: 540 } as const;

type RoomShotProps = {
  /** De onde a câmera vem e onde para. */
  readonly from: Framing;
  readonly to: Framing;
  /** Quadro do plano em que a etiqueta "17 anos" entra; sem valor, não há. */
  readonly ageAt?: number;
  /** Os três olham o cartaz. */
  readonly watching?: boolean;
  /** Quadro do plano em que a moeda cai e os amigos apontam; sem valor, não há moeda. */
  readonly landAt?: number;
};

/** Os três rapazes no quarto, com o cartaz do recorde e o calendário de dezembro de 1963 na parede. */
const RoomShot: React.FC<RoomShotProps> = ({
  from,
  to,
  ageAt,
  watching = false,
  landAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const moved = ramp(frame, 0, CAMERA_SECONDS * fps);
  const [left, middle, right] = ROOM.boys;
  const landed = landAt !== undefined && frame >= landAt;
  const flight = landAt === undefined ? 0 : linear(frame, 2, landAt - 2);
  // Para o cartaz, e para a moeda enquanto ela está no ar, eles olham para cima.
  const look =
    watching || (landAt !== undefined && !landed) ? "curious" : "neutral";
  // O cartaz fica à direita dos três, no alto: é para lá que os olhos vão.
  const gaze = watching ? ([1, -0.55] as const) : undefined;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={HUE} spot={[0.34, 0.5]} />
      <View
        focus={[
          mix(from.focus[0], to.focus[0], moved),
          mix(from.focus[1], to.focus[1], moved),
        ]}
        zoom={mix(from.zoom, to.zoom, moved)}
      >
        <Bedroom hue={HUE} on={HUE} />
        <SvgLayer>
          {ROOM.boys.map((boy) => (
            <IdeaShadow
              key={boy.x}
              hue={HUE}
              x={boy.x}
              y={ROOM.floor + 6}
              width={boy.height * 0.46}
            />
          ))}
        </SvgLayer>
        <Friend
          {...left}
          y={ROOM.floor}
          which={0}
          expression={look}
          gaze={gaze}
          pointing={landed ? "right" : undefined}
        />
        <Friend
          {...right}
          y={ROOM.floor}
          which={1}
          expression={look}
          gaze={gaze}
          pointing={landed ? "left" : undefined}
        />
        <Gardner
          {...middle}
          y={ROOM.floor}
          expression={landed ? "surprised" : look}
          gaze={gaze}
          nameAt={ageAt}
          name="17 anos"
          on={HUE}
        />
        {landAt === undefined ? null : (
          <TossedCoin
            x={mix(TOSS.from[0], TOSS.to[0], flight)}
            y={
              mix(TOSS.from[1], TOSS.to[1], flight) -
              4 * TOSS.rise * flight * (1 - flight)
            }
            // No ar ela gira; no chão, fica deitada.
            spin={landed ? 1.2 : flight * Math.PI * 5}
          />
        )}
      </View>
      <Grain />
    </AbsoluteFill>
  );
};

export const AwakeRecordScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o disco vazio sai; entra Randy Gardner">
      <DiscShot nameAt={cue(scene, "Rêndi")} />
    </Shot>
    <Shot range={shots[1]} name="três rapazes no quarto, dezembro de 1963">
      <RoomShot
        from={WHOLE}
        to={WHOLE}
        ageAt={cue(scene, "dezessete") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="de perto, o cartaz do recorde">
      <RoomShot from={WHOLE} to={ON_POSTER} watching />
    </Shot>
    <Shot range={shots[3]} name="cara ou coroa: a cobaia é ele">
      <RoomShot
        from={ON_POSTER}
        to={WHOLE}
        landAt={cue(scene, "cobaia") - shots[3].from}
      />
    </Shot>
  </>
);
