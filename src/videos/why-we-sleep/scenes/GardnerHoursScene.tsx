import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { CoffeeTable } from "../parts/CoffeeTable";
import {
  Bedroom,
  Gardner,
  HourCounter,
  ROOM,
  View,
  gardner,
} from "../parts/Gardner";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";

const ROOM_HUE = "lilac";

// De perto, o mesmo quarto: ele, o cartaz com o contador embaixo e o calendário.
const CLOSE = { focus: [1150, 590], zoom: 1.2 } as const;
const AWAKE = { x: 680, height: 640 };
const COUNTER = { x: ROOM.poster.x, y: 672 };
// O contador entra já perto do recorde: o que a fala conta é a passagem por ele.
const HOURS = { from: 236, record: 260, to: 264 };
// A vigília foi de 28 de dezembro a 8 de janeiro: a folha de dezembro vira e janeiro enche até o dia 8.
const JANUARY_DAYS = 8;

type CounterShotProps = {
  /** Quadro do plano em que o contador para em 264. */
  readonly doneAt: number;
};

/** O contador de horas sobe ao lado dele, passa do "260 h" do cartaz e para em "264 h"; o calendário vira para janeiro de 1964. */
const CounterShot: React.FC<CounterShotProps> = ({ doneAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const counted = linear(frame, 0.2 * fps, doneAt - 0.2 * fps);
  const turned = ramp(frame, doneAt * 0.3, 0.4 * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROOM_HUE} spot={[0.56, 0.5]} />
      <View
        focus={CLOSE.focus}
        zoom={mix(1.1, CLOSE.zoom, ramp(frame, 0, 0.5 * fps))}
      >
        <Bedroom
          hue={ROOM_HUE}
          on={ROOM_HUE}
          turned={turned}
          filled={[
            31,
            JANUARY_DAYS * linear(frame, doneAt * 0.5, doneAt * 0.5),
          ]}
        />
        <SvgLayer>
          <IdeaShadow
            hue={ROOM_HUE}
            x={AWAKE.x}
            y={ROOM.floor + 6}
            width={AWAKE.height * 0.46}
          />
        </SvgLayer>
        <Gardner
          {...AWAKE}
          y={ROOM.floor}
          expression="sleepy"
          tired={0.4 + 0.6 * counted}
        />
        <HourCounter
          {...COUNTER}
          hours={mix(HOURS.from, HOURS.to, counted)}
          record={HOURS.record}
        />
      </View>
      <Grain />
    </AbsoluteFill>
  );
};

const TABLES_HUE = "mint";
/** As manhãs seguintes a uma noite em claro: uma por dia sem dormir. */
const MORNINGS = 11;
// Duas fileiras, lidas da esquerda para a direita e de cima para baixo: seis mesas e cinco.
const ROWS = [
  { count: 6, first: 235, floor: 575 },
  { count: 5, first: 235, floor: 990 },
] as const;
const STEP = 300;
const SITTER = 215;

/** A mesa do café da noite em claro, repetida onze vezes; em cada uma ele está mais caído sobre a xícara. */
const TablesShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={TABLES_HUE} spot={[0.5, 0.5]} />
      {Array.from({ length: MORNINGS }, (_, index) => {
        const row = index < ROWS[0].count ? ROWS[0] : ROWS[1];
        const column = index < ROWS[0].count ? index : index - ROWS[0].count;
        const worn = index / (MORNINGS - 1);
        return (
          <Place key={index} x={row.first + column * STEP} y={row.floor}>
            <Pop at={0.1 * fps + index * 3} origin="bottom">
              <CoffeeTable
                colors={gardner}
                hue={TABLES_HUE}
                height={SITTER}
                slump={worn}
                tired={0.3 + 0.7 * worn}
                seconds={frame / fps}
              />
            </Pop>
          </Place>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};

export const GardnerHoursScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o contador passa do recorde e para em 264 h">
      <CounterShot doneAt={cue(scene, "quatro")} />
    </Shot>
    <Shot range={shots[1]} name="onze manhãs seguintes, uma atrás da outra">
      <TablesShot />
    </Shot>
  </>
);
