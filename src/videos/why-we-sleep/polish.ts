import { getInputProps } from "remotion";

/**
 * O piloto do polimento: com `--props='{"polish":true}'` no render, as cenas
 * que já foram ligadas a ele usam a construção nova da elefanta, da pessoa e
 * da savana. Sem a propriedade, o vídeo é o do animatic aprovado. Sai daqui
 * quando o usuário aprovar a adoção e o acabamento virar o desenho de sempre.
 */
export const polished = (): boolean => getInputProps().polish === true;
