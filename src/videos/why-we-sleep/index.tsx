import { parseScript } from "../../narration/script";
import { narratedVideoMetadata } from "../../video/metadata";
import {
  NarratedVideo,
  type NarratedVideoProps,
  type SceneProps,
} from "../../video/NarratedVideo";
import { AlmostEscapedScene } from "./scenes/AlmostEscapedScene";
import { AwakeRecordScene } from "./scenes/AwakeRecordScene";
import { BadIdeaScene } from "./scenes/BadIdeaScene";
import { BiggestMistakeScene } from "./scenes/BiggestMistakeScene";
import { ButWhatScene } from "./scenes/ButWhatScene";
import { CleaningDisputeScene } from "./scenes/CleaningDisputeScene";
import { CleaningScene } from "./scenes/CleaningScene";
import { ElephantsScene } from "./scenes/ElephantsScene";
import { FrigatebirdScene } from "./scenes/FrigatebirdScene";
import { HalfBrainScene } from "./scenes/HalfBrainScene";
import { JellyfishNightScene } from "./scenes/JellyfishNightScene";
import { JellyfishPulseScene } from "./scenes/JellyfishPulseScene";
import { JellyfishSleepsScene } from "./scenes/JellyfishSleepsScene";
import { LastToKnowScene } from "./scenes/LastToKnowScene";
import { ManyReasonsScene } from "./scenes/ManyReasonsScene";
import { MaybeBrainScene } from "./scenes/MaybeBrainScene";
import { NightFallsScene } from "./scenes/NightFallsScene";
import { NobodyEscapedScene } from "./scenes/NobodyEscapedScene";
import { NoneZeroedScene } from "./scenes/NoneZeroedScene";
import { OlderThanBrainScene } from "./scenes/OlderThanBrainScene";
import { RatsAwakeScene } from "./scenes/RatsAwakeScene";
import { RatsControlScene } from "./scenes/RatsControlScene";
import { RatsQuestionScene } from "./scenes/RatsQuestionScene";
import { RecordClosedScene } from "./scenes/RecordClosedScene";
import { ShelvesScene } from "./scenes/ShelvesScene";
import { ShelvesSparedScene } from "./scenes/ShelvesSparedScene";
import { ShouldHaveScene } from "./scenes/ShouldHaveScene";
import { SleepDebtScene } from "./scenes/SleepDebtScene";
import { SoFarScene } from "./scenes/SoFarScene";
import { StillLookingScene } from "./scenes/StillLookingScene";
import { StockroomScene } from "./scenes/StockroomScene";
import { StockroomSolidScene } from "./scenes/StockroomSolidScene";
import { ThirdOfLifeScene } from "./scenes/ThirdOfLifeScene";
import { ThreeAnswersScene } from "./scenes/ThreeAnswersScene";
import { ThreeSignsScene } from "./scenes/ThreeSignsScene";
import { TonightScene } from "./scenes/TonightScene";
import { UnknownCauseScene } from "./scenes/UnknownCauseScene";
import { WhySleepScene } from "./scenes/WhySleepScene";
import { withSource } from "./parts/SourceSeal";
import script from "./script.json";

const whyWeSleepScript = parseScript(script);

// As chaves são os "id" das cenas em script.json.
const scenes: Readonly<Record<string, React.FC<SceneProps>>> = {
  "third-of-life": ThirdOfLifeScene,
  "still-looking": StillLookingScene,
  "bad-idea": BadIdeaScene,
  "night-falls": NightFallsScene,
  "last-to-know": LastToKnowScene,
  "sleep-debt": SleepDebtScene,
  "biggest-mistake": BiggestMistakeScene,
  "should-have": ShouldHaveScene,
  "almost-escaped": AlmostEscapedScene,
  elephants: ElephantsScene,
  frigatebird: FrigatebirdScene,
  "half-brain": HalfBrainScene,
  "none-zeroed": NoneZeroedScene,
  "maybe-brain": MaybeBrainScene,
  "jellyfish-pulse": JellyfishPulseScene,
  "jellyfish-night": JellyfishNightScene,
  "jellyfish-sleeps": JellyfishSleepsScene,
  "three-signs": ThreeSignsScene,
  "older-than-brain": OlderThanBrainScene,
  "rats-question": RatsQuestionScene,
  "rats-awake": RatsAwakeScene,
  "rats-control": RatsControlScene,
  "unknown-cause": UnknownCauseScene,
  "awake-record": AwakeRecordScene,
  "record-closed": RecordClosedScene,
  "so-far": SoFarScene,
  "but-what": ButWhatScene,
  "three-answers": ThreeAnswersScene,
  stockroom: StockroomScene,
  "stockroom-solid": StockroomSolidScene,
  shelves: ShelvesScene,
  "shelves-spared": ShelvesSparedScene,
  cleaning: CleaningScene,
  "cleaning-dispute": CleaningDisputeScene,
  "many-reasons": ManyReasonsScene,
  "why-sleep": WhySleepScene,
  "nobody-escaped": NobodyEscapedScene,
  tonight: TonightScene,
};

