import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, researcher } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { cue, ramp } from "../../../components/timing";

// O arquivo: três gavetas empilhadas; a do meio é a do "motivo".
const CABINET = { x: 1040, y: 330, width: 520, drawer: 170, gap: 18 };
const DRAWER_TRAVEL = 150;

type CabinetProps = {
  readonly x?: number;
  /** Quanto cada gaveta saiu, de 0 a 1, de cima para baixo. */
  readonly open: readonly [number, number, number];
  /** A etiqueta da gaveta do meio. */
  readonly labelled?: boolean;
};

/** Um arquivo de três gavetas; a gaveta aberta mostra o fundo escuro, vazio. */
const Cabinet: React.FC<CabinetProps> = ({
  x = CABINET.x,
  open,
  labelled = false,
}) => (
  <>
    <SvgLayer>
      <rect
        x={x - 20}
        y={CABINET.y - 20}
        width={CABINET.width + 40}
        height={3 * CABINET.drawer + 2 * CABINET.gap + 40}
        rx={26}
        fill={idea.mint.contact}
      />
      {open.map((amount, index) => {
        const y = CABINET.y + index * (CABINET.drawer + CABINET.gap);
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={CABINET.width}
              height={CABINET.drawer}
              rx={16}
              fill={ink.dark}
            />
            <g transform={`translate(0 ${DRAWER_TRAVEL * amount * 0.35})`}>
              <rect
                x={x - 14 * amount}
                y={y}
                width={CABINET.width + 28 * amount}
                height={CABINET.drawer * (1 - 0.55 * amount)}
                rx={16}
                fill={idea.mint.bottom}
                transform={`translate(0 ${CABINET.drawer * 0.55 * amount})`}
              />
              <rect
                x={x + CABINET.width / 2 - 60}
                y={y + CABINET.drawer - 50}
                width={120}
                height={18}
                rx={9}
                fill={idea.mint.contact}
              />
            </g>
          </g>
        );
      })}
    </SvgLayer>
    {labelled ? (
      <Place
        x={x + CABINET.width / 2}
        y={
          CABINET.y +
          CABINET.drawer +
          CABINET.gap +
          58 +
          (CABINET.drawer * 0.55 + DRAWER_TRAVEL * 0.35) * open[1]
        }
      >
        <Tag size="note" on="mint">
          motivo
        </Tag>
      </Place>
    ) : null}
  </>
);

// A gaveta vazia é o assunto: fica no centro, e a pesquisadora ao lado dela.
const CENTERED = 700;
const RESEARCHER = { x: 400, y: 1000, height: 760 };

type DrawerShotProps = {
  /** Quadro do plano em que a gaveta abre. */
  readonly openAt: number;
};

