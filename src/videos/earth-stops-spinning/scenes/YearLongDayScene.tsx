import { useId } from "react";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale, POP_SECONDS } from "../../../components/Pop";
import { clamp01, cue, mix, ramp, walked } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { blockDay, earth, home, ink, space } from "../palette";
import { NightSide } from "../parts/ClimateGlobes";
import { Globe, House, landPoint, spinFor } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { SunDisc } from "../parts/Sky";

// A Terra de hoje, de lado, como no resto do vídeo: o Sol fica à esquerda, quase fora do quadro,
// e a metade direita é a noite. O que gira para leste sai do claro e entra no escuro.
const TODAY = { cx: 1040, cy: 462, r: 300 } as const;
const HOUSE = 104;

type TodayProps = {
  /** Os dois quadros em que a casinha cruza a linha da sombra: há uma volta inteira entre eles. */
  readonly dusk: readonly [number, number];
  /** Os quadros em que a fala nomeia o dia e a noite. */
  readonly named: readonly [number, number];
};

/** A Terra girando, metade clara e metade escura: a casinha passa do dia para a noite uma vez por volta. */
const Today: React.FC<TodayProps> = ({ dusk, named }) => {
  const id = useId();
  const frame = useCurrentFrame();
  // Com 0 a casinha está no meio do disco, em cima da linha da sombra.
  const spin = spinFor(0) + (frame - dusk[1]) / (dusk[1] - dusk[0]);
  const at = landPoint(TODAY.r, spin);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.43]} />}>
      <Push focus={[TODAY.cx, TODAY.cy]} to={1.04}>
        <Svg>
          <defs>
            <clipPath id={id}>
              <circle cx={TODAY.cx} cy={TODAY.cy} r={TODAY.r} />
            </clipPath>
          </defs>
          {/* Só a beira do Sol: o assunto é a Terra, e basta saber de que lado ele está. */}
          <SunDisc cx={-150} cy={TODAY.cy} r={300} />
          <Globe {...TODAY} spin={spin} shade={0} />
          {/* A casinha some atrás da beira do disco, e não no ar: é a Terra que a leva. */}
          <g clipPath={`url(#${id})`}>
            {at.front ? <House x={TODAY.cx + at.x} y={TODAY.cy + at.y} size={HOUSE} /> : null}
          </g>
          {/* A noite por cima de tudo: a casinha escurece quando entra nela. */}
          <NightSide {...TODAY} opacity={0.74} />
        </Svg>
      </Push>
      {/* As mesmas duas pílulas da Lua, na cena seguinte: amarela para o dia, branca para a noite. */}
      <Place x={TODAY.cx - 190} y={880}>
        <Pop at={named[0]}>
          <Tag on="dark">dia</Tag>
        </Pop>
      </Place>
      <Place x={TODAY.cx + 190} y={880}>
        <Pop at={named[1]}>
          <Tag on="note">noite</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

// De cima, com o norte para quem olha: a Terra dá a volta no Sol no sentido
// anti-horário. Uma volta (`turn` de 0 a 1) começa em cima do quadro, onde a
// bandeira está na linha da sombra, amanhecendo.
const SUN = { cx: 960, cy: 540, r: 118 } as const;
const ORBIT = 360;
const EARTH_R = 80;
// Até onde a bandeira chega, a partir do meio da Terra.
const FLAG_TIP = EARTH_R + 120;

const orbitPoint = (turn: number): readonly [number, number] => {
  const angle = Math.PI / 2 + turn * Math.PI * 2;
  return [SUN.cx + ORBIT * Math.cos(angle), SUN.cy - ORBIT * Math.sin(angle)];
};

/** O trecho da órbita entre duas frações da volta (no máximo meia volta). */
const orbitArc = (from: number, to: number): string => {
  const [x0, y0] = orbitPoint(from);
  const [x1, y1] = orbitPoint(to);
  return `M${x0},${y0} A${ORBIT},${ORBIT} 0 0 0 ${x1},${y1}`;
};

// O enquadramento: onde o Sol fica na tela, e em que escala. Nos planos dos dois movimentos e da
// bandeira o sistema vai para a esquerda, e a coluna da direita fica para o que se escreve e para
// a estrela; no calendário ele volta para o meio.
type View = { readonly x: number; readonly y: number; readonly scale: number };
const LEFT: View = { x: 560, y: 540, scale: 0.92 };
const CENTER: View = { x: 960, y: 540, scale: 0.94 };

