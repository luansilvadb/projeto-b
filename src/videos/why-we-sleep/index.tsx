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

// Os planos que dividem o palco com o anterior: os elementos saem e entram,
// e o que os dois têm em comum nunca sai da tela. O plano 0 é a entrada da
// cena. É o padrão do vídeo inteiro (decisão do usuário, na partitura de
// score.md). Ficam de fora a abertura, a entrada depois da vinheta, o corte
// de verdade depois do predador (a vigília abre com o bicho já em pé, para
// ele não levantar logo depois de "você demora a perceber") e os planos que
// já fazem a própria transformação por dentro.
const JOINED = {
  "third-of-life": [1],
  "biggest-mistake": [0, 1, 2, 3],
  "time-to-fix": [0, 1, 2],
  "the-question": [0],
  "five-parts": [1, 2, 3],
  "night-falls": [0, 1, 2],
  "last-to-know": [0],
  "skip-a-night": [1],
  "sleep-debt": [0, 1],
  "debt-test": [0, 1],
  "debt-returns": [0, 1],
  "sleep-less": [1],
  elephants: [0, 1, 2, 3],
  "two-hours": [0, 1],
  "elephant-awake": [0, 1],
  "elephant-verdict": [0, 1, 2, 3],
  "maybe-brain": [0, 1, 2, 3],
  jellyfish: [0, 1, 2],
  "jellyfish-night": [0, 1, 2],
  "jellyfish-platform": [0, 1, 2],
  "jellyfish-debt": [0, 1, 2],
  "older-than-brain": [0, 1, 2],
  "forced-awake": [0, 2, 3],
  "rats-disc": [0, 1, 2],
  "rats-result": [0, 1, 2],
  "unknown-cause": [0, 1],
  "awake-record": [0, 1, 2, 3],
  "gardner-hours": [0, 1],
  "gardner-sleeps": [0, 1, 2, 3, 4],
  "so-far": [0, 1, 2, 3, 4],
  "but-what": [0, 2],
  "memory-test": [0, 1],
  "memory-result": [0, 1, 2],
  stockroom: [0, 2],
  "stockroom-night": [1, 2],
  "stockroom-solid": [0, 1],
  "nobody-escaped": [0, 1],
  "one-of-them": [0, 1],
  "still-unknown": [0, 1],
  "what-it-is": [0, 1],
  tonight: [0, 1, 2, 3],
  subscribe: [0, 1, 2, 3],
};

// O cenário de cada plano. Planos seguidos com o mesmo nome dividem o palco
// sem desmontar o cenário: ele fica, e a câmera e a luz continuam de onde
// estavam. Os planos de fundo liso, e os que não estão aqui, não têm cenário.
const SETS = {
  "five-parts": ["icons", "icons", "icons", "icons"],
  "night-falls": ["savanna", "savanna", "savanna"],
  "last-to-know": ["savanna"],
  "skip-a-night": ["savanna", "savanna"],
  "sleep-debt": ["savanna", null],
  "debt-returns": [null, "icons"],
  "sleep-less": ["icons", null],
  elephants: ["savanna", "savanna", "savanna", "savanna"],
  "two-hours": ["savanna", "savanna"],
  "elephant-awake": ["savanna", null],
  "elephant-verdict": ["savanna", "savanna", null, null],
  "maybe-brain": ["icons", "icons", null, null],
  jellyfish: ["lagoon", "lagoon", null],
  "jellyfish-night": ["lagoon", "lagoon", "tank"],
  "jellyfish-platform": ["tank", "tank", null],
  "jellyfish-debt": [null, "tank", "tank"],
  "older-than-brain": ["tank", null, null],
  "forced-awake": ["icons", null, "board", "board"],
  "rats-disc": ["bench", "bench", "bench"],
  "rats-result": ["bench", "bench", "bench"],
  "awake-record": [null, "room", "room", "room"],
  "gardner-hours": ["room", null],
  "so-far": ["icons", "icons", "icons", "icons", "icons"],
  "but-what": ["icons", "street", "street"],
  stockroom: [null, null, "shop"],
  "stockroom-night": ["shop", null, "shop"],
};

// Cada cena com fonte ganha o selo no canto, do começo ao fim. Quando a cena
// anterior do roteiro tem a mesma fonte, o selo fica: não entra de novo.
const sourcedScenes = Object.fromEntries(
  whyWeSleepScript.scenes.map(({ id }, index) => {
    const before = whyWeSleepScript.scenes[index - 1]?.id;
    const source = SOURCES[id];
    return [
      id,
      source
        ? withSource(
            scenes[id],
            source,
            before !== undefined && SOURCES[before] === source,
          )
        : scenes[id],
    ];
  }),
);

export const whyWeSleepMetadata = narratedVideoMetadata(
  "why-we-sleep",
  whyWeSleepScript,
);

export const WhyWeSleep: React.FC<NarratedVideoProps> = (props) => (
  <NarratedVideo
    {...props}
    script={whyWeSleepScript}
    scenes={sourcedScenes}
    joined={JOINED}
    sets={SETS}
  />
);
