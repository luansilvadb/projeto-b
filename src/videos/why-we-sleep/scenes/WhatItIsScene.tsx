import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Person } from "../../../art/Person";
import { useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  linear,
  ramp,
  clamp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { person } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LifeBar, STANDING } from "../parts/LifeBar";
import { TIMELINE, Timeline } from "../parts/Timeline";
import {
  NEVER,
  Prelude,
  Preluded,
  Sooner,
  useCastScale,
} from "./MaybeBrainScene";
import { RECALL_LEAD, TonightOpening } from "./TonightScene";
import { LineGroup, SeaStage } from "./NobodyEscapedScene";

// A pessoa e a barra já estão no lugar quando "Mas o terço" soa.
const LIT_SOONER = 20;
// O quadro do plano em que a barra chega ao terço escuro: a etiqueta "um terço" entra nele.
const THIRD_TAG_AT = 9;
// O terço se acende em 0,5 s; as estrelas e a lua estouram logo depois, uma a uma, em mais 0,6 s.
const LIT = { seconds: 0.5, skyAfter: 0.2, skySeconds: 0.6 };
// Em quantos quadros a pálpebra fecha antes de o rosto trocar, e abre depois.
const LID_FRAMES = 3;

type LitShotProps = {
  /** Quadros do plano em que o terço escuro se acende e em que ela olha para ele. */
  readonly litAt: number;
  readonly lookAt: number;
};

/** O primeiro plano do vídeo, de volta: a mesma pessoa, a mesma barra, e o terço escuro se acende em índigo. */
const LitShot: React.FC<LitShotProps> = ({ litAt, lookAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = frame / fps;
  const personIn = useCastScale(STANDING.x, LIT_SOONER);
  // Ela se vira para o terço aceso: o corpo pende um nada para o lado dele.
  const turned = ramp(frame, lookAt, 0.4 * fps);

  return (
    <Sooner by={LIT_SOONER}>
      {/* A câmera do plano: aproxima devagar do terço que se acende. */}
      <SlowPush
        focus={[1200, 620]}
        by={0.06}
        backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
      >
        <LifeBar
          // A barra se desenha ao chegar, como no gancho, e recolhe na saída.
          drawn={ramp(frame, 0, 0.5 * fps) * (1 - stage.leave(5))}
          lit={ramp(frame, litAt, LIT.seconds * fps)}
          sky={linear(frame, litAt + LIT.skyAfter * fps, LIT.skySeconds * fps)}
          twinkle={seconds}
          // A etiqueta entra quando a barra, que se desenha, chega à ponta escura que ela nomeia.
          thirdAt={THIRD_TAG_AT}
        />
        <SvgLayer>
          <IdeaShadow
            hue="peach"
            x={STANDING.x}
            y={STANDING.y + 6}
            width={380 * personIn}
          />
        </SvgLayer>
        <Place
          x={STANDING.x}
          y={STANDING.y}
          anchor="bottom"
          style={{
            scale: `1 ${breath(seconds, "you")}`,
            rotate: `${1.6 * turned}deg`,
          }}
        >
          <Person
            height={STANDING.height}
            colors={person}
            // O rosto troca com a pálpebra fechada.
            expression={frame >= lookAt + LID_FRAMES ? "curious" : "neutral"}
            blink={Math.max(
              blink(seconds, "you"),
              interpolate(
                frame,
                [
                  lookAt,
                  lookAt + LID_FRAMES,
                  lookAt + LID_FRAMES + 1,
                  lookAt + 2 * LID_FRAMES + 1,
                ],
                [0, 1, 1, 0],
                clamp,
              ),
            )}
          />
        </Place>
        <Grain />
      </SlowPush>
    </Sooner>
  );
};

// De quanto em quanto os bichos entram na linha, em segundos, e quando entra o primeiro depois da água-viva:
// o plano é curto, e a cama, a última, assenta antes de "largar".
const SLEEPERS = { first: 0.3, stagger: 0.3 };
// A água-viva e a linha já estão no lugar quando "nenhum animal" soa.
const LINE_SOONER = 30;
// A câmera do plano: acompanha os bichos entrando ao longo da linha. Não muda
// a escala: abre deslocada `pan` pixels para o começo da linha e desliza, com
// peso, até o quadro composto, quando a cama entra.
const FOLLOW = { pan: 90 };
// A água-viva começa a crescer estes quadros antes do plano, quando a barra acabou de recolher: sem
// isto o fundo ficava dois ou três quadros liso.
const SLEEPERS_LEAD = 7;

/**
 * A linha do tempo com os bichos dormindo ao longo dela, do mais antigo ao
 * mais recente: no fim da linha, a pessoa, na cama. Nenhuma deixa: o plano
 * inteiro é a resposta a "nenhum animal".
 */
const SleepersShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (index: number) =>
    Math.round((SLEEPERS.first + index * SLEEPERS.stagger) * fps);

  return (
    <AbsoluteFill>
      <Sooner by={LINE_SOONER}>
        <SeaStage pan={FOLLOW.pan * (1 - ramp(frame, 4, at(2) + 12 - 4))}>
          <LineGroup from={TIMELINE.from}>
            <Timeline
              floor={false}
              eased
              breathing
              drawn={ramp(frame, 0, 0.5 * fps)}
              arrow={ramp(frame, 0, 6)}
              jellyfish
              sleepersAt={[at(0), at(1), at(2)]}
            />
          </LineGroup>
        </SeaStage>
      </Sooner>
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `still-unknown` o desenha com `Prelude`, e ela já cresce enquanto a lagoa desce.
 */
/** Quantos quadros antes da cena ela começa a crescer: o medalhão e o contorno do cérebro ainda encolhem, e mais tarde que isto a lagoa ficava dois ou três quadros só com um ponto. */
export const LIT_LEAD = 9;

export const WhatItIsOpening: React.FC = () => (
  <LitShot litAt={NEVER} lookAt={NEVER} />
);

export const WhatItIsScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const sleepers = <SleepersShot />;
  return (
    <>
      <Shot range={shots[0]} name="o terço se acende">
        <Preluded lead={LIT_LEAD}>
          <LitShot
            // O terço fica escuro o tempo de ser visto, com a etiqueta dele, e acende quando a fala acaba
            // de nomeá-lo ("o terço da vida"); ela se vira para ele quando ele termina de acender.
            litAt={cue(scene, "vida")}
            lookAt={cue(scene, "parecia")}
          />
        </Preluded>
        {/* A água-viva da linha do tempo já cresce aqui, quando a barra recolheu. */}
        <Prelude lead={SLEEPERS_LEAD}>{sleepers}</Prelude>
      </Shot>
      <Shot range={shots[1]} name="nenhum animal largou: todos dormem na linha">
        <Preluded lead={SLEEPERS_LEAD}>{sleepers}</Preluded>
        {/* Rechtschaffen e o quadro-negro de `tonight` crescem aqui, por cima dos três que encolhem: a troca
          de cena não deixa a tela só com o fundo do mar. */}
        <Prelude lead={RECALL_LEAD}>
          <TonightOpening clock={scene.from + shots[1].to} />
        </Prelude>
      </Shot>
    </>
  );
};
