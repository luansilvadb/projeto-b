import { parseScript } from "../../narration/script";
import { narratedVideoMetadata } from "../../video/metadata";
import {
  NarratedVideo,
  type NarratedVideoProps,
  type SceneProps,
} from "../../video/NarratedVideo";
import { withSource } from "./parts/SourceSeal";
import { AwakeRecordScene } from "./scenes/AwakeRecordScene";
import { BiggestMistakeScene } from "./scenes/BiggestMistakeScene";
import { ButWhatScene } from "./scenes/ButWhatScene";
import { DebtReturnsScene } from "./scenes/DebtReturnsScene";
import { DebtTestScene } from "./scenes/DebtTestScene";
import { ElephantAwakeScene } from "./scenes/ElephantAwakeScene";
import { ElephantVerdictScene } from "./scenes/ElephantVerdictScene";
import { ElephantsScene } from "./scenes/ElephantsScene";
import { FivePartsScene } from "./scenes/FivePartsScene";
import { ForcedAwakeScene } from "./scenes/ForcedAwakeScene";
import { GardnerHoursScene } from "./scenes/GardnerHoursScene";
import { GardnerSleepsScene } from "./scenes/GardnerSleepsScene";
import { JellyfishDebtScene } from "./scenes/JellyfishDebtScene";
import { JellyfishNightScene } from "./scenes/JellyfishNightScene";
import { JellyfishPlatformScene } from "./scenes/JellyfishPlatformScene";
import { JellyfishScene } from "./scenes/JellyfishScene";
import { LastToKnowScene } from "./scenes/LastToKnowScene";
import { MaybeBrainScene } from "./scenes/MaybeBrainScene";
import { MemoryResultScene } from "./scenes/MemoryResultScene";
import { MemoryTestScene } from "./scenes/MemoryTestScene";
import { NightFallsScene } from "./scenes/NightFallsScene";
import { NobodyEscapedScene } from "./scenes/NobodyEscapedScene";
import { OlderThanBrainScene } from "./scenes/OlderThanBrainScene";
import { OneOfThemScene } from "./scenes/OneOfThemScene";
import { RatsDiscScene } from "./scenes/RatsDiscScene";
import { RatsResultScene } from "./scenes/RatsResultScene";
import { SkipANightScene } from "./scenes/SkipANightScene";
import { SleepDebtScene } from "./scenes/SleepDebtScene";
import { SleepLessScene } from "./scenes/SleepLessScene";
import { SoFarScene } from "./scenes/SoFarScene";
import { StillUnknownScene } from "./scenes/StillUnknownScene";
import { StockroomNightScene } from "./scenes/StockroomNightScene";
import { StockroomScene } from "./scenes/StockroomScene";
import { StockroomSolidScene } from "./scenes/StockroomSolidScene";
import { SubscribeScene } from "./scenes/SubscribeScene";
import { TheQuestionScene } from "./scenes/TheQuestionScene";
import { ThirdOfLifeScene } from "./scenes/ThirdOfLifeScene";
import { TimeToFixScene } from "./scenes/TimeToFixScene";
import { TonightScene } from "./scenes/TonightScene";
import { TwoHoursScene } from "./scenes/TwoHoursScene";
import { UnknownCauseScene } from "./scenes/UnknownCauseScene";
import { WhatItIsScene } from "./scenes/WhatItIsScene";
import script from "./script.json";

const whyWeSleepScript = parseScript(script);

