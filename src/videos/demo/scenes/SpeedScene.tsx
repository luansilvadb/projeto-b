import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Earth } from "../../../art/Earth";
import { LightPulse } from "../../../art/LightPulse";
import { Appear } from "../../../components/Appear";
import { Backdrop } from "../../../components/Backdrop";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { StarField } from "../../../components/StarField";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";
import { cueFrame } from "../../../narration/timeline";
import type { SceneProps } from "../../../video/NarratedVideo";

const EARTH = { x: 520, y: 560, radius: 210 };
const ORBIT = { rx: 350, ry: 105, tiltDegrees: -16 };
const LAPS_PER_SECOND = 0.9;

/** Posição na órbita inclinada, para um ângulo em radianos. */
const orbitPoint = (angle: number) => {
  const tilt = (ORBIT.tiltDegrees * Math.PI) / 180;
  const x = ORBIT.rx * Math.cos(angle);
  const y = ORBIT.ry * Math.sin(angle);
  return {
    x: EARTH.x + x * Math.cos(tilt) - y * Math.sin(tilt),
    y: EARTH.y + x * Math.sin(tilt) + y * Math.cos(tilt),
  };
};

const OrbitRing: React.FC<{ readonly half: "back" | "front" }> = ({ half }) => {
  const start = orbitPoint(Math.PI);
  const end = orbitPoint(0);
  // Na tela, a metade de trás da órbita é o arco de cima da elipse; a da frente, o de baixo.
  const sweep = half === "back" ? 1 : 0;

  return (
    <SvgLayer>
      <path
        d={`M ${start.x} ${start.y} A ${ORBIT.rx} ${ORBIT.ry} ${ORBIT.tiltDegrees} 0 ${sweep} ${end.x} ${end.y}`}
        fill="none"
        stroke={palette.mist}
        strokeWidth={shape.stroke.thin}
        strokeDasharray="2 20"
        strokeLinecap="round"
        opacity={0.6}
      />
    </SvgLayer>
  );
};

export const SpeedScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const seconds = frame / fps;
  const angle = seconds * LAPS_PER_SECOND * 2 * Math.PI;
  const pulse = orbitPoint(angle);
  // Com o seno positivo o ponto está na metade de baixo da elipse: à frente do planeta.
  const pulseInFront = Math.sin(angle) > 0;
  const speedAppears = cueFrame(scene, "trezentos");
  const lapsAppear = cueFrame(scene, "sete");
  const lightPulse = (
    <Place x={pulse.x} y={pulse.y}>
      <LightPulse radius={14} />
    </Place>
  );

  return (
    <AbsoluteFill>
      <Backdrop />
      <StarField seed="speed" />
      <OrbitRing half="back" />
      {pulseInFront ? null : lightPulse}
      <Place x={EARTH.x} y={EARTH.y}>
        <Earth radius={EARTH.radius} spin={seconds * 0.04} />
      </Place>
      <OrbitRing half="front" />
      {pulseInFront ? lightPulse : null}
      <Place x={1420} y={450}>
        <Appear at={speedAppears}>
          <Label size="headline">300.000 km/s</Label>
        </Appear>
      </Place>
      <Place x={1420} y={620}>
        <Appear at={lapsAppear}>
          <Label size="note" tag={palette.accent.base}>
            7,5 voltas por segundo
          </Label>
        </Appear>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};
