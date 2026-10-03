import { parseScript } from "../../narration/script";
import { narratedVideoMetadata } from "../../video/metadata";
import {
  NarratedVideo,
  type NarratedVideoProps,
} from "../../video/NarratedVideo";
import { AllBrainsScene } from "./scenes/AllBrainsScene";
import { AlmostEscapedScene } from "./scenes/AlmostEscapedScene";
import { AlmostNoSleepScene } from "./scenes/AlmostNoSleepScene";
import { CleaningDisputeScene } from "./scenes/CleaningDisputeScene";
import { CleaningFlowScene } from "./scenes/CleaningFlowScene";
import { CleaningScene } from "./scenes/CleaningScene";
import { DolphinProblemScene } from "./scenes/DolphinProblemScene";
import { ElephantsAwakeScene } from "./scenes/ElephantsAwakeScene";
import { ElephantsScene } from "./scenes/ElephantsScene";
import { FiveSecondsScene } from "./scenes/FiveSecondsScene";
import { FloorTestScene } from "./scenes/FloorTestScene";
import { FlyingNapsScene } from "./scenes/FlyingNapsScene";
import { FrigatebirdScene } from "./scenes/FrigatebirdScene";
import { HalfBrainScene } from "./scenes/HalfBrainScene";
import { HalfShopScene } from "./scenes/HalfShopScene";
import { HonestWarningScene } from "./scenes/HonestWarningScene";
import { HydraScene } from "./scenes/HydraScene";
import { JellyfishNightScene } from "./scenes/JellyfishNightScene";
import { JellyfishPulseScene } from "./scenes/JellyfishPulseScene";
import { JellyfishSleepsScene } from "./scenes/JellyfishSleepsScene";
import { NeverClosesScene } from "./scenes/NeverClosesScene";
import { NoBrainScene } from "./scenes/NoBrainScene";
import { NotOptionalScene } from "./scenes/NotOptionalScene";
import { OlderThanAnswersScene } from "./scenes/OlderThanAnswersScene";
import { RatsControlScene } from "./scenes/RatsControlScene";
import { RatsDeclineScene } from "./scenes/RatsDeclineScene";
import { RatsQuestionScene } from "./scenes/RatsQuestionScene";
import { ShelvesScene } from "./scenes/ShelvesScene";
import { ShelvesSparedScene } from "./scenes/ShelvesSparedScene";
import { ShopClosesScene } from "./scenes/ShopClosesScene";
import { ShopWorksScene } from "./scenes/ShopWorksScene";
import { SleepCostScene } from "./scenes/SleepCostScene";
import { StockroomScene } from "./scenes/StockroomScene";
import { ThirtyNineScene } from "./scenes/ThirtyNineScene";
import { ThreeSignsScene } from "./scenes/ThreeSignsScene";
import { TinyShopScene } from "./scenes/TinyShopScene";
import { TonightScene } from "./scenes/TonightScene";
import { UnknownCauseScene } from "./scenes/UnknownCauseScene";
import { WhySleepScene } from "./scenes/WhySleepScene";
import script from "./script.json";

// As chaves são os "id" das cenas em script.json.
const scenes = {
  "jellyfish-pulse": JellyfishPulseScene,
  "jellyfish-night": JellyfishNightScene,
  "jellyfish-sleeps": JellyfishSleepsScene,
  "no-brain": NoBrainScene,
  "honest-warning": HonestWarningScene,
  "floor-test": FloorTestScene,
  "five-seconds": FiveSecondsScene,
  "three-signs": ThreeSignsScene,
  "sleep-cost": SleepCostScene,
  "shop-closes": ShopClosesScene,
  "almost-escaped": AlmostEscapedScene,
  elephants: ElephantsScene,
  "elephants-awake": ElephantsAwakeScene,
  "dolphin-problem": DolphinProblemScene,
  "half-brain": HalfBrainScene,
  "half-shop": HalfShopScene,
  frigatebird: FrigatebirdScene,
  "flying-naps": FlyingNapsScene,
  "almost-no-sleep": AlmostNoSleepScene,
  "never-closes": NeverClosesScene,
  "rats-question": RatsQuestionScene,
  "rats-control": RatsControlScene,
  "rats-decline": RatsDeclineScene,
  "unknown-cause": UnknownCauseScene,
  "not-optional": NotOptionalScene,
  "shop-works": ShopWorksScene,
  stockroom: StockroomScene,
  shelves: ShelvesScene,
  "shelves-spared": ShelvesSparedScene,
  cleaning: CleaningScene,
  "cleaning-flow": CleaningFlowScene,
  "cleaning-dispute": CleaningDisputeScene,
  "all-brains": AllBrainsScene,
  "tiny-shop": TinyShopScene,
  hydra: HydraScene,
  "why-sleep": WhySleepScene,
  "older-than-answers": OlderThanAnswersScene,
  tonight: TonightScene,
  "thirty-nine": ThirtyNineScene,
};

const whyWeSleepScript = parseScript(script);

export const whyWeSleepMetadata = narratedVideoMetadata(
  "why-we-sleep",
  whyWeSleepScript,
);

export const WhyWeSleep: React.FC<NarratedVideoProps> = (props) => (
  <NarratedVideo {...props} script={whyWeSleepScript} scenes={scenes} />
);
