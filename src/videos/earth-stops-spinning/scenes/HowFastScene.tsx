import { useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, linear, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { home, ink, tags } from "../palette";
import { CUP, Cup, Vig } from "../parts/Actor";
import { Gauge } from "../parts/Gauge";
import { Globe, LatitudeRing, surfacePoint } from "../parts/Globe";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { alive, Arrive } from "../parts/SpeedKit";

// O velocímetro da cozinha, na parede atrás dela: o mesmo lugar em `feel-nothing`.
const KITCHEN_GAUGE = { x: 300, y: 470, r: 150 } as const;

/** Ela se vira para o velocímetro, atrás dela, sem largar a xícara. */
const ASIDE: VigiliaPose = {
  ...CUP,
  turn: 0.05,
  nod: -0.2,
  gaze: [-0.8, -0.25],
  nearLid: 0.05,
  farLid: 0.05,
  nearBrow: [-0.3, 4],
  farBrow: [-0.3, 4],
  mouth: [9, 0.2, 0],
};

/** A Vigília parada na cozinha; ao lado dela, um velocímetro apagado, com uma interrogação. */
const AtRest: React.FC<{ readonly gaugeAt: number }> = ({ gaugeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const noticed = ramp(frame, gaugeAt + 4, 0.4 * fps);
  return (
    <Frame
      backdrop={
        <Push focus={[620, 560]}>
          <Kitchen sun={0.6} sunAt={0.7}>
            <g
              opacity={popOpacity(frame, gaugeAt, 0.3 * fps)}
              transform={`translate(${KITCHEN_GAUGE.x} ${KITCHEN_GAUGE.y}) scale(${popScale(frame, gaugeAt, 0.3 * fps)})`}
            >
              <Gauge x={0} y={0} r={KITCHEN_GAUGE.r} value={0} />
            </g>
            <Vig
              x={KITCHEN.stand[0]}
              y={KITCHEN.stand[1]}
              scale={3.4}
              pose={alive(mixPose(CUP, ASIDE, noticed), frame / fps, "vigilia")}
              shadow={home.contact}
              held={<Cup steam={frame / 9} />}
            />
          </Kitchen>
        </Push>
      }
    >
      {null}
    </Frame>
  );
};

const MEASURED = { cx: 640, cy: 540, r: 330 } as const;
// O achatamento com que um círculo de latitude é visto de lado: o de `LatitudeRing`.
const RING_TILT = 0.16;
const CLOCK = { x: 1440, y: 470, r: 180 } as const;
// "Quase 24 h": a volta que o ponteiro dá deixa uma fresta que se vê.
const ALMOST = 0.965;

/** Um ponto do equador visto de lado, em `lon` voltas: a metade de cá fica embaixo da linha. */
const equatorPoint = (
  earth: { readonly cx: number; readonly cy: number; readonly r: number },
  lon: number,
): readonly [number, number] => {
  const theta = lon * Math.PI * 2;
  return [
    earth.cx + earth.r * Math.sin(theta),
    earth.cy + earth.r * RING_TILT * Math.cos(theta),
  ];
};

/** O trecho do equador entre duas longitudes, em linha quebrada fina o bastante para parecer curva. */
const equatorArc = (
  earth: { readonly cx: number; readonly cy: number; readonly r: number },
  from: number,
  to: number,
): string => {
  const steps = Math.max(1, Math.ceil((to - from) / 0.01));
  return Array.from({ length: steps + 1 }, (_, index) => {
    const [x, y] = equatorPoint(earth, from + ((to - from) * index) / steps);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
};

// Um risco a cada mil quilômetros: quarenta na volta inteira.
const TAPE_MARKS = 40;
const TAPE_WIDTH = 34;

/** A fita métrica que dá a volta no equador: sai da borda oeste, passa pela frente e fecha por trás. */
const Tape: React.FC<{ readonly around: number }> = ({ around }) => {
  const tip = -0.25 + around;
  const [caseX, caseY] = equatorPoint(MEASURED, tip);
  // Fechada a volta, a caixa está de novo na borda de cá.
  const behind = tip > 0.25 && around < 0.98;
  return (
    <g>
      {tip > 0.25 ? (
        <path
          d={equatorArc(MEASURED, 0.25, tip)}
          fill="none"
          stroke={ink.accent}
          strokeWidth={TAPE_WIDTH * 0.6}
          opacity={0.3}
        />
      ) : null}
      <path
        d={equatorArc(MEASURED, -0.25, Math.min(tip, 0.25))}
        fill="none"
        stroke={ink.accent}
        strokeWidth={TAPE_WIDTH}
        strokeLinecap="round"
      />
      {Array.from({ length: TAPE_MARKS / 2 - 1 }, (_, index) => {
        const lon = -0.25 + (index + 1) / TAPE_MARKS;
        if (lon > tip) {
          return null;
        }
        const [x, y] = equatorPoint(MEASURED, lon);
        return (
          <line
            key={index}
            x1={x}
            y1={y - TAPE_WIDTH / 2}
            x2={x}
            y2={y - (index % 5 === 4 ? 0 : TAPE_WIDTH / 5)}
            stroke={ink.dark}
            strokeWidth={5}
          />
        );
      })}
      {/* A caixa da fita, na ponta que corre. */}
      <g transform={`translate(${caseX} ${caseY})`} opacity={behind ? 0.4 : 1}>
        <rect x={-34} y={-34} width={68} height={68} rx={18} fill={ink.stop} />
        <circle r={15} fill={ink.paper} />
      </g>
    </g>
  );
};

/** O relógio de uma volta: o ponteiro varre o mostrador e para um nada antes de fechar. */
const TurnClock: React.FC<{ readonly swept: number }> = ({ swept }) => {
  const { r } = CLOCK;
  const angle = swept * Math.PI * 2;
  return (
    <g>
      <circle r={r + 18} fill={tags.light.fill} />
      <circle r={r} fill={ink.paper} />
      {swept > 0 ? (
        <path
          d={`M0,0 L0,${-r} A${r},${r} 0 ${swept > 0.5 ? 1 : 0} 1 ${r * Math.sin(angle)},${-r * Math.cos(angle)} Z`}
          fill={ink.accent}
        />
      ) : null}
      {Array.from({ length: 12 }, (_, index) => (
        <line
          key={index}
          x1={0}
          y1={-r + 12}
          x2={0}
          y2={-r + 34}
          stroke={tags.light.fill}
          strokeWidth={8}
          strokeLinecap="round"
          transform={`rotate(${index * 30})`}
        />
      ))}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-r * 0.78}
        stroke={ink.stop}
        strokeWidth={14}
        strokeLinecap="round"
        transform={`rotate(${swept * 360})`}
      />
      <circle r={16} fill={tags.light.fill} />
    </g>
  );
};

// A seta de "leste": acompanha a curva do equador, um palmo acima da fita, pela frente da Terra.
const EAST = { lift: 118, from: -0.11, to: 0.11, width: 16 } as const;

/** Para onde o solo vai: uma seta que segue a curva do equador, de oeste para leste. */
const EastArrow: React.FC<{ readonly drawn: number }> = ({ drawn }) => {
  if (drawn <= 0) {
    return null;
  }
  const line = { ...MEASURED, cy: MEASURED.cy - EAST.lift };
  const tip = EAST.from + (EAST.to - EAST.from) * drawn;
  const [x, y] = equatorPoint(line, tip);
  const [bx, by] = equatorPoint(line, tip - 0.01);
  const head = EAST.width * 2.2;
  return (
    <g>
      <path
        d={equatorArc(line, EAST.from, tip)}
        fill="none"
        stroke={ink.paper}
        strokeWidth={EAST.width}
        strokeLinecap="round"
      />
      {/* A ponta aponta para onde a curva vai naquele trecho. */}
      <path
        d={`M${head},0 L${-head * 0.6},${-head * 0.8} L${-head * 0.6},${head * 0.8} Z`}
        fill={ink.paper}
        transform={`translate(${x} ${y}) rotate(${(Math.atan2(y - by, x - bx) * 180) / Math.PI})`}
      />
    </g>
  );
};

type MeasuredProps = {
  /** O quadro em que a fita sai, o do número dela, o em que o relógio entra, o em que o número dele aparece e o da seta de leste. */
  readonly tapeAt: number;
  readonly lengthAt: number;
  readonly clockAt: number;
  readonly hoursAt: number;
  readonly eastAt: number;
};

/** A Terra de lado: a fita dá a volta no equador, o relógio quase completa a volta, e a seta diz para onde o solo vai. */
const Measured: React.FC<MeasuredProps> = ({ tapeAt, lengthAt, clockAt, hoursAt, eastAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push>
        <Svg>
          <Globe {...MEASURED} spin={frame / fps / 24} />
          <Tape around={ramp(frame, tapeAt, 1.4 * fps)} />
          <EastArrow drawn={settle(frame, eastAt, 0.5 * fps)} />
          {/* O relógio já está ali, zerado: o ponteiro só anda quando a fala chega na volta. */}
          <g transform={`translate(${CLOCK.x} ${CLOCK.y}) scale(${popScale(frame, clockAt, 0.3 * fps, 1, 1.06)})`}>
            <TurnClock swept={ALMOST * ramp(frame, clockAt + 0.2 * fps, Math.max(1, hoursAt - clockAt) + 0.6 * fps)} />
          </g>
        </Svg>
        <Place x={MEASURED.cx} y={MEASURED.cy + MEASURED.r * RING_TILT + 92}>
          <Pop at={lengthAt}>
            <Tag on="dark" size="label">
              40.000 km
            </Tag>
          </Pop>
        </Place>
        <Place x={CLOCK.x} y={CLOCK.y + CLOCK.r + 100}>
          <Pop at={hoursAt}>
            <Tag on="dark" size="label">
              quase 24 h
            </Tag>
          </Pop>
        </Place>
        <Place x={MEASURED.cx} y={MEASURED.cy - EAST.lift - 40}>
          <Pop at={eastAt + 0.5 * fps}>
            <Tag on="dark">leste</Tag>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

const CARRIED = { cx: 620, cy: 590, r: 400 } as const;
const ROAD_GAUGE = { x: 1480, y: 450, r: 190 } as const;
// De onde o boneco parte: do lado de cá, um pouco a oeste do meio. Ele dá uma volta enquanto o velocímetro
// sobe e passa de novo ali quando a fala chega ao carro: os dois largam do mesmo ponto, e ele fecha o plano de volta nele.
const START = -0.1;
// Quanto da volta o carro faz enquanto o boneco faz a dele inteira: 100 km/h contra 1.670 km/h. É a conta do plano.
const CAR_SHARE = 100 / 1670;
// Os dias que o carro leva na volta inteira: 40.000 km a 100 km/h são 400 horas, quase dezessete dias.
const CAR_DAYS = 17;
const CAR_SCALE = 0.62;
const TOP_SPEED = 1670;
// Onde o ponteiro para: a escala do mostrador tem folga acima da velocidade do equador.
const TOP_VALUE = 0.85;
// O tamanho do boneco: uns 250 px de altura, para se achar de primeira ao lado de um globo de 800.
const FIGURE_SCALE = 1.6;

/** O boneco do equador: uma silhueta sem rosto, de pé. A base fica na origem. */
const Figure: React.FC = () => (
  <g fill={ink.paper}>
    <ellipse cx={0} cy={2} rx={34} ry={8} fill={ink.dark} opacity={0.35} />
    <rect x={-19} y={-52} width={15} height={52} rx={7.5} />
    <rect x={4} y={-52} width={15} height={52} rx={7.5} />
    <path d="M-24,-46 L-24,-92 Q-24,-112 0,-112 Q24,-112 24,-92 L24,-46 Q0,-36 -24,-46 Z" />
    <circle cx={0} cy={-136} r={21} />
  </g>
);

/** O carrinho do equador, de lado e de frente para leste: o meio da base fica na origem. */
const Car: React.FC = () => (
  <g>
    <ellipse cx={0} cy={2} rx={130} ry={9} fill={ink.dark} opacity={0.35} />
    <path
      d="M-124,-26 L-124,-62 Q-122,-80 -100,-82 L-74,-84 Q-54,-128 -18,-130 L40,-130 Q72,-128 90,-84 L112,-78 Q126,-74 126,-56 L126,-26 Z"
      fill={ink.stop}
    />
    <path d="M-52,-86 Q-38,-116 -14,-118 L8,-118 L8,-86 Z" fill={ink.paper} />
    <path d="M22,-118 L38,-118 Q58,-116 70,-86 L22,-86 Z" fill={ink.paper} />
    <circle cx={-72} cy={-24} r={26} fill={ink.dark} />
    <circle cx={76} cy={-24} r={26} fill={ink.dark} />
    <circle cx={-72} cy={-24} r={10} fill={ink.paper} />
    <circle cx={76} cy={-24} r={10} fill={ink.paper} />
  </g>
);

/** Milhar com ponto, como se escreve em português. */
const thousands = (value: number): string =>
  value < 1000 ? `${value}` : `${Math.floor(value / 1000)}.${`${value % 1000}`.padStart(3, "0")}`;

type CarriedProps = {
  /** O quadro em que o velocímetro acende, o em que o carro larga, e os dois entre os quais o contador dele sobe. */
  readonly litAt: number;
  readonly carAt: number;
  readonly days: readonly [from: number, to: number];
};

/**
 * O boneco na linha do equador é levado pela volta inteira; o velocímetro acende e sobe. Depois o carro
 * larga do mesmo ponto: na volta que o boneco completa, ele faz 6% do caminho.
 */
const Carried: React.FC<CarriedProps> = ({ litAt, carAt, days }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // Duas voltas do boneco: a do velocímetro, até o carro largar, e a da comparação, que fecha com o plano.
  const raced = linear(frame, carAt, Math.max(1, length - carAt));
  const lon = START + linear(frame, 0, Math.max(1, carAt)) + raced;
  const spot = surfacePoint(CARRIED.r, 0, lon);
  const depth = Math.cos(lon * Math.PI * 2);
  // O carro anda na mesma linha, na mesma conta de tempo: a proporção vale em todo quadro, e não só no fim.
  const carLon = START + CAR_SHARE * raced;
  const lapEnd = START + raced;
  const carX = CARRIED.cx + surfacePoint(CARRIED.r, 0, carLon).x;
  const carY = CARRIED.cy + CARRIED.r * RING_TILT * Math.cos(carLon * Math.PI * 2);
  // O contador sobe dia a dia e para no dezessete; só então ganha o "quase".
  const counted = Math.max(1, Math.round(CAR_DAYS * linear(frame, days[0], Math.max(1, days[1] - days[0]))));
  const climbed = ramp(frame, litAt, 1.3 * fps);
  // Chegando lá, o ponteiro treme um nada: o velocímetro está ligado.
  const value = TOP_VALUE * climbed + 0.006 * wave(frame / fps, 0.4) * climbed;
  // Opaco sempre. Do lado de lá ele é desenhado antes do globo, que o esconde: some atrás da borda leste e volta pela oeste.
  const figure = (
    <g
      transform={`translate(${CARRIED.cx + spot.x} ${CARRIED.cy + CARRIED.r * RING_TILT * depth}) scale(${(FIGURE_SCALE * (0.7 + 0.3 * Math.abs(depth))).toFixed(3)} ${FIGURE_SCALE})`}
    >
      <Figure />
    </g>
  );
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={[CARRIED.cx, CARRIED.cy]}>
        <Arrive from={0.86} focus={[CARRIED.cx, CARRIED.cy]}>
          <Svg>
            {spot.front ? null : figure}
            <Globe {...CARRIED} spin={lon} />
            <LatitudeRing {...CARRIED} lat={0} color={ink.accent} width={12} />
            {/* O caminho de cada um desde a largada, na própria linha: o do boneco fecha a volta, o do carro é um toco.
                Sem ele, o quadro final (o boneco de volta à largada, o carro um pouco adiante) lia como o carro na frente. */}
            {raced > 0 ? (
              <g fill="none" strokeLinecap="round">
                {lapEnd > 0.25 ? (
                  <path
                    d={equatorArc(CARRIED, 0.25, Math.min(lapEnd, 0.75))}
                    stroke={ink.paper}
                    strokeWidth={8}
                    opacity={0.45}
                  />
                ) : null}
                <path d={equatorArc(CARRIED, START, Math.min(lapEnd, 0.25))} stroke={ink.paper} strokeWidth={14} />
                {lapEnd > 0.75 ? (
                  <path d={equatorArc(CARRIED, 0.75, lapEnd)} stroke={ink.paper} strokeWidth={14} />
                ) : null}
                <path d={equatorArc(CARRIED, START, carLon)} stroke={ink.stop} strokeWidth={14} />
              </g>
            ) : null}
            {spot.front ? figure : null}
            {/* O carro fica na frente do boneco: os dois largam do mesmo ponto, e o boneco some para leste. */}
            <g
              opacity={popOpacity(frame, carAt, 0.3 * fps)}
              transform={`translate(${carX} ${carY}) scale(${CAR_SCALE * popScale(frame, carAt, 0.3 * fps)})`}
            >
              <Car />
            </g>
            <Gauge
              {...ROAD_GAUGE}
              value={value}
              label={frame < litAt ? undefined : `${thousands(Math.round(TOP_SPEED * climbed))} km/h`}
            />
          </Svg>
          {/* As duas etiquetas andam com o carro, embaixo da linha: em cima dela passa o boneco. */}
          <Place x={carX} y={carY + 74}>
            <Pop at={carAt + 0.15 * fps}>
              <Tag on="dark">100 km/h</Tag>
            </Pop>
          </Place>
          <Place x={carX} y={carY + 178}>
            <Pop at={days[0]}>
              <Tag on="dark">
                {counted < CAR_DAYS ? `${counted} ${counted === 1 ? "dia" : "dias"}` : `quase ${CAR_DAYS} dias`}
              </Tag>
            </Pop>
          </Place>
        </Arrive>
      </Push>
    </Frame>
  );
};

export const HowFastScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a que velocidade">
      <AtRest gaugeAt={cue(scene, "velocidade")} />
    </Shot>
    <Shot range={shots[1]} name="a volta e o tempo">
      <Measured
        // A fita dá a volta enquanto a fala diz "a volta completa em torno da Terra", e o número cai na palavra dele.
        tapeAt={cue(scene, "volta") - shots[1].from}
        lengthAt={cue(scene, "quarenta") - shots[1].from}
        clockAt={cue(scene, "percorre") - shots[1].from}
        hoursAt={cue(scene, "dia") - shots[1].from}
        // "leste" é a última palavra do plano: a seta sai em "solo" e a etiqueta entra meio segundo depois,
        // um nada antes da palavra, para ficar 1,5 s na tela (em "leste" ficava 0,8 s).
        eastAt={cue(scene, "solo") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="1.670 km/h">
      <Carried
        litAt={cue(scene, "dá", 2) - shots[2].from}
        carAt={cue(scene, "carro") - shots[2].from}
        days={[cue(scene, "levaria") - shots[2].from, cue(scene, "dezessete") - shots[2].from]}
      />
    </Shot>
  </>
);
