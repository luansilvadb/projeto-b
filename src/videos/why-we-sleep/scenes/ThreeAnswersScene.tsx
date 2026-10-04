import { useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { customer, ink, person } from "../palette";
import { ANSWERS, AnswerIcon } from "../parts/AnswerIcon";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { FRONT, ShopFront } from "../parts/ShopFront";
import { Crate } from "../parts/ShopInside";
import { cue, mix, ramp } from "../../../components/timing";

const ICONS = { xs: [390, 960, 1530], y: 540, size: 460 };
const STAGGER_SECONDS = 0.35;

type IconsShotProps = {
  /** Quadro do plano em que o primeiro ícone entra. */
  readonly firstAt: number;
};

/** As três respostas, uma a uma: o estoque, as prateleiras e a faxina. */
const IconsShot: React.FC<IconsShotProps> = ({ firstAt }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <SlowPush
        focus={[960, 540]}
        backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />}
      >
        {ANSWERS.map((answer, index) => (
          <Place key={answer} x={ICONS.xs[index]} y={ICONS.y}>
            <Pop at={firstAt + index * STAGGER_SECONDS * fps}>
              <AnswerIcon answer={answer} size={ICONS.size} />
            </Pop>
          </Place>
        ))}
        <Grain />
      </SlowPush>
    </>
  );
};

// Os fregueses passam pela calçada, na frente da loja aberta.
const WALKERS = [
  { from: -200, to: 620, colors: customer, height: 430 },
  { from: 2100, to: 1330, colors: person, height: 400 },
] as const;
const BRAIN = { x: FRONT.x, y: 330, width: 620 };

/** O cérebro vira a fachada de uma loja movimentada de dia: fregueses chegam, caixas esperam na porta. */
const OpenShopShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const became = ramp(frame, 0.2 * fps, 0.6 * fps);

  return (
    <ShopFront time="day" shutter={0}>
      <SvgLayer>
        <Crate x={FRONT.x - 470} y={FRONT.ground + 30} />
        <Crate x={FRONT.x - 590} y={FRONT.ground + 30} />
        <Crate x={FRONT.x - 530} y={FRONT.ground - 66} />
      </SvgLayer>
      {WALKERS.map(({ from, to, colors, height }, index) => {
        const walk = ramp(frame, 0, durationInFrames * 0.8);
        const walking = walk < 1;
        return (
          <Place
            key={from}
            x={mix(from, to, walk)}
            y={
              FRONT.ground +
              60 -
              (walking ? 8 * Math.abs(wave(seconds, 0.3, index * 0.4)) : 0)
            }
            anchor="bottom"
            style={{
              scale: `${from < to ? -1 : 1} ${breath(seconds, `walker-${index}`)}`,
            }}
          >
            <Person height={height} colors={colors} plainFace />
          </Place>
        );
      })}
      {/* O cérebro de que a loja é a imagem: fica sobre ela e some quando a troca está feita. */}
      <Place x={BRAIN.x} y={BRAIN.y} style={{ opacity: 1 - became }}>
        <Brain width={BRAIN.width} color={ink.tagEdge} folds />
      </Place>
    </ShopFront>
  );
};

export const ThreeAnswersScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="três respostas">
      <IconsShot firstAt={cue(scene, "ciência")} />
    </Shot>
    <Shot range={shots[1]} name="o cérebro como uma loja aberta">
      <OpenShopShot />
    </Shot>
  </>
);