const viewTransform = (view: View): string =>
  `translate(${view.x - SUN.cx * view.scale} ${view.y - SUN.cy * view.scale}) scale(${view.scale})`;

/** Onde um ponto do sistema aparece na tela. */
const onScreen = (view: View, [x, y]: readonly [number, number]): readonly [number, number] => [
  view.x + (x - SUN.cx) * view.scale,
  view.y + (y - SUN.cy) * view.scale,
];

/** O fundo do espaço, com o clarão atrás do Sol. */
const SunBackdrop: React.FC<{ readonly view: View }> = ({ view }) => (
  <SpaceBackdrop light={[view.x / 1920, view.y / 1080]} />
);

type OrbiterProps = {
  readonly turn: number;
  /** Quanto a Terra já girou em torno de si mesma, em voltas: sem valor, ela não gira. */
  readonly spun?: number;
};

/**
 * A Terra vista de cima, num ponto da volta. Sem `spun`, os continentes e a
 * bandeirinha não giram (ela aponta sempre para a direita do quadro); só o
 * lado da noite acompanha o Sol.
 */
const Orbiter: React.FC<OrbiterProps> = ({ turn, spun = 0 }) => {
  const [x, y] = orbitPoint(turn);
  const angle = Math.PI / 2 + turn * Math.PI * 2;
  return (
    <g>
      {/* De cima, girar é rodar no lugar, no mesmo sentido da volta: anti-horário. */}
      <g transform={`rotate(${-spun * 360} ${x} ${y})`}>
        <Globe cx={x} cy={y} r={EARTH_R} spin={0.08} shade={0} caps={false} />
      </g>
      {/* A noite fica do lado oposto ao Sol. */}
      <NightSide cx={x} cy={y} r={EARTH_R} turn={(-angle * 180) / Math.PI} opacity={0.72} />
      {/*
        A bandeira, fincada num lugar: é a prova de que a Terra gira ou não gira, e fica em cor cheia
        a volta inteira. Quem diz se ali é dia ou noite é o lado da Terra em que ela está fincada.
      */}
      <g transform={`translate(${x} ${y}) rotate(${-spun * 360}) translate(${EARTH_R - 8} 0)`}>
        <path d="M46,-7 L124,-7 L124,-84 Z" fill={home.curtain} />
        <rect x={0} y={-8} width={128} height={16} rx={8} fill={ink.paper} />
      </g>
    </g>
  );
};

const OrbitLine: React.FC = () => (
  <circle cx={SUN.cx} cy={SUN.cy} r={ORBIT} fill="none" stroke={earth.ghost} strokeWidth={4} strokeDasharray="6 18" opacity={0.35} />
);

// Um giro da Terra em torno de si mesma, em segundos: depressa o bastante para se ver que são
// muitos giros numa volta só. A proporção de verdade (365 para 1) fica nas etiquetas.
const SPIN_SECONDS = 1.7;
// A seta do giro, em volta da Terra: três quartos de círculo.
const SPIN_ARROW = EARTH_R + 30;

type MovementsProps = {
  /** Em que ponto da volta a Terra está em cada quadro do plano. */
  readonly turnAt: (frame: number) => number;
  /** Os quadros em que a fala nomeia o giro e a volta, e o quadro em que o giro é desligado. */
  readonly spinAt: number;
  readonly lapAt: number;
  readonly offAt: number;
};

/**
 * Os dois movimentos na mesma imagem: a Terra gira em torno de si mesma (a bandeira roda com ela)
 * e dá a volta no Sol. Em "desligou" só o giro para: a bandeira fica apontando para a direita, e a
 * etiqueta dele se apaga, riscada.
 */
