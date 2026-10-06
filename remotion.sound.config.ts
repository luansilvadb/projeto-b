/**
 * A configuração do `pnpm sound`, que renderiza só o som de um vídeo. A de
 * `remotion.config.ts` fixa o codec h264 e um preset do x264, e com eles o
 * Remotion recusa uma saída em mp3.
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);
