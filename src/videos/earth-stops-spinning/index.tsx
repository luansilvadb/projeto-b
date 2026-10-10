import { parseScript } from "../../narration/script";
import { narratedVideoMetadata } from "../../video/metadata";
import {
  NarratedVideo,
  type NarratedVideoProps,
  type SceneProps,
} from "../../video/NarratedVideo";
import { AfterTheDustScene } from "./scenes/AfterTheDustScene";
import { AnotherPlanetScene } from "./scenes/AnotherPlanetScene";
import { ByLatitudeScene } from "./scenes/ByLatitudeScene";
import { CoralsScene } from "./scenes/CoralsScene";
import { EarthquakeScene } from "./scenes/EarthquakeScene";
import { FeelNothingScene } from "./scenes/FeelNothingScene";
import { HowFastScene } from "./scenes/HowFastScene";
import { MagneticFieldScene } from "./scenes/MagneticFieldScene";
import { MapLimitScene } from "./scenes/MapLimitScene";
import { NeverScene } from "./scenes/NeverScene";
import { NewMapScene } from "./scenes/NewMapScene";
import { NotTheMoonScene } from "./scenes/NotTheMoonScene";
import { NotToSpaceScene } from "./scenes/NotToSpaceScene";
import { OneTurnScene } from "./scenes/OneTurnScene";
import { OnlyClueScene } from "./scenes/OnlyClueScene";
import { SeaMovesScene } from "./scenes/SeaMovesScene";
import { StillSpinningScene } from "./scenes/StillSpinningScene";
import { StraightWindScene } from "./scenes/StraightWindScene";
import { SubscribeScene } from "./scenes/SubscribeScene";
import { SwitchOffScene } from "./scenes/SwitchOffScene";
import { TheBulgeScene } from "./scenes/TheBulgeScene";
import { TheMoonBrakeScene } from "./scenes/TheMoonBrakeScene";
import { TheMoonCaseScene } from "./scenes/TheMoonCaseScene";
import { ThePoleScene } from "./scenes/ThePoleScene";
import { TheRuleScene } from "./scenes/TheRuleScene";
import { TwoOceansScene } from "./scenes/TwoOceansScene";
import { WaterLeavesScene } from "./scenes/WaterLeavesScene";
import { WaterPiledScene } from "./scenes/WaterPiledScene";
import { WhatSpinDoesScene } from "./scenes/WhatSpinDoesScene";
import { WhyNotStopScene } from "./scenes/WhyNotStopScene";
import { WindScene } from "./scenes/WindScene";
import { YearLongDayScene } from "./scenes/YearLongDayScene";
import { YouTooScene } from "./scenes/YouTooScene";
import script from "./script.json";

const earthStopsSpinningScript = parseScript(script);

// As chaves são os "id" das cenas em script.json. Todo plano entra por corte:
// as passagens que o roteiro pede (câmera, transformação) são feitas dentro
// do plano que chega. O selo da fonte vai no plano que afirma o que o estudo
// mediu, e não na cena inteira.
const scenes: Readonly<Record<string, React.FC<SceneProps>>> = {
  "one-turn": OneTurnScene,
  "what-spin-does": WhatSpinDoesScene,
  "switch-off": SwitchOffScene,
  "how-fast": HowFastScene,
  "feel-nothing": FeelNothingScene,
  "by-latitude": ByLatitudeScene,
  "the-rule": TheRuleScene,
  wind: WindScene,
  "sea-moves": SeaMovesScene,
  "you-too": YouTooScene,
  "not-to-space": NotToSpaceScene,
  "the-pole": ThePoleScene,
  "after-the-dust": AfterTheDustScene,
  "the-bulge": TheBulgeScene,
  "water-piled": WaterPiledScene,
  "water-leaves": WaterLeavesScene,
  "two-oceans": TwoOceansScene,
  "new-map": NewMapScene,
  "map-limit": MapLimitScene,
  "year-long-day": YearLongDayScene,
  "the-moon-case": TheMoonCaseScene,
  "not-the-moon": NotTheMoonScene,
  "straight-wind": StraightWindScene,
  "magnetic-field": MagneticFieldScene,
  "why-not-stop": WhyNotStopScene,
  "another-planet": AnotherPlanetScene,
  earthquake: EarthquakeScene,
  "the-moon-brake": TheMoonBrakeScene,
  corals: CoralsScene,
  never: NeverScene,
  "still-spinning": StillSpinningScene,
  "only-clue": OnlyClueScene,
  subscribe: SubscribeScene,
};

export const earthStopsSpinningMetadata = narratedVideoMetadata(
  "earth-stops-spinning",
  earthStopsSpinningScript,
);

export const EarthStopsSpinning: React.FC<NarratedVideoProps> = (props) => (
  <NarratedVideo {...props} script={earthStopsSpinningScript} scenes={scenes} />
);
