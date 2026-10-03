import { framing } from "../../../components/Camera";
import { JELLYFISH_SPOT } from "./Lagoon";

/**
 * Os enquadramentos da lagoa, no mesmo cenário: a câmera vai de um a outro
 * sem nada ser redesenhado, e um plano pode começar onde o anterior parou.
 */
export const LAGOON = {
  /** De onde o vídeo abre: um pouco à direita e mais perto, deslizando até o aberto. */
  wideStart: framing([1180, 600], 1.12, [960, 560]),
  wide: framing([960, 540], 1),
  /** O fim da aproximação lenta do plano aberto: 4% mais perto dela. */
  wideEnd: framing([900, 650], 1.04, [900, 650]),
  /** O sino enche o quadro; os braços saem por cima. */
  bell: framing([JELLYFISH_SPOT.x, JELLYFISH_SPOT.y + 14], 3.2, [840, 600]),
  /** A água-viva inteira e o peixe ao lado. */
  medium: framing([860, 640], 1.9, [900, 560]),
  /** A ponta do braço em que o peixe encosta. */
  touch: framing([1090, 640], 3.4, [900, 560]),
  /** Ela de perto, dormindo em pleno dia, e o fim da aproximação lenta desse plano. */
  asleep: framing([860, 690], 2.5, [880, 570]),
  asleepEnd: framing([860, 690], 2.62, [880, 575]),
  /** Ela e, ao lado, o lugar vazio onde um cérebro estaria. */
  inside: framing([810, 630], 1.9, [900, 570]),
  /** O canto da lagoa onde o peixe dorme: longe da água-viva, que fica fora do quadro. */
  nook: framing([1640, 620], 2, [1060, 560]),
} as const;

/** Onde o peixe fica, no plano do assunto, enquanto olha a água-viva de perto: cabe no canto do close do sino. */
export const FISH_WATCHING = { x: 1120, y: 600, width: 110 } as const;
