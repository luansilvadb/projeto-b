import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Grain } from "../../../components/Grain";
import { cue } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  ICON_PITCH,
  IconRow,
  type IconKey,
  type IconState,
} from "../parts/IconRow";

/** O fundo da fila: o mesmo matiz em todas as voltas dela, para o mapa ser reconhecido. */
export const ROW_HUE = "lilac";

// A fila é uma só nos quatro planos; o que muda é de quão perto ela é vista e
// em que ícone o quadro está. Aberta, cabe inteira; de perto, um ícone manda.
const WIDE = { x: 960, y: 520, scale: 1.18 };
// De perto, nos olhos do capim: o primeiro ícone no centro, os vizinhos saindo pela direita.
const ON_EYES = { x: 960 + 2 * ICON_PITCH * 1.9 - 140, y: 540, scale: 1.9 };
// Os três jeitos: os três do meio, com as pontas cortadas pela borda.
const ON_WAYS = { x: 960, y: 500, scale: 1.5 };

type Lit = { readonly icon: IconKey; readonly at: number };

type RowShotProps = {
  readonly placement: { x: number; y: number; scale: number };
  /** Os ícones que já estavam acesos quando o plano começou. */
  readonly already?: readonly IconKey[];
  /** Os que acendem neste plano, cada um no quadro dele. */
  readonly lighting?: readonly Lit[];
  /** Quadro do plano em que a interrogação entra na porta da loja. */
  readonly questionAt?: number;
};

/** A fila sobre o fundo liso, com os ícones acendendo na fala. */
const RowShot: React.FC<RowShotProps> = ({
  placement,
  already = [],
  lighting = [],
  questionAt,
}) => {
  const frame = useCurrentFrame();
  const states: Partial<Record<IconKey, IconState>> = {};
  const since: Partial<Record<IconKey, number>> = {};
  for (const icon of already) {
    states[icon] = "on";
  }
  for (const { icon, at } of lighting) {
    if (frame >= at) {
      states[icon] = "on";
      since[icon] = at;
    }
  }

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.48]} />
      <IconRow
        {...placement}
        hue={ROW_HUE}
        states={states}
        since={since}
        question={questionAt !== undefined && frame >= questionAt}
        questionAt={questionAt}
      />
      <Grain />
    </AbsoluteFill>
  );
};

export const FivePartsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os cinco ícones, apagados">
      <RowShot placement={WIDE} />
    </Shot>
    <Shot range={shots[1]} name="os olhos no capim acendem">
      <RowShot
        placement={ON_EYES}
        lighting={[{ icon: "eyes", at: cue(scene, "dormir") - shots[1].from }]}
      />
    </Shot>
    <Shot range={shots[2]} name="os três jeitos acendem um a um">
      <RowShot
        placement={ON_WAYS}
        already={["eyes"]}
        lighting={[
          { icon: "ruler", at: 4 },
          { icon: "brain", at: cue(scene, "jeitos") - shots[2].from },
          { icon: "alarm", at: cue(scene, "escapar") - shots[2].from },
        ]}
      />
    </Shot>
    <Shot range={shots[3]} name="a porta da loja acende, com a interrogação">
      <RowShot
        placement={WIDE}
        already={["eyes", "ruler", "brain", "alarm"]}
        lighting={[{ icon: "shop", at: 6 }]}
        questionAt={cue(scene, "sabe") - shots[3].from}
      />
    </Shot>
  </>
);
