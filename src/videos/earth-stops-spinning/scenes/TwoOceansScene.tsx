import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { HEIGHT, WIDTH } from "../../../format";
import { idea, ink, tags } from "../palette";
import { Caveat } from "../parts/CutEarth";
import { MapWorld } from "../parts/MapWorld";
import { Arrow, Frame, IdeaBackdrop, Push, SeaBackdrop, SourceSeal, Svg, SvgText } from "../parts/kit";

// O mapa na tela do computador: 16:9, para crescer até o quadro inteiro no plano seguinte.
const SCREEN_MAP = { x: 400, y: 248, width: 800, height: 450 } as const;
const SLIDER = { x: 1340, top: 372, bottom: 680 } as const;
// A etiqueta "simulação": montada no canto de cima do mapa da tela e, com o mapa no quadro inteiro, no canto dele.
const SIM_TAG = { screen: [540, 250], full: [310, 930] } as const;

type SimulationProps = {
  /** Os quadros em que a etiqueta entra e em que o giro começa a descer. */
  readonly tagAt: number;
  readonly brakeAt: number;
};

/** A tela do computador, com o mapa de hoje e o controle "giro" descendo devagar. */
const Simulation: React.FC<SimulationProps> = ({ tagAt, brakeAt }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const knob = mix(SLIDER.top, SLIDER.bottom, 0.85 * ramp(frame, brakeAt, length - brakeAt));
  return (
    <Frame backdrop={<IdeaBackdrop hue="mint" spot={[0.48, 0.42]} />}>
      <Push focus={[920, 480]} to={1.05}>
        <Svg>
          <ellipse cx={920} cy={950} rx={330} ry={22} fill={idea.mint.contact} opacity={0.25} />
          <rect x={850} y={790} width={140} height={130} fill={ink.dark} />
          <rect x={680} y={904} width={480} height={40} rx={20} fill={tags.light.fill} />
          <rect x={320} y={170} width={1200} height={640} rx={44} fill={tags.light.fill} />
          <rect x={360} y={208} width={1120} height={530} rx={18} fill={ink.paper} />
          <MapWorld {...SCREEN_MAP} radius={14} />
          {/* O controle "giro": o trilho, a parte ainda ligada e a manopla que desce. */}
          <SvgText x={SLIDER.x} y={270} size="note" fill={tags.light.fill}>
            giro
          </SvgText>
          <line
            x1={SLIDER.x}
            y1={SLIDER.top}
            x2={SLIDER.x}
            y2={SLIDER.bottom}
            stroke={idea.mint.bottom}
            strokeWidth={20}
            strokeLinecap="round"
          />
          <line
            x1={SLIDER.x}
            y1={knob}
            x2={SLIDER.x}
            y2={SLIDER.bottom}
            stroke={idea.mint.contact}
            strokeWidth={20}
            strokeLinecap="round"
          />
          <circle cx={SLIDER.x} cy={knob} r={38} fill={tags.light.fill} />
          <circle cx={SLIDER.x} cy={knob} r={24} fill={ink.accent} />
        </Svg>
        <Place x={SIM_TAG.screen[0]} y={SIM_TAG.screen[1]}>
          <Pop at={tagAt}>
            <Caveat on="light">simulação</Caveat>
          </Pop>
        </Place>
      </Push>
      <SourceSeal>Fraczek, Esri</SourceSeal>
    </Frame>
  );
};

type RedrawProps = {
  /** O quadro em que a faixa de terra é percorrida, de oeste a leste. */
  readonly bandAt: number;
};

/** O mapa cresce da tela até o quadro e se redesenha: a água vai para os polos, e o equador seca. */
const Redraws: React.FC<RedrawProps> = ({ bandAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grown = ramp(frame, 0, 0.7 * fps);
  const moved = ramp(frame, 0.6 * fps, Math.max(fps, bandAt - 0.6 * fps));
  return (
    <Frame backdrop={<SeaBackdrop />}>
      <Push to={1.04}>
        <Svg>
          <MapWorld
            x={mix(SCREEN_MAP.x, 0, grown)}
            y={mix(SCREEN_MAP.y, 0, grown)}
            width={mix(SCREEN_MAP.width, WIDTH, grown)}
            height={mix(SCREEN_MAP.height, HEIGHT, grown)}
            radius={mix(14, 0, grown)}
            moved={moved}
            // As planícies do norte só acabam de afundar na cena seguinte, que as nomeia.
            flood={0.55 * moved}
          />
          {/* A faixa de terra dá a volta no equador. */}
          <Arrow
            from={[200, HEIGHT / 2]}
            to={[1720, HEIGHT / 2]}
            color={ink.paper}
            width={12}
            dashed
            drawn={ramp(frame, bandAt, 1.2 * fps)}
          />
        </Svg>
        {/* O mapa novo é o resultado da simulação: a etiqueta vem da tela com ele e fica. */}
        <Place
          x={mix(SIM_TAG.screen[0], SIM_TAG.full[0], grown)}
          y={mix(SIM_TAG.screen[1], SIM_TAG.full[1], grown)}
        >
          <Caveat on="light">simulação</Caveat>
        </Place>
      </Push>
      <SourceSeal>Fraczek, Esri</SourceSeal>
    </Frame>
  );
};

export const TwoOceansScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a simulação">
      <Simulation tagAt={cue(scene, "simulou")} brakeAt={cue(scene, "computador")} />
    </Shot>
    <Shot range={shots[1]} name="o mapa se redesenha">
      <Redraws bandAt={cue(scene, "faixa") - shots[1].from} />
    </Shot>
  </>
);
