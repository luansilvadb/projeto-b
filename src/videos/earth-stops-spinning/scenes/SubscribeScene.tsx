import { AbsoluteFill, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { popOpacity, popScale } from "../../../components/Pop";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Globe as ChannelPlanet } from "../../../vignette/PlanetWorld";
import { home, ink, space, youtube } from "../palette";
import { Cup, LOOK_UP, Vig } from "../parts/Actor";
import { alive } from "../parts/EndAlive";
import { Globe } from "../parts/Globe";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";

const TURN_SECONDS = 14;
// A Terra no vidro da janela: pequena, no alto, do lado para onde ela olha.
const IN_THE_SKY = {
  cx: KITCHEN.window.x + KITCHEN.window.width * 0.72,
  cy: KITCHEN.window.y + KITCHEN.window.height * 0.36,
  r: 84,
} as const;
// O trecho da cozinha que o plano mostra: a janela e ela, da cintura para cima.
// A cena anterior acaba na cozinha inteira, de manhã; mais fechado e no escuro,
// o corte lê como outra hora, e não como o vidro piscando.
const NIGHT_SHOT = { focus: [1320, 390], from: 1.5, to: 1.56 } as const;

/** A Vigília na janela, à noite, com a Terra girando pequena no céu. */
const EarthInTheWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const w = KITCHEN.window;
  return (
    <Frame
      backdrop={
        <Push {...NIGHT_SHOT}>
          <Kitchen
            sky={space.sky}
            outside={Array.from({ length: 30 }, (_, index) => {
              const pick = (trait: string) => random(`window-star-${trait}-${index}`);
              return (
                <circle
                  key={index}
                  cx={w.x + pick("x") * w.width}
                  cy={w.y + pick("y") * w.height}
                  r={2 + pick("size") * 2.5}
                  fill={space.star}
                  opacity={0.55 + 0.3 * wave(seconds, 2 + 3 * pick("speed"), pick("phase"))}
                />
              );
            })}
          >
            <Vig
              x={KITCHEN.stand[0]}
              y={KITCHEN.stand[1]}
              scale={3.4}
              pose={alive(LOOK_UP, seconds, "subscribe")}
              shadow={home.contact}
              held={<Cup steam={frame / 9} />}
            />
          </Kitchen>
          {/* A noite na cozinha: tudo escurece, menos a Terra, desenhada por cima do escuro. */}
          <AbsoluteFill style={{ backgroundColor: space.sky[0], opacity: 0.5 }} />
          <Svg>
            <circle {...IN_THE_SKY} r={IN_THE_SKY.r * 1.5} fill={space.glow} opacity={0.14 + 0.04 * wave(seconds, 4)} />
            <Globe {...IN_THE_SKY} spin={seconds / TURN_SECONDS} />
          </Svg>
        </Push>
      }
    >
      {null}
    </Frame>
  );
};

const PLANET = { x: 960, y: 420, radius: 250 } as const;
const BUTTON = { x: 960, y: 900, width: 480, height: 104 } as const;
// Onde o cursor clica, e de onde ele vem.
const CLICK = { x: BUTTON.x + 150, y: BUTTON.y + 8 } as const;
const CURSOR_FROM = { x: 1420, y: 1040 } as const;

/**
 * O botão de inscrição: entra, o cursor chega e clica em `clickAt`, e ele vira
 * "Inscrito". O mesmo gesto do fim do vídeo do sono, nas cores deste.
 */
