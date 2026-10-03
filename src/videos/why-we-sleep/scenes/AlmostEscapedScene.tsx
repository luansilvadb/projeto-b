import { useId } from "react";
import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Camera, cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { neon, shop } from "../palette";
import {
  LIT_SHOP,
  ROW_GROUND,
  ROW_WIDTH,
  SHOP_ROW,
  ShopRow,
  type ShopState,
} from "../parts/ShopRow";
import { ShopStreet } from "../parts/ShopStreet";
import { cue, mix, ramp } from "../parts/timing";

// A câmera desliza pela rua até a última loja, a acesa, parar onde o close a quer.
const LIT_ON_SCREEN = 1400;
const STREET_START = framing([960, 540], 1);
const STREET_END = framing([SHOP_ROW[LIT_SHOP].x, 540], 1, [
  LIT_ON_SCREEN,
  540,
]);
// O centro da vitrine acesa no quadro, de onde a luz cresce até cobrir tudo.
const WINDOW = {
  x: LIT_ON_SCREEN - 80 * (ROW_WIDTH / 520),
  y: ROW_GROUND - 200 * (ROW_WIDTH / 520),
};
const BLOOM_SECONDS = 0.4;
// Com a borda macia, o miolo sólido precisa passar dos cantos do quadro.
const BLOOM_RADIUS = 3600;

type PanShotProps = {
  /** Quadro do plano em que a câmera começa a correr, e quanto dura o deslize. */
  readonly panAt: number;
  readonly panFrames: number;
  /** Quadro do plano em que a luz da vitrine cresce. */
  readonly bloomAt: number;
};

/** Na rua de portas fechadas, a câmera corre até achar a única vitrine acesa. */
const PanShot: React.FC<PanShotProps> = ({ panAt, panFrames, bloomAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = useId();
  const shops: ShopState[] = SHOP_ROW.map((_, index) =>
    index === LIT_SHOP
      ? { shutter: 0, lamp: 1, lit: true }
      : { shutter: 1, lamp: 1 },
  );
  const bloom = ramp(frame, bloomAt, BLOOM_SECONDS * fps);

  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          STREET_START,
          STREET_END,
          ramp(frame, panAt, panFrames),
        )}
      >
        <ShopRow shops={shops} orb={[1900, 170]} />
      </Camera>
      <Grain />
      {/* No fim, a luz da vitrine cresce até ser o quadro inteiro: um clarão de borda macia. */}
      {bloom > 0 ? (
        <SvgLayer>
          <defs>
            <radialGradient id={id}>
              <stop offset={0.6} stopColor={shop.lit.glass} stopOpacity={1} />
              <stop offset={1} stopColor={shop.lit.glass} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle
            cx={WINDOW.x}
            cy={WINDOW.y}
            r={mix(80, BLOOM_RADIUS, bloom)}
            fill={`url(#${id})`}
          />
        </SvgLayer>
      ) : null}
    </AbsoluteFill>
  );
};

const SIGN = { x: 960, y: 500, width: 1180, height: 340 };
const SHRINK_SECONDS = 0.4;
const TUBE_SECONDS = 0.15;
const LETTER_FRAMES = 2;
const TITLE = "Ninguém escapou";

type NeonCardProps = {
  /** Quadro do plano em que o tubo acende; as letras vêm depois, uma a uma. */
  readonly tubeAt: number;
  readonly lettersAt: number;
};

/** Cartela do capítulo: a luz da vitrine vira o fundo de um letreiro luminoso de loja. */
const NeonCard: React.FC<NeonCardProps> = ({ tubeAt, lettersAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = ramp(frame, 0, SHRINK_SECONDS * fps);
  const width = mix(WIDTH * 1.1, SIGN.width, shrink);
  const height = mix(HEIGHT * 1.1, SIGN.height, shrink);
  const board = interpolateColors(shrink, [0, 1], [shop.lit.glass, neon.board]);
  const tube = ramp(frame, tubeAt, TUBE_SECONDS * fps);
  const flicker = 0.9 + 0.1 * wave(frame / fps, 0.9);

  return (
    <AbsoluteFill>
      <Camera>
        <ShopStreet time="night" ground={1010} orb={[300, 150]} />
      </Camera>
      <SvgLayer>
        {/* Os suportes que prendem o letreiro. */}
        {shrink >= 1
          ? [-0.3, 0.3].map((at) => (
              <rect
                key={at}
                x={SIGN.x + SIGN.width * at - 12}
                y={SIGN.y + SIGN.height / 2}
                width={24}
                height={1010 - SIGN.y - SIGN.height / 2}
                fill={neon.board}
              />
            ))
          : null}
        <rect
          x={SIGN.x - width / 2}
          y={SIGN.y - height / 2}
          width={width}
          height={height}
          rx={60 * shrink}
          fill={board}
        />
        {/* O tubo: um traço largo e saturado, com o miolo quase branco. */}
        {tube > 0 ? (
          <g
            style={{ filter: `drop-shadow(0 0 18px ${neon.tube})` }}
            opacity={tube * flicker}
          >
            <rect
              x={SIGN.x - SIGN.width / 2 + 34}
              y={SIGN.y - SIGN.height / 2 + 34}
              width={SIGN.width - 68}
              height={SIGN.height - 68}
              rx={40}
              fill="none"
              stroke={neon.tube}
              strokeWidth={16}
            />
            <rect
              x={SIGN.x - SIGN.width / 2 + 34}
              y={SIGN.y - SIGN.height / 2 + 34}
              width={SIGN.width - 68}
              height={SIGN.height - 68}
              rx={40}
              fill="none"
              stroke={neon.tubeCore}
              strokeWidth={5}
            />
          </g>
        ) : null}
      </SvgLayer>
      {shrink >= 1 ? (
        <Place x={SIGN.x} y={SIGN.y}>
          <div style={{ filter: `drop-shadow(0 0 20px ${neon.glow})` }}>
            <Label size="headline" color={neon.text}>
              {Array.from(TITLE).map((letter, index) => (
                <span
                  key={index}
                  style={{
                    // Cada letra acende na sua vez; apagada, fica só um vestígio.
                    opacity:
                      frame >= lettersAt + index * LETTER_FRAMES
                        ? flicker
                        : 0.15,
                  }}
                >
                  {letter}
                </span>
              ))}
            </Label>
          </div>
        </Place>
      ) : null}
      <Grain />
    </AbsoluteFill>
  );
};

export const AlmostEscapedScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const panAt = cue(scene, "Será");
  const bloomAt = shots[0].to - BLOOM_SECONDS * fps;
  return (
    <>
      <Shot range={shots[0]} name="a única vitrine acesa">
        <PanShot
          panAt={panAt}
          panFrames={cue(scene, "aberto") - panAt}
          bloomAt={bloomAt}
        />
      </Shot>
      <Shot range={shots[1]} name="cartela: ninguém escapou">
        <NeonCard
          tubeAt={SHRINK_SECONDS * fps + 2}
          lettersAt={cue(scene, "chegaram") - shots[1].from}
        />
      </Shot>
    </>
  );
};
