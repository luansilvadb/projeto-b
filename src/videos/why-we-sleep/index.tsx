import { parseScript } from "../../narration/script";
import { narratedVideoMetadata } from "../../video/metadata";
import {
  NarratedVideo,
  type NarratedVideoProps,
  type SceneProps,
} from "../../video/NarratedVideo";
import script from "./script.json";

const whyWeSleepScript = parseScript(script);

// As chaves são os "id" das cenas em script.json. O roteiro foi reescrito do
// zero (oitava versão) e as cenas das versões anteriores saíram: cada cena
// nova entra aqui quando for composta no animatic. Enquanto faltar uma, o
// Studio e o render param com "está no roteiro, mas não tem componente".
const scenes: Readonly<Record<string, React.FC<SceneProps>>> = {};

export const whyWeSleepMetadata = narratedVideoMetadata(
  "why-we-sleep",
  whyWeSleepScript,
);

export const WhyWeSleep: React.FC<NarratedVideoProps> = (props) => (
  <NarratedVideo {...props} script={whyWeSleepScript} scenes={scenes} />
);
