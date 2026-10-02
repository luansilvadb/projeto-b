import { parseScript } from "../../narration/script";
import { narratedVideoMetadata } from "../../video/metadata";
import {
  NarratedVideo,
  type NarratedVideoProps,
} from "../../video/NarratedVideo";
import { DistanceScene } from "./scenes/DistanceScene";
import { SpeedScene } from "./scenes/SpeedScene";
import { SunScene } from "./scenes/SunScene";
import script from "./script.json";

// As chaves são os "id" das cenas em script.json.
const scenes = {
  sun: SunScene,
  distance: DistanceScene,
  speed: SpeedScene,
};

export const demoMetadata = narratedVideoMetadata("demo", parseScript(script));

export const Demo: React.FC<NarratedVideoProps> = (props) => (
  <NarratedVideo {...props} scenes={scenes} />
);
