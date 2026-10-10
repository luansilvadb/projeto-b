import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { blink } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, drop, linear, mix, ramp, settle, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { home, storm } from "../palette";
import { CUP, Cup, STARTLED, Vig } from "../parts/Actor";
import { FlungVig } from "../parts/Flung";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, StormBackdrop, Svg, Tag } from "../parts/kit";

// O corpo segue para leste e os cascos ficam: ela passa do pé, a xícara à frente.
const LURCH: VigiliaPose = {
  ...STARTLED,
  hip: [20, -30],
  lean: 26,
  farHand: [98, -50],
  nearHand: [-44, -84],
  nearFoot: 24,
  farFoot: 12,
};

/** A cozinha: o chão trava debaixo dela, e o café se inclina na xícara. */
const FloorLocks: React.FC<{ readonly lockAt: number }> = ({ lockAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = frame / fps;
  const lid = Math.max(CUP.nearLid, blink(seconds, "you-too"));
  const calm: VigiliaPose = { ...CUP, nearLid: lid, farLid: lid };
  // O susto vem depois do tranco, e só então o corpo vai.
  const startled = settle(frame, lockAt + 2, 0.15 * fps);
  const going = ramp(frame, lockAt + 0.25 * fps, 0.5 * fps);
  const carried = drop(frame, lockAt + 0.2 * fps, Math.max(1, length - lockAt - 0.2 * fps));
  // O café continua indo: sobe do lado de leste e balança até assentar inclinado.
  const slosh =
    -24 * settle(frame, lockAt, 0.2 * fps) + shake(frame, lockAt, 0.9 * fps, 14, 3);
  return (
    // A casa, presa ao chão, leva o tranco; ela e o café, não. O cenário sangra 2% além do quadro,
    // para o tranco não mostrar a borda dele.
    <div
      style={{
        position: "absolute",
        inset: 0,
        scale: "1.02",
        translate: `${shake(frame, lockAt, 0.35 * fps, -14, 2)}px 0px`,
      }}
    >
      <Frame
        backdrop={
          <Kitchen sun={0.6} sunAt={0.7} curtain={-9 * settle(frame, lockAt, 0.3 * fps) + shake(frame, lockAt, fps, 6, 3)}>
            <Vig
              x={KITCHEN.stand[0] + 150 * carried}
              y={KITCHEN.stand[1]}
              scale={3.4}
              pose={mixPose(mixPose(calm, STARTLED, startled), LURCH, going)}
              shadow={home.contact}
              held={<Cup slosh={slosh} steam={frame / 9} />}
            />
          </Kitchen>
        }
      >
        {null}
      </Frame>
    </div>
  );
};

// A casa dela na tempestade, em unidades próprias: o chão é y = 0, o meio é x = 0.
type StormHouseProps = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  /** As paredes e o telhado: onde estão em relação à fundação, e quanto giraram. */
  readonly torn?: readonly [dx: number, dy: number, degrees: number];
  /** Quanto da rachadura entre a fundação e a parede já abriu, de 0 a 1. */
  readonly crack?: number;
  /** A largura da sapata sob a laje, em volta de 1: pulsa quando a fala diz que a fundação fica presa. */
  readonly piles?: number;
  /** Quanto o vento já sacode a casa, de 0 a 1, e o quadro: as telhas batem, o telhado levanta do lado do vento. */
  readonly rattle?: number;
  readonly frame?: number;
};

// As telhas soltas na água de oeste do telhado, de baixo para cima: onde ficam e com que sacudida cada uma sai voando.
const TILES: readonly (readonly [x: number, y: number, leavesAt: number])[] = [
  [-214, -300, 0.62],
  [-166, -329, 2],
  [-118, -358, 0.84],
  [-70, -387, 2],
  [-26, -413, 2],
];
// A inclinação da água do telhado, em graus.
const ROOF_SLOPE = -31;
/** A rajada: o vento vem em ondas, e a sacudida da casa acompanha. */
const gustOf = (frame: number): number => 0.55 + 0.45 * Math.sin(frame * 0.21);

