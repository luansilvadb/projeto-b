import "../../../design/fonts";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Build, Layer, useBuild } from "../../../components/Camera";
import {
  Cast,
  FlatStage,
  Stay,
  Troupe,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp01 } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { markFor } from "../../../video/stage";
import { ink, lab, stopwatch } from "../palette";
import { EXPERIMENTERS, SUBJECTS, SyllableSheet } from "../parts/SyllableList";
import { flash, shake, Sooner } from "./MaybeBrainScene";
import { Drift, driftZoom, undrifted } from "./SleepDebtScene";

/**
 * O cenário deste plano sobe em menos quadros que os do palco: quem abre o
 * plano precisa estar no lugar quando a primeira palavra dele soa. A saída
 * continua a do palco.
 */
export const Hasten: React.FC<{
  frames: number;
  /** Quantos quadros o cenário espera antes de subir: o fundo toma a cor primeiro. */
  delay?: number;
  children: React.ReactNode;
}> = ({ frames, delay = 0, children }) => {
  const built = useBuild();
  const stage = useStage();
  return (
    <Build
      {...built}
      // Enquanto o fundo ainda toma a cor dele, o plano está chegando: depois disso vale o palco, que o tira de cena.
      risen={built.lit < 1 ? stage.enter(delay, frames) : built.risen}
    >
      {children}
    </Build>
  );
};

// O calendário de parede: a faixa do ano em cima e um mês de trinta dias embaixo.
const CAL = {
  width: 300,
  height: 300,
  columns: 7,
  pitch: 38,
  cell: 30,
  days: 30,
  // Onde a folha do mês começa, abaixo da faixa do ano.
  sheet: 82,
};
// Em quantos dias da contagem a folha cheia vira: ela sobe e dobra para trás enquanto a nova já se enche.
const TURN_DAYS = 9;


/**
 * O lugar de um `Place` que se move devagar, pelo centro dele: o `Place` fica
 * na origem e o lugar vai pela transformação. Posto por `left` e `top`, o que
 * anda menos de um pixel por quadro cai em pixel inteiro e anda em degraus.
 */
export const centeredAt = (x: number, y: number): string =>
  `calc(-50% + ${x}px) calc(-50% + ${y}px)`;

/** As trinta casas de uma folha do mês, com `filled` delas cheias; a fração é a casa que está enchendo. */
const cells = (filled: number) =>
  Array.from({ length: CAL.days }, (_, day) => {
    const x = 21 + (day % CAL.columns) * CAL.pitch;
    const y = 100 + Math.floor(day / CAL.columns) * CAL.pitch;
    const done = clamp01(filled - day);
    // Cada casa cresce do meio, passa um pouco do tamanho e assenta: nenhuma troca de cor num quadro só.
    const size =
      done < 0.7
        ? 0.3 + (0.82 * done) / 0.7
        : 1.12 - (0.12 * (done - 0.7)) / 0.3;
    return (
      <g key={day}>
        <rect
          x={x}
          y={y}
          width={CAL.cell}
          height={CAL.cell}
          rx={7}
          fill={ink.tagEdge}
          opacity={0.2}
        />
        {done > 0 ? (
          <rect
            x={x + (CAL.cell * (1 - size)) / 2}
            y={y + (CAL.cell * (1 - size)) / 2}
            width={CAL.cell * size}
            height={CAL.cell * size}
            rx={7 * size}
            fill={ink.tag}
          />
        ) : null}
      </g>
    );
  });

type YearCalendarProps = {
  /** O centro do calendário e a largura, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quantos dias já passaram: enchem a folha do mês, casa por casa, e ao passar de trinta a folha vira. */
  readonly days?: number;
  /** A escala da entrada, em volta do centro. */
  readonly pop?: number;
};

