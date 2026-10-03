import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Shop, shopHeight } from "../../../art/Shop";
import { Sfx } from "../../../audio/Sfx";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette, shape } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { LivingJellyfish } from "../parts/LivingJellyfish";
import { Stage } from "../parts/Stage";
import { cue, PULSES_ASLEEP, ramp } from "../parts/timing";

const JELLYFISH = { x: 480, y: 520, size: 520 };
const SHOP = { x: 1260, groundY: 900, large: 640, tiny: 220 };

export const TinyShopScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nervesAppear = cue(scene, "nervos");
  const shrink = ramp(frame, cue(scene, "minúscula"), 0.8 * fps);
  const shopWidth = interpolate(shrink, [0, 1], [SHOP.large, SHOP.tiny]);
  const height = shopHeight(shopWidth);

  return (
    <Stage scene={scene}>
      <Sfx name="shutterDown" from={cue(scene, "fecha")} />
      <Place x={JELLYFISH.x} y={JELLYFISH.y}>
        <LivingJellyfish
          size={JELLYFISH.size}
          rhythm={PULSES_ASLEEP}
          nerves={ramp(frame, nervesAppear, 0.6 * fps)}
        />
      </Place>
      <Place x={JELLYFISH.x} y={880}>
        <Appear at={nervesAppear}>
          <Label size="note" tag={palette.accent.base}>
            nervos, sem cérebro
          </Label>
        </Appear>
      </Place>
      {/* O depósito dos fundos, que a loja minúscula não tem. */}
      <div
        style={{
          position: "absolute",
          left: SHOP.x + shopWidth / 2 - 30,
          top: SHOP.groundY - height * 0.55,
          width: shopWidth * 0.4,
          height: height * 0.55,
          boxSizing: "border-box",
          background: palette.dusk,
          border: `${shape.stroke.thin}px solid ${palette.mist}`,
          borderRadius: shape.tagRadius,
          opacity: 1 - shrink,
        }}
      />
      <Place x={SHOP.x} y={SHOP.groundY - height / 2}>
        <Shop
          width={shopWidth}
          shutter={ramp(frame, cue(scene, "fecha"), 0.7 * fps)}
          lit={1 - ramp(frame, cue(scene, "fecha"), 0.7 * fps)}
        />
      </Place>
    </Stage>
  );
};
