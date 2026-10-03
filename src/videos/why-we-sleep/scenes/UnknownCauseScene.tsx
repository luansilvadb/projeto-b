import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { RatRow } from "../parts/RatRow";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";
import { FADED_RAT } from "./RatsDeclineScene";

// Do experimento ao estudo que ainda descreve a causa como desconhecida.
const YEARS = [1989, 2020];

export const UnknownCauseScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const decadesPass = cue(scene, "Décadas");

  return (
    <Stage scene={scene} grave>
      <Place x={width / 2} y={300}>
        <Appear at={cue(scene, "causa")}>
          <Label size="display">?</Label>
        </Appear>
      </Place>
      <RatRow y={560} color={palette.sun.light} opacity={() => FADED_RAT} />
      <Place x={width / 2} y={820}>
        <Label size="headline">
          {Math.round(
            interpolate(frame, [decadesPass, decadesPass + fps], YEARS, {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          )}
        </Label>
      </Place>
    </Stage>
  );
};