// A fonte de cada cena que afirma o que um estudo mediu: autor e ano, como em research.md.
const SOURCES: Readonly<Record<string, string>> = {
  "third-of-life": "Watson et al., 2015",
  "sleep-debt": "Cirelli e Tononi, 2008",
  "almost-escaped": "Watson et al., 2015",
  elephants: "Gravett et al., 2017",
  frigatebird: "Rattenborg et al., 2016",
  "half-brain": "Mascetti, 2016",
  "jellyfish-pulse": "Nath et al., 2017",
  "jellyfish-night": "Nath et al., 2017",
  "jellyfish-sleeps": "Nath et al., 2017",
  "three-signs": "Nath et al., 2017",
  "older-than-brain": "Nath et al., 2017",
  "rats-awake": "Everson et al., 1989",
  "rats-control": "Everson et al., 1989",
  "unknown-cause": "Everson et al., 1989",
  "awake-record": "NPR, 2024",
  "record-closed": "NPR, 2024",
  "three-answers": "Frank e Heller, 2019",
  stockroom: "Rasch e Born, 2013",
  "stockroom-solid": "Rasch e Born, 2013",
  shelves: "de Vivo et al., 2017",
  "shelves-spared": "de Vivo et al., 2017",
  cleaning: "Xie et al., 2013",
  "cleaning-dispute": "Xie et al., 2013 · Miao et al., 2024",
  "many-reasons": "Frank e Heller, 2019",
  tonight: "Watson et al., 2015",
};

// Os planos que dividem o palco com o anterior: os elementos saem e entram,
// e o que os dois têm em comum (a régua das horas, o céu) nunca sai da tela.
// O plano 0 é a entrada da cena. É o padrão do vídeo inteiro (decisão do
// usuário). Ficam de fora só a abertura, a entrada depois da vinheta e os
// planos que continuam o anterior sem corte nenhum, com a mesma câmera.
const JOINED = {
  "third-of-life": [1],
  "still-looking": [0, 1],
  // O terceiro plano é o segundo, igual, com a noite caindo: não há o que trocar.
  "bad-idea": [0, 1],
  "sleep-debt": [0, 1],
  "biggest-mistake": [0, 1, 2],
  "should-have": [0, 1, 2],
  "almost-escaped": [0],
  elephants: [0, 1, 2],
  frigatebird: [0, 1, 2],
  "half-brain": [0, 1, 2],
  "none-zeroed": [0],
  "maybe-brain": [0],
  "jellyfish-pulse": [0, 1],
  "jellyfish-night": [0, 1, 2],
  "jellyfish-sleeps": [0, 1],
  "three-signs": [0, 1],
  "older-than-brain": [0, 1],
  "rats-question": [0],
  "rats-awake": [0, 1],
  "rats-control": [0],
  "unknown-cause": [0],
  "awake-record": [0, 1],
  "record-closed": [0, 1, 2],
  "so-far": [0],
  "but-what": [0, 1],
  "three-answers": [0, 1],
  stockroom: [0, 1, 2],
  "stockroom-solid": [0],
  shelves: [0, 1],
  "shelves-spared": [0, 1, 2],
  cleaning: [0, 1, 2, 3],
  "cleaning-dispute": [0, 1, 2],
  "many-reasons": [0],
  "why-sleep": [0, 1],
  "nobody-escaped": [0, 1],
  tonight: [0, 1, 2, 3, 4],
};

// O cenário de cada plano. Planos seguidos com o mesmo nome dividem o palco
// sem desmontar o cenário: ele fica, e a câmera e a luz continuam de onde
// estavam. Os planos de fundo liso, e os que não estão aqui, não têm cenário.
const SETS = {
  "night-falls": ["savanna", "savanna"],
  "last-to-know": ["savanna"],
  "sleep-debt": ["savanna", "savanna"],
  elephants: ["savanna", "savanna", "savanna"],
  frigatebird: ["sky", "sky", "sky"],
  "half-brain": ["sea", null, "sea"],
  "jellyfish-pulse": ["lagoon-day", null],
  "jellyfish-night": ["lagoon-night", "lab", "lab"],
  "jellyfish-sleeps": ["lab", "lagoon-day"],
  "three-signs": ["lagoon-night", null],
  "rats-question": ["lab"],
  "rats-awake": ["lab", "lab"],
  "rats-control": ["lab"],
  "but-what": ["street-night", "street-night"],
  "three-answers": [null, "street-day"],
  stockroom: ["street-day", null, "shop"],
  "shelves-spared": [null, "shop", "shop"],
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
  <NarratedVideo
    {...props}
    script={whyWeSleepScript}
    scenes={sourcedScenes}
    joined={JOINED}
    sets={SETS}
  />
);