/** O calendário de 1924 na parede. Vai dentro de um SvgLayer. */
const YearCalendar: React.FC<YearCalendarProps> = ({
  x,
  y,
  width,
  days = 0,
  pop = 1,
}) => {
  const scale = (width / CAL.width) * pop;
  const second = days > CAL.days;
  // A folha cheia sobe presa pelo alto, encolhendo até a faixa do ano, e vira a dobra de trás.
  const turned = second ? clamp01((days - CAL.days) / TURN_DAYS) : 0;

  return (
    <g
      transform={`translate(${x - (CAL.width * scale) / 2} ${y - (CAL.height * scale) / 2}) scale(${scale})`}
    >
      {/* A folha já virada fica dobrada para trás, no alto. */}
      {turned > 0 ? (
        <path
          d={`M18,4 C50,${-44 * turned} 250,${-44 * turned} 282,4 Z`}
          fill={lab.platformShade}
        />
      ) : null}
      <rect
        x={10}
        y={12}
        width={CAL.width}
        height={CAL.height}
        rx={22}
        fill={lab.platformShade}
      />
      <rect width={CAL.width} height={CAL.height} rx={22} fill={lab.paper} />
      {cells(second ? days - CAL.days : days)}
      {turned > 0 && turned < 1 ? (
        <g
          transform={`translate(0 ${CAL.sheet}) scale(1 ${1 - turned}) translate(0 ${-CAL.sheet})`}
        >
          <rect
            y={CAL.sheet}
            width={CAL.width}
            height={CAL.height - CAL.sheet}
            rx={22}
            fill={lab.paper}
          />
          {cells(CAL.days)}
          {/* A borda de baixo da folha que sobe, mais escura: é ela que se vê andar. */}
          <rect
            y={CAL.height - 10}
            width={CAL.width}
            height={10}
            fill={lab.platformShade}
          />
        </g>
      ) : null}
      <path
        d={`M0,${CAL.sheet} L0,22 Q0,0 22,0 L${CAL.width - 22},0 Q${CAL.width},0 ${CAL.width},22 L${CAL.width},${CAL.sheet} Z`}
        fill={ink.tag}
      />
      {[78, 222].map((ring) => (
        <rect
          key={ring}
          x={ring - 8}
          y={-16}
          width={16}
          height={38}
          rx={8}
          fill={stopwatch.rim}
        />
      ))}
      <text
        x={CAL.width / 2}
        y={62}
        textAnchor="middle"
        fontFamily={typography.family}
        fontWeight={typography.weight}
        fontSize={56}
        fill={ink.paper}
      >
        1924
      </text>
    </g>
  );
};

// O piso fica acima do selo da fonte, que nesta cena é comprido: os sapatos e o pé da mesa encostavam nele.
const FLOOR = 936;
// O piso passa do quadro para os lados e para baixo: a deriva começa um pouco mais aberta que o quadro composto.
const BLEED = 200;