/**
 * A casa vista de fora: a fundação clara, assentada no chão, e por
 * cima dela, em silhueta, as paredes e o telhado, com a janela da cozinha.
 */
const StormHouse: React.FC<StormHouseProps> = ({
  x,
  y,
  scale,
  torn = [0, 0, 0],
  crack = 0,
  piles = 1,
  rattle = 0,
  frame = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* O que fica: a laje, assentada no chão. Sem estacas à vista: com elas a casa lia como mesa. */}
    <rect x={-236 * piles} y={-6} width={472 * piles} height={22} fill={storm.fixed} opacity={0.5} />
    <path
      d="M-212,-28 L-212,-58 L-190,-44 L-168,-66 L-140,-40 L-96,-52 L-60,-34 L10,-50 L70,-36 L120,-62 L160,-40 L190,-70 L212,-46 L212,-28 Z"
      fill={storm.carried}
    />
    <path d="M-236,0 L-236,-22 Q-236,-32 -226,-32 L226,-32 Q236,-32 236,-22 L236,0 Z" fill={storm.fixed} />
    {/* O que vai: as paredes, o telhado e a moldura da janela onde ela estava. */}
    <g transform={`translate(${torn[0]} ${torn[1]}) rotate(${torn[2]} 0 -200)`}>
      <rect x={-212} y={-290} width={424} height={258} fill={storm.carried} />
      {/* O telhado levanta do lado de onde o vento vem, e bate de volta. */}
      <g transform={`rotate(${3.2 * rattle * gustOf(frame) * Math.max(0, Math.sin(frame * 0.62))} 256 -282)`}>
        <path d="M-256,-282 L0,-436 L256,-282 Z" fill={storm.groundShade} />
        {rattle > 0
          ? TILES.map(([x, y, leavesAt], index) => {
              const gone = Math.max(0, rattle - leavesAt) * 9;
              // Cada telha bate no tempo dela, presa pela ponta de cima; a que se solta vai embora para leste.
              const flap = 46 * rattle * gustOf(frame) * Math.max(0, Math.sin(frame * (0.9 + 0.17 * index) + index));
              return (
                <rect
                  key={index}
                  x={-40}
                  y={-7}
                  width={46}
                  height={13}
                  rx={3}
                  fill={storm.carried}
                  transform={`translate(${x + 1500 * gone * gone} ${y - 260 * gone}) rotate(${ROOF_SLOPE + flap + 500 * gone})`}
                />
              );
            })
          : null}
      </g>
      <rect x={-156} y={-190} width={84} height={158} rx={8} fill={storm.groundShade} />
      <circle cx={-88} cy={-110} r={8} fill={storm.dust} />
      <rect x={10} y={-240} width={166} height={134} rx={14} fill={home.frame} />
      <rect x={24} y={-226} width={138} height={106} rx={8} fill={storm.dust} />
      <rect x={88} y={-226} width={10} height={106} fill={home.frame} />
      <path d="M24,-226 L62,-226 Q50,-170 30,-120 L24,-120 Z" fill={home.curtain} />
      {/* A rachadura, rente à fundação. */}
      <path
        d="M-212,-52 L-176,-64 L-140,-46 L-96,-60 L-50,-44 L10,-60 L70,-44 L120,-64 L170,-46 L212,-60"
        fill="none"
        stroke={storm.dust}
        strokeWidth={7}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${crack} 1`}
        opacity={crack > 0 ? 1 : 0}
      />
    </g>
  </g>
);

/** Um carro em silhueta: o meio da base fica na origem. */
const Car: React.FC = () => (
  <g>
    <path
      d="M-150,-34 L-150,-70 Q-146,-88 -120,-90 L-84,-92 Q-60,-140 -20,-142 L50,-142 Q84,-140 104,-92 L136,-86 Q152,-82 152,-62 L152,-34 Z"
      fill={storm.carried}
    />
    <path d="M-62,-94 Q-46,-126 -18,-128 L10,-128 L10,-94 Z" fill={storm.dust} />
    <path d="M24,-128 L48,-128 Q70,-126 84,-94 L24,-94 Z" fill={storm.dust} />
    <circle cx={-88} cy={-30} r={30} fill={storm.groundShade} />
    <circle cx={90} cy={-30} r={30} fill={storm.groundShade} />
    <circle cx={-88} cy={-30} r={12} fill={storm.dust} />
    <circle cx={90} cy={-30} r={12} fill={storm.dust} />
  </g>
);

/** A caixa de correio, sem o poste: o meio da base fica na origem. */
const Mailbox: React.FC = () => (
  <g>
    <path d="M-52,0 L-52,-44 Q-52,-74 -20,-74 L52,-74 L52,0 Z" fill={storm.carried} />
    <rect x={30} y={-104} width={10} height={44} fill={storm.carried} />
    <rect x={30} y={-104} width={34} height={22} fill={storm.dustDeep} />
  </g>
);

const STREET = { ground: 800, house: 400, post: 930, car: 1370, door: 560 } as const;

// O que é levado: sai acelerando para leste, com um pouco de subida e de giro, e deixa o quadro.
const flight = (frame: number, at: number, frames: number) => {
  const gone = drop(frame, at, frames);
  return { dx: 2300 * gone, lift: Math.sin(Math.min(1, gone * 1.6) * Math.PI * 0.5), gone };
};

/** A rua dela: o que não é rocha sai para leste, e o chão fica. */
const StreetGoes: React.FC<{ readonly flingAt: number; readonly speedAt: number }> = ({
  flingAt,
  speedAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blowing = ramp(frame, flingAt - 4, 0.3 * fps);
  const her = flight(frame, flingAt, 1.1 * fps);
  const box = flight(frame, flingAt + 2, 0.9 * fps);
  const car = flight(frame, flingAt + 5, 1.2 * fps);
  return (
    <Frame backdrop={<StormBackdrop wind={mix(0.15, 1, blowing)} />}>
      <Push focus={[960, 620]} to={1.05}>
        <Svg>
          <rect x={-400} y={STREET.ground} width={2720} height={700} fill={storm.ground} />
          <rect x={-400} y={STREET.ground + 46} width={2720} height={700} fill={storm.groundShade} opacity={0.5} />
          {/* Ela sai de dentro de casa, pelo lado de leste, inteira e com a xícara. */}
          {frame >= flingAt ? (
            <FlungVig
              x={STREET.door + her.dx}
              y={STREET.ground - 90 - 110 * her.lift}
              scale={1.7}
              tumble={-18 + 50 * her.gone}
              streaks={storm.streak}
            />
          ) : null}
          <g transform={`rotate(${shake(frame, flingAt, 0.6 * fps, 1.6, 4)} ${STREET.house} ${STREET.ground})`}>
            <StormHouse x={STREET.house} y={STREET.ground} scale={0.98} />
          </g>
          {/* O poste da caixa de correio fica; a caixa vai. */}
          <rect x={STREET.post - 9} y={STREET.ground - 150} width={18} height={170} rx={6} fill={storm.fixed} />
          <g
            transform={`translate(${STREET.post + box.dx} ${STREET.ground - 150 - 70 * box.lift}) rotate(${260 * box.gone})`}
          >
            <Mailbox />
          </g>
          <g
            transform={`translate(${STREET.car + car.dx} ${STREET.ground - 50 * car.lift}) rotate(${-16 * car.lift + 30 * car.gone} 0 -70)`}
          >
            <Car />
          </g>
          {/* Depois dela, o resto do que estava solto continua passando. */}
          {Array.from({ length: 9 }, (_, index) => {
            const pick = (trait: string) => random(`you-too-debris-${trait}-${index}`);
            const since = frame - flingAt - 0.5 * fps - index * 9;
            if (since < 0) {
              return null;
            }
            const speed = 46 + 30 * pick("speed");
            const x = ((since * speed) % 3200) - 300;
            const size = 0.7 + 0.8 * pick("size");
            return (
              <g
                key={index}
                transform={`translate(${x} ${300 + 440 * pick("y")}) rotate(${since * (8 + 14 * pick("turn"))}) scale(${size})`}
                fill={storm.carried}
              >
                {index % 3 === 0 ? (
                  <rect x={-50} y={-9} width={100} height={18} rx={5} />
                ) : index % 3 === 1 ? (
                  <path d="M-34,-22 L34,-22 L26,22 L-26,22 Z" />
                ) : (
                  <path d="M-30,0 Q0,-30 30,0 Q0,16 -30,0 Z" />
                )}
              </g>
            );
          })}
        </Svg>
      </Push>
      <Place x={1120} y={230}>
        <Pop at={speedAt}>
          <Tag on="warm" size="label">
            cerca de 1.500 km/h
          </Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

const HOME = { x: 900, ground: 850, scale: 1.55 } as const;

/** A casa: a fundação fica presa ao chão; as paredes e o telhado se soltam e seguem para leste. */
const HouseTears: React.FC<{
  readonly holdAt: number;
  readonly crackAt: number;
  readonly tearAt: number;
}> = ({ holdAt, crackAt, tearAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cracked = linear(frame, crackAt, Math.max(1, tearAt - crackAt));
  const away = drop(frame, tearAt, 1.3 * fps);
  // O vento sacode a casa desde o começo do plano, em rajadas, cada vez mais: as paredes rangem
  // contra a fundação e as telhas batem, bem antes de qualquer coisa rasgar.
  const rattle = mix(0.3, 1, linear(frame, 0, tearAt));
  const gust = gustOf(frame);
  const strain = (2 + 7 * rattle * gust + 3 * cracked) * Math.sin(frame * 1.9) * (away > 0 ? 0 : 1);
  const focus: readonly [number, number] = [HOME.x, 560];
  return (
    <Frame backdrop={<StormBackdrop />}>
      {/* Chega de mais aberto, vindo da rua. */}
      <Push focus={focus} from={0.72} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Push focus={focus}>
          <Svg>
            <rect x={-900} y={HOME.ground} width={3720} height={900} fill={storm.ground} />
            <rect x={-900} y={HOME.ground + 150} width={3720} height={900} fill={storm.groundShade} opacity={0.5} />
            <StormHouse
              x={HOME.x}
              y={HOME.ground}
              scale={HOME.scale}
              torn={[strain + 1700 * away, -150 * Math.sin(Math.min(1, away * 2) * Math.PI * 0.5), strain * 0.16 + 16 * away]}
              rattle={rattle}
              frame={frame}
              crack={cracked}
              piles={1 + 0.35 * shake(frame, holdAt, 0.5 * fps, 1, 1.5)}
            />
            {/* Os pedaços que saem com a parede. */}
            {Array.from({ length: 6 }, (_, index) => {
              const pick = (trait: string) => random(`you-too-chip-${trait}-${index}`);
              const gone = drop(frame, tearAt + index * 2, (0.9 + 0.6 * pick("speed")) * fps);
              return gone <= 0 ? null : (
                <rect
                  key={index}
                  x={-26}
                  y={-8}
                  width={52}
                  height={16}
                  rx={4}
                  fill={storm.carried}
                  transform={`translate(${HOME.x - 300 + 600 * pick("x") + 1900 * gone} ${HOME.ground - 70 - 240 * pick("y") * Math.sin(Math.min(1, gone * 2) * Math.PI * 0.5)}) rotate(${frame * (9 + 10 * pick("turn"))})`}
                />
              );
            })}
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

export const YouTooScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o chão trava">
      <FloorLocks lockAt={cue(scene, "trava")} />
    </Shot>
    <Shot range={shots[1]} name="a rua sai para leste">
      <StreetGoes
        flingAt={cue(scene, "arremessado") - shots[1].from}
        speedAt={cue(scene, "cerca") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="a fundação fica">
      <HouseTears
        holdAt={cue(scene, "fundação") - shots[2].from}
        crackAt={cue(scene, "resto") - shots[2].from}
        tearAt={cue(scene, "rasgar") - shots[2].from}
      />
    </Shot>
  </>
);