/** A pesquisadora abre, confiante, a gaveta do "motivo", e ela está vazia. */
const DrawerShot: React.FC<DrawerShotProps> = ({ openAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const opened = ramp(frame, openAt, 0.5 * fps);
  // Ela só entende que a gaveta está vazia depois de abri-la.
  const empty = frame >= openAt + 0.7 * fps;

  return (
    <SlowPush
      focus={[CENTERED + CABINET.width / 2, 560]}
      by={0.1}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.55, 0.5]} />}
    >
      <div>
        <Cabinet x={CENTERED} open={[0, opened, 0]} labelled />
        <SvgLayer>
          <IdeaShadow
            hue="mint"
            x={RESEARCHER.x}
            y={RESEARCHER.y + 6}
            width={320}
          />
        </SvgLayer>
        <Place
          x={RESEARCHER.x}
          y={RESEARCHER.y}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, "researcher")}` }}
        >
          <Person
            height={RESEARCHER.height}
            colors={researcher}
            bun
            expression={empty ? "puzzled" : "curious"}
            blink={blink(seconds, "researcher")}
            frontArm={{ hand: [200, -330 + 60 * opened], bend: 30 }}
          />
        </Place>
      </div>
      <Grain />
    </SlowPush>
  );
};

// O plano da busca: três arquivos lado a lado no chão, cada um com quem
// procura ao lado dele, e não atrás. Em cada arquivo só uma gaveta se mexe, a
// que a pessoa revira: com todas batendo ao mesmo tempo, não se lia nada.
const SEARCH = { scale: 0.74, floor: 960, step: 760, first: -170 };
// Quanto os arquivos descem para pousar no chão em que as pessoas pisam.
const CABINET_DROP =
  SEARCH.floor - (CABINET.y + 3 * CABINET.drawer + 2 * CABINET.gap + 20);
const SEARCHERS = [
  { drawer: 1, reach: -290, bun: true, glasses: false, seed: "left" },
  { drawer: 0, reach: -470, bun: false, glasses: true, seed: "middle" },
  { drawer: 1, reach: -290, bun: true, glasses: true, seed: "right" },
] as const;
// Quando a interrogação de cada arquivo aparece, em segundos, e de quanto em quanto.
const DOUBT = { at: 0.5, stagger: 0.35 };

/** O laboratório inteiro procurando: cada pesquisador revira uma gaveta, e nenhuma tem a resposta. */
const SearchShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const cabinetX = (index: number) => SEARCH.first + index * SEARCH.step;

  return (
    <SlowPush
      focus={[960, 600]}
      by={0.05}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.4]} />}
    >
      <div
        style={{
          scale: `${SEARCH.scale}`,
          transformOrigin: `960px ${SEARCH.floor}px`,
        }}
      >
        {/* Os arquivos todos primeiro, para nenhum cobrir quem está na frente do vizinho. */}
        <SvgLayer>
          {SEARCHERS.map(({ seed }, index) => (
            <g key={seed}>
              <IdeaShadow
                hue="mint"
                x={cabinetX(index) + CABINET.width / 2}
                y={SEARCH.floor + 6}
                width={CABINET.width + 80}
              />
              <IdeaShadow
                hue="mint"
                x={cabinetX(index) + CABINET.width + 110}
                y={SEARCH.floor + 6}
                width={280}
              />
            </g>
          ))}
        </SvgLayer>
        <div style={{ translate: `0 ${CABINET_DROP}px` }}>
          {SEARCHERS.map(({ drawer, seed }, index) => {
            const rummage = 0.7 + 0.3 * wave(seconds, 1.3, index * 0.3);
            return (
              <Cabinet
                key={seed}
                x={cabinetX(index)}
                open={[
                  drawer === 0 ? rummage : 0,
                  drawer === 1 ? rummage : 0,
                  0,
                ]}
              />
            );
          })}
        </div>
        {SEARCHERS.map(({ reach, bun, glasses, seed }, index) => (
          <div key={seed}>
            <Place
              x={cabinetX(index) + CABINET.width + 110}
              y={SEARCH.floor}
              anchor="bottom"
              style={{
                rotate: `${-3 + 2 * wave(seconds, 1.1, index * 0.4)}deg`,
                scale: `1 ${breath(seconds, seed)}`,
              }}
            >
              <Person
                height={600}
                colors={researcher}
                bun={bun}
                glasses={glasses ? ink.dark : undefined}
                expression="puzzled"
                blink={blink(seconds, seed)}
                frontArm={{
                  hand: [-190, reach + 26 * wave(seconds, 0.8, index * 0.2)],
                  bend: 30,
                }}
              />
            </Place>
            <Place
              x={cabinetX(index) + CABINET.width / 2}
              y={CABINET.y + CABINET_DROP - 110}
            >
              <Pop at={(DOUBT.at + index * DOUBT.stagger) * fps}>
                <Label size="headline" color={idea.mint.contact}>
                  ?
                </Label>
              </Pop>
            </Place>
          </div>
        ))}
      </div>
      <Grain />
    </SlowPush>
  );
};

export const StillLookingScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a gaveta do motivo">
      <DrawerShot openAt={cue(scene, "motivo")} />
    </Shot>
    <Shot range={shots[1]} name="o laboratório procurando">
      <SearchShot />
    </Shot>
  </>
);