const SubscribeButton: React.FC<{ readonly clickAt: number }> = ({ clickAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterAt = Math.max(0.5 * fps, clickAt - 1.3 * fps);
  const cursorAt = Math.max(enterAt + 6, clickAt - 0.7 * fps);
  const pressed = ramp(frame, clickAt, 2) * (1 - ramp(frame, clickAt + 2, 5));
  const done = frame >= clickAt + 4;
  const moving = ramp(frame, cursorAt, clickAt - cursorAt);
  // Depois do clique, um brilho atravessa o botão de vez em quando: ele não fica parado até o fim.
  const sinceDone = frame - clickAt - 1.2 * fps;
  const shine = sinceDone < 0 ? 0 : linear(sinceDone % (2.4 * fps), 0, 0.7 * fps);
  return (
    <>
      <Place
        x={BUTTON.x}
        y={BUTTON.y}
        style={{
          opacity: popOpacity(frame, enterAt, 12),
          scale: `${popScale(frame, enterAt, 13, 0.72, 1.04) * (1 - pressed * 0.06)}`,
        }}
      >
        <div
          style={{
            width: BUTTON.width,
            height: BUTTON.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            borderRadius: 999,
            backgroundColor: interpolateColors(
              frame,
              [clickAt, clickAt + 8],
              [youtube.subscribe, youtube.done],
            ),
            boxShadow: `0 ${mix(10, 4, pressed)}px 0 ${ink.dark}`,
          }}
        >
          <svg width={48} height={40} viewBox="0 0 42 34" aria-hidden="true">
            {done ? (
              <path
                d="m8 17 8 8 18-19"
                fill="none"
                stroke={ink.paper}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <rect x={1} y={4} width={40} height={26} rx={8} fill={ink.paper} />
                <path d="M17 10v14l12-7z" fill={youtube.subscribe} />
              </>
            )}
          </svg>
          <Label size="note" color={ink.paper}>
            {done ? "Inscrito" : "Inscreva-se"}
          </Label>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: mix(-180, BUTTON.width + 60, shine),
              width: 120,
              background: `linear-gradient(90deg, transparent, ${ink.paper}73, transparent)`,
              transform: "skewX(-20deg)",
            }}
          />
        </div>
      </Place>
      {/* O anel do clique. */}
      <Place x={CLICK.x} y={CLICK.y} style={{ opacity: popOpacity(frame, clickAt, 2) * (1 - ramp(frame, clickAt, 9)) }}>
        <svg width={96} height={96} viewBox="0 0 96 96" aria-hidden="true">
          <circle
            cx={48}
            cy={48}
            r={mix(8, 44, ramp(frame, clickAt, 8))}
            fill="none"
            stroke={ink.paper}
            strokeWidth={6}
          />
        </svg>
      </Place>
      {/* O cursor: a ponta da seta é o canto de cima, à esquerda. */}
      <Place
        x={mix(CURSOR_FROM.x, CLICK.x, moving) + 26}
        y={mix(CURSOR_FROM.y, CLICK.y, moving) + 36}
        style={{
          opacity: popOpacity(frame, cursorAt, 7) * (1 - ramp(frame, clickAt + 0.5 * fps, 8)),
          scale: `${1 - pressed * 0.1}`,
        }}
      >
        <svg width={64} height={78} viewBox="0 0 54 66" aria-hidden="true">
          <path
            d="M5 4v43l12-11 11 22 11-5-11-22h18z"
            fill={ink.paper}
            stroke={ink.dark}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </svg>
      </Place>
    </>
  );
};

type ChannelProps = {
  /** O quadro do clique, e o quadro do agradecimento, em que o planeta dá a volta lenta. */
  readonly clickAt: number;
  readonly thanksAt: number;
};

/** O planeta da vinheta, símbolo do canal, entra e assenta no centro; abaixo, o botão de inscrição. */
const ChannelSymbol: React.FC<ChannelProps> = ({ clickAt, thanksAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // O planeta fica vivo até o fim: balança devagar, sobe e desce, e pende um nada no agradecimento.
  const tilt = 4 * wave(seconds, 6.3) - 5 * ramp(frame, thanksAt, 2 * fps);
  const y = PLANET.y + 8 * wave(seconds, 4.7);
  return (
    <Frame backdrop={<SpaceBackdrop />}>
      <Push focus={[PLANET.x, PLANET.y]} to={1.04}>
        <Svg>
          <g transform={`rotate(${tilt} ${PLANET.x} ${y})`}>
            <ChannelPlanet
              x={PLANET.x}
              y={y}
              // Já vem entrando no corte: o primeiro quadro não é o fundo vazio.
              radius={PLANET.radius * popScale(frame, -0.2 * fps, 0.6 * fps, 0)}
              // As nuvens atravessam o planeta o plano inteiro, mais depressa que na vinheta:
              // é o giro dele. Começam para trás, para ainda haver nuvem sobre ele no fim.
              seconds={2.2 * seconds - 14}
            />
          </g>
        </Svg>
      </Push>
      <SubscribeButton clickAt={clickAt} />
    </Frame>
  );
};

export const SubscribeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a Terra pequena no céu da janela">
      <EarthInTheWindow />
    </Shot>
    <Shot range={shots[1]} name="o planeta do canal e o botão">
      <ChannelSymbol
        clickAt={cue(scene, "inscreva") - shots[1].from}
        thanksAt={cue(scene, "Obrigado") - shots[1].from}
      />
    </Shot>
  </>
);
