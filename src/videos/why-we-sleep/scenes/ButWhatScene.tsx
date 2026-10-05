import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { AnswerIcon } from "../parts/AnswerIcon";
import { IconRow, MapIcon, iconSpot } from "../parts/IconRow";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  FRONT,
  FRONT_CLOSE,
  FRONT_OPENING,
  ShopFront,
} from "../parts/ShopFront";
import { ROW_HUE } from "./FivePartsScene";

// A fila um pouco à esquerda do centro: o último ícone, o da loja, tem espaço para crescer.
const ROW = { x: 900, y: 540, scale: 1.15 };
const GROWN = 1.3;

type MapShotProps = {
  /** Quadro do plano em que a porta da loja acende. */
  readonly shopAt: number;
};

/** A fila volta pela última vez: os três jeitos estão riscados, e a porta da loja acende. */
const MapShot: React.FC<MapShotProps> = ({ shopAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.8, 0.5]} />
      <IconRow
        {...ROW}
        hue={ROW_HUE}
        states={{
          eyes: "check",
          ruler: "cross",
          brain: "cross",
          alarm: "cross",
          shop: frame >= shopAt ? "on" : "off",
        }}
        since={{ shop: shopAt }}
        grow={{ shop: mix(1, GROWN, ramp(frame, shopAt, 0.5 * fps)) }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// A porta de enrolar no meio do quadro, em plano médio; a câmera chega um pouco mais perto ao longo do plano.
const DOOR = {
  x: FRONT.x,
  y: FRONT_OPENING.y + FRONT_OPENING.height / 2,
};
// A câmera olha um pouco acima da porta, para a placa da lua caber no quadro.
const LIFT = 70;
const DOOR_MEDIUM = framing([DOOR.x, DOOR.y - LIFT], 1.08);
const DOOR_MEDIUM_END = framing([DOOR.x, DOOR.y - LIFT + 10], 1.14);
// O ícone da loja, onde o plano anterior o deixou.
const ICON = iconSpot("shop", ROW);
const ICON_SIZE = ICON.size * GROWN;
// No desenho do ícone (220 de lado), a porta de enrolar tem 108 de largura e fica 15 abaixo do centro.
const ICON_DOOR = { width: 108 / 220, drop: 15 / 220 };
// Quanto o ícone cresce para a porta dele ter a largura da porta da loja no quadro.
const ICON_GROWTH =
  (FRONT_OPENING.width * DOOR_MEDIUM.zoom) / (ICON_SIZE * ICON_DOOR.width);

/** O ícone cresce e vira a porta da loja baixada, de noite, com luz saindo por baixo. */
const DoorShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const grown = ramp(frame, 0, 0.7 * fps);
  const scale = mix(1, ICON_GROWTH, grown);

  return (
    <AbsoluteFill>
      <ShopFront
        time="night"
        shutter={1}
        busy
        camera={cameraBetween(
          DOOR_MEDIUM,
          DOOR_MEDIUM_END,
          frame / durationInFrames,
        )}
      />
      {/* O fundo da fila e o ícone ficam por cima da rua só enquanto o ícone cresce. */}
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, 0.2 * fps, 0.5 * fps) }}>
        <IdeaBackdrop hue={ROW_HUE} spot={[0.8, 0.5]} />
      </AbsoluteFill>
      <Place
        x={mix(ICON.x, 960, grown)}
        y={mix(
          ICON.y,
          540 + LIFT * DOOR_MEDIUM.zoom - ICON_SIZE * ICON_DOOR.drop * scale,
          grown,
        )}
        style={{
          scale: `${scale}`,
          opacity: 1 - ramp(frame, 0.45 * fps, 0.35 * fps),
        }}
      >
        <MapIcon icon="shop" state="on" size={ICON_SIZE} hue={ROW_HUE} />
      </Place>
    </AbsoluteFill>
  );
};

const MEDALLION = 150;

type AnswerShotProps = {
  /** Quadros do plano em que a interrogação entra e em que o medalhão acende. */
  readonly askAt: number;
  readonly answerAt: number;
};

/** De perto: a interrogação na porta e, sobre ela, o medalhão da caixa de estoque. */
const AnswerShot: React.FC<AnswerShotProps> = ({ askAt, answerAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <ShopFront
      time="night"
      shutter={1}
      busy
      // Continua o plano anterior: a câmera parte de onde ele parou.
      camera={cameraBetween(
        DOOR_MEDIUM_END,
        FRONT_CLOSE,
        ramp(frame, 0, 0.7 * fps),
      )}
    >
      <Place x={DOOR.x} y={DOOR.y + 76}>
        <Pop at={askAt} from={1.6}>
          <Label size="display" color={ink.moon}>
            ?
          </Label>
        </Pop>
      </Place>
      <Place x={DOOR.x} y={DOOR.y - 94}>
        <Pop at={answerAt}>
          {/* O clarão atrás do medalhão: ele acende. */}
          <div
            style={{
              padding: 46,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${ink.moon}CC 55%, transparent 70%)`,
            }}
          >
            <AnswerIcon answer="stock" size={MEDALLION} />
          </div>
        </Pop>
      </Place>
    </ShopFront>
  );
};

export const ButWhatScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os três jeitos riscados; a loja acende">
      <MapShot shopAt={cue(scene, "última")} />
    </Shot>
    <Shot range={shots[1]} name="o ícone vira a porta da loja, de noite">
      <DoorShot />
    </Shot>
    <Shot range={shots[2]} name="a interrogação e o medalhão da caixa">
      <AnswerShot
        askAt={cue(scene, "aberto") - shots[2].from}
        answerAt={cue(scene, "parte", 2) - shots[2].from}
      />
    </Shot>
  </>
);