/** A parede do laboratório, sem a vidraria do tanque: o fundo dos dois planos desta cena. */
const WALL = (
  <AbsoluteFill
    style={{ background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})` }}
  />
);

// A mesa no meio, com as duas pessoas sentadas atrás dela; um pesquisador de cada lado, em pé.
const TABLE = { x: 960, top: 721, width: 820 };
const SEATED = { xs: [760, 1160], y: 911, height: 540 };
const CHAIR_TOP = 561;
const STANDING = { xs: [320, 1600], y: FLOOR, height: 650 };
const ROOM_FOCUS = [960, 600] as const;
// A parede toma a cor dela depressa, sobre o céu da rua de `but-what`, e só então a sala sobe, com a rua já
// fora do quadro: subindo junto, os pesquisadores ficavam em cima do toldo e contra o céu da noite, e os
// dois lugares pareciam um só. A fala começa aos 0,4 s.
const WALL_FRAMES = 6;
const ROOM_RISE = { after: 1, frames: 13 };
// O calendário na parede, entre os dois pesquisadores.
const YEAR = { x: 960, y: 231, width: 306 };
// A mão de quem entrega, nas unidades do desenho da pessoa: com a folha junto ao peito, e com o braço estendido.
const HAND = {
  rest: { hand: [-128, -292], bend: 34 },
  out: { hand: [-204, -330], bend: -18 },
} as const;
// A folha na mão: o meio dela a partir da mão, a largura e a inclinação.
const HANDED = { dx: -36, dy: -45, width: 104, tilt: -8 };
// A entrega: quantos quadros o braço leva, e quantos a segunda espera depois da primeira.
const GIVE = { frames: 11, gap: 6 };
// O braço de quem recebe, do lado do pesquisador: pousado, e erguido para a folha.
const TAKING = {
  rest: { hand: [128, -244], bend: 14 },
  out: { hand: [156, -300], bend: 24 },
} as const;

/** Onde está a folha de quem entrega, no quadro: o pesquisador `index`, com o braço `given` estendido (de 0 a 1). */
const sheetSpot = (index: number, given: number, rise: number) => {
  const side = index === 0 ? -1 : 1;
  const hand = [
    mix(HAND.rest.hand[0], HAND.out.hand[0], given),
    mix(HAND.rest.hand[1], HAND.out.hand[1], given),
  ];
  return {
    hand: [
      STANDING.xs[index] + side * hand[0],
      STANDING.y + hand[1] * rise,
    ] as const,
    x: STANDING.xs[index] + side * (hand[0] + HANDED.dx),
    y: STANDING.y + (hand[1] + HANDED.dy) * rise,
    tilt: side * mix(-2, HANDED.tilt, given),
  };
};

/** A folha que o pesquisador da direita deixa estendida no fim do plano: é dela que o plano seguinte parte. */
const GIVEN_SHEET = sheetSpot(1, 1, 1);

type HandoverShotProps = {
  /** Quadros do plano em que o calendário entra e em que a primeira lista é entregue. */
  readonly yearAt: number;
  readonly giveAt: number;
  readonly clock: number;
};

/** Em 1924, dois pesquisadores entregam uma lista a cada uma das duas pessoas sentadas à mesa. */
const HandoverShot: React.FC<HandoverShotProps> = ({
  yearAt,
  giveAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  // Cada braço se estende com peso, passa um pouco do ponto e volta: é um gesto.
  const given = [0, 1].map((index) => {
    const at = giveAt + index * GIVE.gap;
    return (
      ramp(frame, at, GIVE.frames) + shake(frame, at + GIVE.frames, 8, 0.07, 1)
    );
  });
  const taken = [0, 1].map((index) =>
    ramp(frame, giveAt + index * GIVE.gap + 4, GIVE.frames),
  );
  const rises = [0, 1].map((index) => breath(seconds, `experimenter-${index}`));
  const sheets = [0, 1].map((index) =>
    sheetSpot(index, given[index], rises[index]),
  );
  /** A folha de um dos pesquisadores, com o polegar por cima, enquanto ele a segura (`grip`, de 0 a 1). */
  const sheet = (index: number, grip = 1) => (
    <>
      <Place
        x={0}
        y={0}
        style={{
          translate: centeredAt(sheets[index].x, sheets[index].y),
          rotate: `${sheets[index].tilt}deg`,
        }}
      >
        <SyllableSheet width={HANDED.width} plain />
      </Place>
      <SvgLayer>
        <circle
          cx={sheets[index].hand[0]}
          cy={sheets[index].hand[1]}
          r={25 * grip}
          fill={EXPERIMENTERS[index].hand}
        />
      </SvgLayer>
    </>
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: stage.enter(0, WALL_FRAMES) }}>
        {WALL}
      </AbsoluteFill>
      <Troupe>
        <Drift focus={ROOM_FOCUS}>
          {/* A sala sobe e desce com o palco, como um cenário: o piso, a mesa e quem está nela. */}
          <Hasten frames={ROOM_RISE.frames} delay={ROOM_RISE.after}>
            <Layer depth={1}>
              <SvgLayer>
                <rect
                  x={-BLEED}
                  y={FLOOR - 40}
                  width={1920 + 2 * BLEED}
                  height={16}
                  fill={lab.shelf}
                />
                <rect
                  x={-BLEED}
                  y={FLOOR - 24}
                  width={1920 + 2 * BLEED}
                  height={1080 - FLOOR + 24 + BLEED}
                  fill={lab.bench}
                />
                <rect
                  x={-BLEED}
                  y={FLOOR + 40}
                  width={1920 + 2 * BLEED}
                  height={1080 - FLOOR - 40 + BLEED}
                  fill={lab.benchShade}
                />
                {/* O encosto das cadeiras, atrás de cada pessoa. */}
                {SEATED.xs.map((x) => (
                  <rect
                    key={x}
                    x={x - 120}
                    y={CHAIR_TOP}
                    width={240}
                    height={200}
                    rx={36}
                    fill={lab.benchShade}
                  />
                ))}
              </SvgLayer>
              {SEATED.xs.map((x, index) => (
                <Place
                  key={x}
                  x={x}
                  y={SEATED.y}
                  anchor="bottom"
                  // Cada uma olha para o pesquisador do seu lado: a da esquerda é espelhada.
                  style={{
                    scale: `${index === 0 ? -1 : 1} ${breath(seconds, `subject-${index}`)}`,
                    // Quem espera se mexe pouco e devagar: o peso vai de um lado para o outro da cadeira.
                    rotate: `${0.8 * wave(seconds, 5.3, index * 0.4)}deg`,
                  }}
                >
                  <Person
                    height={SEATED.height}
                    colors={SUBJECTS[index]}
                    bun={index === 1}
                    expression="curious"
                    blink={Math.max(
                      blink(seconds, `subject-${index}`),
                      // O calendário estoura na parede atrás delas, e as duas piscam.
                      flash(frame, yearAt + 4 + index * 3, 5),
                    )}
                    frontArm={{ hand: [-104, -236], bend: 20 }}
                    backArm={{
                      hand: [
                        mix(
                          TAKING.rest.hand[0],
                          TAKING.out.hand[0],
                          taken[index],
                        ),
                        mix(
                          TAKING.rest.hand[1],
                          TAKING.out.hand[1],
                          taken[index],
                        ),
                      ],
                      bend: mix(
                        TAKING.rest.bend,
                        TAKING.out.bend,
                        taken[index],
                      ),
                    }}
                  />
                </Place>
              ))}
              <SvgLayer>
                {/* A mesa cobre as duas da cintura para baixo: estão sentadas. */}
                <rect
                  x={TABLE.x - TABLE.width / 2 + 40}
                  y={TABLE.top + 20}
                  width={TABLE.width - 80}
                  height={FLOOR - TABLE.top - 20}
                  rx={18}
                  fill={lab.benchShade}
                />
                <rect
                  x={TABLE.x - TABLE.width / 2}
                  y={TABLE.top}
                  width={TABLE.width}
                  height={38}
                  rx={19}
                  fill={lab.platform}
                />
                <rect
                  x={TABLE.x - TABLE.width / 2 + 24}
                  y={TABLE.top + 26}
                  width={TABLE.width - 48}
                  height={12}
                  rx={6}
                  fill={lab.platformShade}
                />
                {STANDING.xs.map((x) => (
                  <ellipse
                    key={x}
                    cx={x}
                    cy={FLOOR + 4}
                    rx={150}
                    ry={18}
                    fill={lab.contact}
                    opacity={0.22}
                  />
                ))}
              </SvgLayer>
              {STANDING.xs.map((x, index) => (
                <Place
                  key={x}
                  x={x}
                  y={STANDING.y}
                  anchor="bottom"
                  // O braço que entrega é o da frente: no da esquerda, o desenho é espelhado para ele ficar do lado da mesa.
                  style={{ scale: `${index === 0 ? -1 : 1} ${rises[index]}` }}
                >
                  <Person
                    height={STANDING.height}
                    colors={EXPERIMENTERS[index]}
                    bun={index === 1}
                    blink={blink(seconds, `experimenter-${index}`)}
                    frontArm={{
                      hand: [
                        mix(HAND.rest.hand[0], HAND.out.hand[0], given[index]),
                        mix(HAND.rest.hand[1], HAND.out.hand[1], given[index]),
                      ],
                      bend: mix(HAND.rest.bend, HAND.out.bend, given[index]),
                    }}
                  />
                </Place>
              ))}
              {sheet(0)}
            </Layer>
            {/*
            O calendário e a lista da direita são o que este plano tem em comum com o seguinte: não
            descem com a sala. Ficam onde estão, e o plano seguinte os leva para o quadro fechado.
          */}
            {stage.handedOver ? null : (
              <Stay>
                <SvgLayer>
                  {frame >= yearAt ? (
                    <YearCalendar
                      {...YEAR}
                      pop={popScale(frame, yearAt, 0.3 * fps)}
                    />
                  ) : null}
                </SvgLayer>
                {/*
                Até a entrega, a lista sobe com a sala, na mão dele (a camada do assunto); depois fica
                no ar quando a sala desce (a camada do fundo, que não desce), e a mão dele a solta.
              */}
                <Layer depth={frame >= giveAt ? 0 : 1}>
                  {sheet(1, 1 - stage.leave())}
                </Layer>
              </Stay>
            )}
          </Hasten>
        </Drift>
        <Grain />
      </Troupe>
    </AbsoluteFill>
  );
};

// De perto: quem lê à esquerda, a lista no meio e o calendário na parede, à direita.
const READER = { x: 400, y: 1330, height: 1200 };
/** A lista de perto, no fim do plano: é dela que as duas listas da cena seguinte partem. */
export const SHEET = { x: 1000, y: 520, width: 500, tilt: -4 };
const WALL_CALENDAR = { x: 1590, y: 360, width: 440 };
const LIST_FOCUS = [SHEET.x, SHEET.y] as const;
// "Quase dois meses": a segunda folha do calendário para um pouco antes do fim.
const DAYS = 56;
// A câmera fecha na lista: em quantos quadros a lista e o calendário chegam ao quadro fechado.
const CLOSE_FRAMES = 21;
// Quem lê abre o plano: entra antes da marcação de sempre.
const READER_SOONER = 14;
// As sílabas se escrevem uma a uma: o intervalo entre elas e quanto cada uma leva, em quadros.
const WRITE = { step: 3, frames: 8 };

type ListShotProps = {
  /** Quadros do plano em que as sílabas começam a se escrever, e entre os quais o calendário folheia. */
  readonly writeAt: number;
  readonly daysFrom: number;
  readonly daysTo: number;
  readonly clock: number;
};

/** De perto, a lista de sílabas soltas na mão de uma delas; atrás, o calendário folheia quase dois meses. */
const ListShot: React.FC<ListShotProps> = ({
  writeAt,
  daysFrom,
  daysTo,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const scale = READER.height / 650;
  // A lista e o calendário partem de onde o plano anterior os deixou, já descontada a deriva deste.
  const zoom = driftZoom(0, length);
  const closed = ramp(frame, 0, CLOSE_FRAMES);
  const sheetFrom = undrifted([GIVEN_SHEET.x, GIVEN_SHEET.y], LIST_FOCUS, zoom);
  const yearFrom = undrifted([YEAR.x, YEAR.y], LIST_FOCUS, zoom);
  const sheet = {
    x: mix(sheetFrom[0], SHEET.x, closed),
    y: mix(sheetFrom[1], SHEET.y, closed) + 4 * wave(seconds, 3.7) * closed,
    // A escala cresce em proporção, para a velocidade aparente ser a mesma do começo ao fim.
    width:
      (HANDED.width / zoom) * (SHEET.width / (HANDED.width / zoom)) ** closed,
    tilt:
      mix(GIVEN_SHEET.tilt, SHEET.tilt, closed) +
      0.7 * wave(seconds, 4.3, 0.3) * closed,
  };
  const year = {
    x: mix(yearFrom[0], WALL_CALENDAR.x, closed),
    y: mix(yearFrom[1], WALL_CALENDAR.y, closed),
    width:
      (YEAR.width / zoom) *
      (WALL_CALENDAR.width / (YEAR.width / zoom)) ** closed,
  };
  const height = (sheet.width * 560) / 360;
  // A mão dela chega ao canto de baixo da folha quando a folha chega.
  const held = popScale(frame, CLOSE_FRAMES - 8, 0.3 * fps, 0, 1.06);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={WALL}>
        <Drift focus={LIST_FOCUS}>
          {/* O calendário já estava na parede: não entra; sai com o plano. */}
          <Stay only="entering">
            <Cast origin={[WALL_CALENDAR.x, WALL_CALENDAR.y]}>
              <SvgLayer>
                <YearCalendar
                  {...year}
                  // Folheia a velocidade constante: é tempo passando.
                  days={DAYS * linear(frame, daysFrom, daysTo - daysFrom)}
                />
              </SvgLayer>
            </Cast>
          </Stay>
          <Sooner by={READER_SOONER}>
            <Place
              x={READER.x}
              y={READER.y}
              anchor="bottom"
              // Espelhada: ela olha para a folha, à direita, e a segura com o braço desse lado.
              style={{
                scale: `-1 ${breath(seconds, "reader")}`,
                // Lendo, a cabeça acompanha as linhas: o corpo pende um pouco para a folha e volta.
                rotate: `${1.1 * wave(seconds, 2.6, 0.1)}deg`,
              }}
            >
              <Person
                height={READER.height}
                colors={SUBJECTS[1]}
                bun
                expression="reading"
                blink={blink(seconds, "reader", { every: [1.6, 3.2] })}
                frontArm={{ hand: [-196, -236], bend: 34 }}
              />
            </Place>
          </Sooner>
          {/*
            A lista também já estava lá, na mão do pesquisador: vem de lá, crescendo. E continua na cena
            seguinte, que a leva para as duas mesas de cabeceira: aqui ela não entra nem sai.
          */}
          {stage.handedOver ? null : (
            <Stay>
              <Place
                x={0}
                y={0}
                style={{
                  translate: centeredAt(sheet.x, sheet.y),
                  rotate: `${sheet.tilt}deg`,
                }}
              >
                <SyllableSheet
                  width={sheet.width}
                  written={Array.from({ length: 10 }, (_, syllable) =>
                    ramp(frame, writeAt + syllable * WRITE.step, WRITE.frames),
                  )}
                />
              </Place>
            </Stay>
          )}
          <Stay>
            <SvgLayer>
              {/* O polegar por cima do canto da folha: é ela quem a segura. */}
              <circle
                cx={sheet.x - sheet.width / 2 + 34}
                cy={sheet.y + height * 0.488}
                // Ela solta a folha quando sai de cena.
                r={
                  22 *
                  scale *
                  held *
                  (1 - stage.leave(markFor("actor", READER.x).leaveAt))
                }
                fill={SUBJECTS[1].hand}
              />
            </SvgLayer>
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const MemoryTestScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="1924: uma lista para cada pessoa">
      <HandoverShot
        yearAt={cue(scene, "mil")}
        giveAt={cue(scene, "Duas")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="a lista de sílabas, por quase dois meses">
      <ListShot
        writeAt={cue(scene, "sílabas") - shots[1].from}
        daysFrom={cue(scene, "todos") - shots[1].from}
        daysTo={cue(scene, "meses") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