const TwoMovements: React.FC<MovementsProps> = ({ turnAt, spinAt, lapAt, offAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = turnAt(frame);
  // O giro freia a partir da palavra e para num número inteiro de giros: a bandeira para apontando
  // para a direita, como vai ficar no plano seguinte.
  const stopped = offAt + 0.7 * fps;
  const spun = Math.round(stopped / fps / SPIN_SECONDS) * walked(frame / stopped, offAt / stopped);
  const off = ramp(frame, offAt + 0.2 * fps, 0.5 * fps);
  const [x, y] = orbitPoint(turn);
  const pop = (at: number) => ({
    opacity: popOpacity(frame, at, POP_SECONDS * fps),
    scale: popScale(frame, at, POP_SECONDS * fps),
  });
  const spinArrow = pop(spinAt);
  const lapArrow = pop(lapAt);
  const spinColor = interpolateColors(off, [0, 1], [ink.accent, blockDay.idle]);
  const [tipX, tipY] = orbitPoint(turn + 0.17);
  return (
    <Frame backdrop={<SunBackdrop view={LEFT} />}>
      <Svg>
        <g transform={viewTransform(LEFT)}>
          <OrbitLine />
          {/* A seta da volta: vai na frente da Terra, na própria órbita, branca como a etiqueta dela. */}
          <g opacity={lapArrow.opacity}>
            <path d={orbitArc(turn + 0.07, turn + 0.17)} fill="none" stroke={earth.ghost} strokeWidth={12} strokeLinecap="round" />
            <path
              d="M30,0 L-16,-24 L-16,24 Z"
              fill={earth.ghost}
              transform={`translate(${tipX} ${tipY}) rotate(${-(turn + 0.17) * 360 - 180})`}
            />
          </g>
          <SunDisc {...SUN} />
          <Orbiter turn={turn} spun={spun} />
          {/* A seta do giro, amarela como a etiqueta dele e como a alavanca: roda com a Terra e para com ela. */}
          <g
            transform={`translate(${x} ${y}) rotate(${-spun * 360 - 40}) scale(${spinArrow.scale})`}
            opacity={spinArrow.opacity * mix(1, 0.55, off)}
          >
            <path
              d={`M${SPIN_ARROW},0 A${SPIN_ARROW},${SPIN_ARROW} 0 1 0 0,${SPIN_ARROW}`}
              fill="none"
              stroke={spinColor}
              strokeWidth={12}
              strokeLinecap="round"
              // Desligado, o caminho do giro fica só marcado.
              strokeDasharray={off > 0.5 ? "4 22" : undefined}
            />
            <path d="M30,0 L-16,-24 L-16,24 Z" fill={spinColor} transform={`translate(0 ${SPIN_ARROW})`} opacity={1 - off} />
          </g>
        </g>
      </Svg>
      <Place x={1445} y={370}>
        <Pop at={spinAt}>
          <div style={{ position: "relative" }}>
            {/* Apagada, e não sumida: o movimento continua tendo nome, só não acontece mais. */}
            <div style={{ filter: `grayscale(${off})`, opacity: mix(1, 0.85, off) }}>
              <Tag on="dark">rotação: 1 dia</Tag>
            </div>
            <div
              style={{
                position: "absolute",
                left: "-4%",
                top: "50%",
                width: `${108 * off}%`,
                height: 5,
                marginTop: 1,
                borderRadius: 3,
                background: ink.stop,
              }}
            />
          </div>
        </Pop>
      </Place>
      <Place x={1445} y={640}>
        <Pop at={lapAt}>
          <div style={{ textAlign: "center" }}>
            <Tag on="note">
              volta em torno do Sol:
              <br />1 ano
            </Tag>
          </div>
        </Pop>
      </Place>
    </Frame>
  );
};

/** O rastro da última volta: guarda o que a bandeira viveu em cada trecho, luz ou noite. */
const Trail: React.FC<{ readonly from: number; readonly turn: number }> = ({ from, turn }) => {
  const start = Math.max(from, turn - 1);
  const halves = [];
  for (let half = Math.floor(start * 2); half / 2 < turn; half++) {
    const [a, b] = [Math.max(start, half / 2), Math.min(turn, (half + 1) / 2)];
    if (b - a > 0.002) {
      halves.push(<path key={half} d={orbitArc(a, b)} stroke={half % 2 === 0 ? space.sun : blockDay.night} />);
    }
  }
  return (
    <g fill="none" strokeWidth={14} strokeLinecap="round">
      {halves}
    </g>
  );
};

// A estrela está muito longe, fora do quadro: o que se vê dela é a marca na borda direita, no fim
// da linha de mira. A linha sai da bandeira sempre na mesma direção, e a marca sobe e desce com a
// Terra: com a estrela desenhada perto, a bandeira deixava de apontar para ela no alto e embaixo
// da volta, e a linha sumia.
const STAR = { x: 1740, r: 46 } as const;
/** A altura da marca da estrela, na tela, com a Terra num ponto da volta: a da bandeira. */
const starY = (turn: number): number => onScreen(LEFT, orbitPoint(turn))[1];

const Star: React.FC<{ readonly x: number; readonly y: number; readonly grown?: number }> = ({ x, y, grown = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${grown})`}>
    <circle r={STAR.r * 1.5} fill={space.star} opacity={0.14} />
    <path
      d={`M0,${-STAR.r} Q6,-6 ${STAR.r},0 Q6,6 0,${STAR.r} Q-6,6 ${-STAR.r},0 Q-6,-6 0,${-STAR.r} Z`}
      fill={space.star}
    />
  </g>
);

type LapProps = {
  readonly turnAt: (frame: number) => number;
  /** O quadro em que a fala chega à estrela. */
  readonly starAt: number;
};

/**
 * A Terra sem rotação dá a volta no Sol, e a bandeira não gira em relação ao quadro em nenhum
 * momento: aponta sempre para a direita, para a estrela distante. Quem muda é de que lado está o
 * Sol: meia volta a bandeira fica no claro, meia volta no escuro.
 */
const OneLap: React.FC<LapProps> = ({ turnAt, starAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = turnAt(frame);
  const [x, y] = orbitPoint(turn);
  const [tipX, tipY] = onScreen(LEFT, [x + FLAG_TIP, y]);
  const shown = popOpacity(frame, starAt, POP_SECONDS * fps);
  return (
    <Frame backdrop={<SunBackdrop view={LEFT} />}>
      <Svg>
        {/* Por baixo do Sol: com a bandeira de frente para ele, é o Sol que fica na frente da estrela. */}
        <line
          x1={tipX + 26}
          y1={tipY}
          x2={STAR.x - STAR.r - 26}
          y2={tipY}
          stroke={earth.ghost}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="4 20"
          opacity={0.8 * shown}
        />
        <g transform={viewTransform(LEFT)}>
          <OrbitLine />
          <Trail from={turnAt(0)} turn={turn} />
          <SunDisc {...SUN} />
          <Orbiter turn={turn} />
        </g>
        <Star x={STAR.x} y={tipY} grown={popScale(frame, starAt, POP_SECONDS * fps) * shown} />
      </Svg>
      <Place x={STAR.x} y={tipY + 112}>
        {/* A etiqueta nomeia a marca e sai: subindo e descendo com ela, disputaria o olho com a Terra. */}
        <div style={{ opacity: 1 - ramp(frame, starAt + 2 * fps, 0.4 * fps) }}>
          <Pop at={starAt + 0.15 * fps}>
            <Tag on="note">estrela</Tag>
          </Pop>
        </div>
      </Place>
    </Frame>
  );
};

const MONTHS = 12;

type RingProps = {
  /** Os quadros em que a fala chega aos seis meses de luz e aos seis meses de noite. */
  readonly lightAt: number;
  readonly nightAt: number;
  /** Quantos quadros a Terra leva numa volta: o passo em que o plano anterior terminou. */
  readonly lap: number;
};

/** A volta vira um calendário em anel: doze meses, seis claros e seis escuros. */
const CalendarRing: React.FC<RingProps> = ({ lightAt, nightAt, lap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // O rastro fino do plano anterior engrossa e se parte em meses.
  const formed = ramp(frame, 0, 0.7 * fps);
  const gap = 0.006 * formed;
  // A Terra segue a volta de onde o plano anterior parou, no mesmo passo. Quem acompanha a fala
  // é o anel: a metade clara incha em "luz", com o anel já formado (no primeiro "seis" ele ainda
  // está se partindo em meses e o inchaço se perdia), e a escura quando a fala chega à noite.
  const turn = (frame / lap) % 1;
  const current = Math.floor(turn * MONTHS);
  const swell = (at: number) => ramp(frame, at, 0.3 * fps) * (1 - ramp(frame, at + 0.5 * fps, 0.6 * fps));
  const named = [swell(lightAt), swell(nightAt)] as const;
  // A câmera sai do enquadramento da bandeira e centra o anel, que agora é o assunto.
  const centered = ramp(frame, 0, 1.1 * fps);
  const view: View = {
    x: mix(LEFT.x, CENTER.x, centered),
    y: LEFT.y,
    scale: mix(LEFT.scale, CENTER.scale, centered),
  };
  return (
    <Frame backdrop={<SunBackdrop view={view} />}>
      <Svg>
        {/* A estrela fica onde estava, apagando: o anel passa na frente dela ao ir para o meio. */}
        <g opacity={0.9 * (1 - centered)}>
          <Star x={STAR.x} y={starY(0)} />
        </g>
        <g transform={viewTransform(view)}>
          <g fill="none">
            {Array.from({ length: MONTHS }, (_, month) => (
              <path
                key={month}
                d={orbitArc(month / MONTHS + gap, (month + 1) / MONTHS - gap)}
                stroke={month < MONTHS / 2 ? space.sun : blockDay.night}
                // O mês em que a Terra está fica mais largo.
                strokeWidth={
                  14 + 66 * formed + (month === current ? 22 * formed : 0) + 26 * named[month < MONTHS / 2 ? 0 : 1]
                }
                strokeLinecap={formed < 0.2 ? "round" : "butt"}
              />
            ))}
          </g>
          <SunDisc {...SUN} />
          <Orbiter turn={turn} />
        </g>
      </Svg>
    </Frame>
  );
};

export const YearLongDayScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const [today, movements, flag, calendar] = shots;
  const flagLength = flag.to - flag.from;
  // A volta da bandeira é uma demonstração em poses, uma volta e meia ao todo: a fala diz que a
  // volta leva um ano e que o Sol nasce uma vez por ano, e várias voltas na tela seriam vários anos.
  // A Terra vem devagar de baixo do quadro e assenta à esquerda do Sol, com a bandeira apontada
  // direto para ele, um instante antes de "frente"; de "frente" a "costas" dá meia volta num
  // movimento só e para à direita, com a bandeira oposta a ele; depois segue devagar até o alto,
  // o amanhecer, de onde o calendário continua. Toda troca de passo parte do repouso ou chega a
  // ele: não há tranco.
  const starAt = cue(scene, "estrela") - flag.from;
  const frontAt = cue(scene, "frente") - flag.from;
  const backAt = cue(scene, "costas") - flag.from;
  const arriveAt = frontAt - 0.3 * fps;
  const leaveAt = backAt + 0.4 * fps;
  const flagTurn = (frame: number) => {
    // Chega freando: começa no passo do plano anterior e para na pose.
    const coming = clamp01(frame / arriveAt);
    // Sai acelerando do repouso, e passa do fim do plano no passo em que o calendário segue.
    const going = Math.max(0, (frame - leaveAt) / (flagLength - leaveAt));
    return (
      0.5 +
      0.75 * (1.5 * coming - 0.5 * coming ** 3) +
      0.5 * ramp(frame, frontAt, backAt - frontAt) +
      0.25 * (1.5 * going ** 2 - 0.5 * going ** 3)
    );
  };
  // O passo, em quadros por volta, com que a Terra entra no plano da bandeira e com que sai dele:
  // os planos vizinhos andam assim, devagar, e o corte não muda nem a posição nem a velocidade.
  const firstLap = arriveAt / (0.75 * 1.5);
  const lastLap = (flagLength - leaveAt) / (0.25 * 1.5);
  const movementsLength = movements.to - movements.from;
  return (
    <>
      <Shot range={today} name="a Terra de hoje: dia e noite">
        <Today
          dusk={[cue(scene, "noite"), cue(scene, "depois")]}
          named={[cue(scene, "dia", 2), cue(scene, "noite")]}
        />
      </Shot>
      <Shot range={movements} name="os dois movimentos">
        <TwoMovements
          turnAt={(frame) => flagTurn(0) - (movementsLength - frame) / firstLap}
          spinAt={cue(scene, "girar") - movements.from}
          lapAt={cue(scene, "volta") - movements.from}
          offAt={cue(scene, "desligou") - movements.from}
        />
      </Shot>
      <Shot range={flag} name="uma volta no Sol, apontando para a estrela">
        <OneLap turnAt={flagTurn} starAt={starAt} />
      </Shot>
      <Shot range={calendar} name="o calendário em anel">
        <CalendarRing
          lightAt={cue(scene, "luz") - calendar.from}
          nightAt={cue(scene, "seis", 2) - calendar.from}
          lap={lastLap}
        />
      </Shot>
    </>
  );
};