// As chaves são os "id" das cenas em script.json.
const scenes: Readonly<Record<string, React.FC<SceneProps>>> = {
  "third-of-life": ThirdOfLifeScene,
  "biggest-mistake": BiggestMistakeScene,
  "time-to-fix": TimeToFixScene,
  "the-question": TheQuestionScene,
  "five-parts": FivePartsScene,
  "night-falls": NightFallsScene,
  "last-to-know": LastToKnowScene,
  "skip-a-night": SkipANightScene,
  "sleep-debt": SleepDebtScene,
  "debt-test": DebtTestScene,
  "debt-returns": DebtReturnsScene,
  "sleep-less": SleepLessScene,
  elephants: ElephantsScene,
  "two-hours": TwoHoursScene,
  "elephant-awake": ElephantAwakeScene,
  "elephant-verdict": ElephantVerdictScene,
  "maybe-brain": MaybeBrainScene,
  jellyfish: JellyfishScene,
  "jellyfish-night": JellyfishNightScene,
  "jellyfish-platform": JellyfishPlatformScene,
  "jellyfish-debt": JellyfishDebtScene,
  "older-than-brain": OlderThanBrainScene,
  "forced-awake": ForcedAwakeScene,
  "rats-disc": RatsDiscScene,
  "rats-result": RatsResultScene,
  "unknown-cause": UnknownCauseScene,
  "awake-record": AwakeRecordScene,
  "gardner-hours": GardnerHoursScene,
  "gardner-sleeps": GardnerSleepsScene,
  "so-far": SoFarScene,
  "but-what": ButWhatScene,
  "memory-test": MemoryTestScene,
  "memory-result": MemoryResultScene,
  stockroom: StockroomScene,
  "stockroom-night": StockroomNightScene,
  "stockroom-solid": StockroomSolidScene,
  "nobody-escaped": NobodyEscapedScene,
  "one-of-them": OneOfThemScene,
  "still-unknown": StillUnknownScene,
  "what-it-is": WhatItIsScene,
  tonight: TonightScene,
  subscribe: SubscribeScene,
};

// A fonte de cada cena que afirma o que um estudo mediu: autor e ano, como em
// research.md e como a encenação dos planos pede em script.json. A cena com
// mais de uma fonte leva as duas, separadas por um ponto.
const SOURCES: Readonly<Record<string, string>> = {
  "time-to-fix": "Pappas, 2023",
  "skip-a-night": "Cirelli e Tononi, 2008",
  "sleep-debt": "Cirelli e Tononi, 2008",
  "debt-test": "Cirelli e Tononi, 2008",
  elephants: "Gravett et al., 2017",
  "two-hours": "Gravett et al., 2017",
  "elephant-awake": "Gravett et al., 2017",
  "elephant-verdict": "Gravett et al., 2017",
  jellyfish: "Nath et al., 2017",
  "jellyfish-night": "Nath et al., 2017",
  "jellyfish-platform": "Nath et al., 2017",
  "jellyfish-debt": "Nath et al., 2017",
  "older-than-brain": "Nath et al., 2017 · Pappas, 2023",
  "forced-awake": "Everson et al., 1989",
  "rats-disc": "Everson et al., 1989",
  "rats-result": "Everson et al., 1989",
  "unknown-cause": "Everson et al., 1989 · Cirelli e Tononi, 2008",
  "awake-record": "NPR, 2024",
  "gardner-hours": "NPR, 2024",
  "gardner-sleeps": "NPR, 2024 · Cirelli e Tononi, 2008",
  "so-far": "Cirelli e Tononi, 2008",
  "but-what": "Rasch e Born, 2013",
  "memory-test": "Jenkins e Dallenbach, 1924, em Rasch e Born, 2013",
  "memory-result": "Jenkins e Dallenbach, 1924, em Rasch e Born, 2013",
  "stockroom-night": "Rasch e Born, 2013",
  "stockroom-solid": "Rasch e Born, 2013",
  "nobody-escaped": "Pappas, 2023 · Cirelli e Tononi, 2008",
  "still-unknown": "Nath et al., 2017",
  "what-it-is": "Nath et al., 2017 · Pappas, 2023",
};

// Cada cena com fonte ganha o selo no canto, do começo ao fim.
const sourcedScenes = Object.fromEntries(
  Object.entries(scenes).map(([id, Scene]) => [
    id,
    SOURCES[id] ? withSource(Scene, SOURCES[id]) : Scene,
  ]),
);

export const whyWeSleepMetadata = narratedVideoMetadata(
  "why-we-sleep",
  whyWeSleepScript,
);

export const WhyWeSleep: React.FC<NarratedVideoProps> = (props) => (
  <NarratedVideo {...props} script={whyWeSleepScript} scenes={sourcedScenes} />
);
