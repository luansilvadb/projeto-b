import { getInputProps } from "remotion";
import type { ElephantFinish } from "../../art/Elephant";
import { elephantFinish } from "./palette";

/**
 * O piloto do polimento: com `--props='{"polish":true}'` no render, as cenas
 * que já foram ligadas a ele usam a construção nova da elefanta, da pessoa e
 * da savana. Sem a propriedade, o vídeo é o do animatic aprovado. Sai daqui
 * quando o usuário aprovar a adoção e o acabamento virar o desenho de sempre.
 */
export const polished = (): boolean => getInputProps().polish === true;

/** O acabamento da elefanta de dia, para as cenas que a desenham fora da manada; sem o piloto, nenhum. */
export const elephantPolish = (): ElephantFinish | undefined =>
  polished() ? elephantFinish : undefined;
