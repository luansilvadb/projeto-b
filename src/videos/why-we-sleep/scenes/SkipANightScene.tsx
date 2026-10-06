import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Stay } from "../../../components/Cast";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength, type Wipe } from "../../../video/Shot";
import { billHeight, BILL_LINES, SleepBill } from "../parts/SleepBill";
import {
  Critter,
  DEN,
  LATE_ORB,
  SavannaShot,
  Sweep,
  Thicket,
} from "./NightFallsScene";

// O dia varre a noite a partir da direita, em 0,25 s.
const DAYBREAK: Wipe = { frames: 8, from: "right" };
/**
 * De dia, o bicho fica no terço direito, virado para a conta, que fica no
 * esquerdo, sobre o céu: a cena `sleep-debt` começa neste mesmo enquadramento.
 */
export const OWING = framing([DEN.x, DEN.y - 100], 2.5, [1160, 700]);
/** Onde a conta fica no quadro: o meio do alto do papel. */
export const OWING_BILL = { x: 470, y: 150, scale: 1.2 };
/** Onde o sol está de manhã, do começo de um plano ao fim do outro: sobe devagar. */
export const MORNING_ORB = { from: 0.6, to: 0.62 };

/**
 * O balanço da conta aberta, em graus: o papel fica pendurado pelo alto e
 * nunca para de todo. `seconds` é o relógio do vídeo, e não o do plano: a
 * conta passa de plano em plano (daqui até `debt-returns`) sem o balanço saltar.
 */
export const billSway = (seconds: number): number => 1.5 * wave(seconds, 3.6);

// Em pé ele é alto: o plano fecha até ele ter metade da altura do quadro, com a árvore e a lua por cima.
const VIGIL = framing([DEN.x + 70, DEN.y - 130], 2.7, [900, 620]);
// O plano abre em corte, logo depois de um plano no mesmo lugar: para o corte
// não ser um pulo, o primeiro quadro é outro enquadramento, bem mais aberto e
// com o bicho do outro lado do meio, e a câmera chega ao quadro composto em
// seguida, com peso.
const VIGIL_OPENING = framing([DEN.x - 40, DEN.y - 170], 1.75, [1120, 640]);
const OPENING_SECONDS = 1;
// A noite andou no corte: a lua já está mais alta do que o plano anterior a
// deixou (`LATE_ORB`), noutro ponto do céu, e dali sobe até o meio dele, a velocidade constante.
const MOON = { from: LATE_ORB + 0.055, top: 0.5, seconds: 2.5 };
// As duas viradas de cabeça, de 0,5 s cada: em quantos quadros a cabeça vai
// (ou volta) e quantos fica olhando para trás na primeira. Na segunda ela não
// volta: o corpo é que a segue.
const LOOK = { turn: 7, hold: 2, gap: 4 };
// A meia-volta do fim do plano, em quadros: o corpo se abaixa (preparo), gira
// com um pulinho (ação) e assenta. A câmera vai junto, com peso, até o
// enquadramento da manhã; tudo termina 0,5 s antes de o dia varrer.
const ABOUT = { crouch: 3, spin: 7, settle: 6, camera: 19, rest: 15 };

/**
 * O cochilo em pé de quem deve sono, num instante: a cabeça pende e balança
 * devagar, sem nunca voltar a ficar erguida. `sleep-debt` continua daqui.
 */
export const drowsyNod = (seconds: number): number =>
  0.85 + 0.07 * wave(seconds, 2.1);

// O tranco de quem cochila em pé: quanto da cabeça caída ele desfaz, quanto o
// olho arregala e o corpo recua, e os quadros da subida, da parada e da queda.
const JERK = { lift: 0.9, stare: 0.85, lean: 2.5, up: 4, hold: 4, fall: 12 };
// Quantos quadros antes do fim do plano o tranco precisa começar, para assentar 0,5 s antes da troca.
const JERK_BEFORE_END = JERK.up + JERK.hold + JERK.fall + 15;

// De vigia, as orelhas giram: uma baixa e volta, de tempos em tempos.
const watchfulEar = (seconds: number): number =>
  -0.4 * Math.max(0, wave(seconds, 1.9)) ** 2;

/**
 * A pausa viva de quem está de vigia, num instante: o peso troca de pata, a
 * cabeça varre devagar, o olho passeia e uma orelha gira. O plano da manhã
 * redesenha a noite por baixo da varredura com estes mesmos valores.
 */
const vigilIdle = (seconds: number) => ({
  lean: 0.9 * wave(seconds, 4.1, 0.4),
  head: 4 * wave(seconds, 2.6, 0.2),
  glance: 0.25 * wave(seconds, 1.7),
  ear: watchfulEar(seconds),
});

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

type VigilShotProps = ShotClock & {
  /** Quadros do plano em que a lua começa a subir e em que ele olha em volta. */
  readonly moonAt: number;
  readonly lookAt: number;
};

/**
 * A noite inteira de vigia: o plano abre em corte com ele já em pé, de olhos
 * arregalados, virado para a moita, e a lua atravessa o céu. Em "acordado" ele
 * olha para trás e volta; olha de novo, e dessa vez o corpo vai atrás da
 * cabeça. É assim que ele termina o plano no lugar, no lado e na pose em que a
 * manhã o encontra: o dia só troca a pintura.
 */
const VigilShot: React.FC<VigilShotProps> = ({ moonAt, lookAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A meia-volta é marcada de trás para a frente, a partir do fim do plano.
  const spinAt = length - ABOUT.rest - ABOUT.settle - ABOUT.spin;
  const crouchAt = spinAt - ABOUT.crouch;
  // A primeira olhada vai e volta; a segunda vai e fica, até o corpo girar por baixo dela.
  const back = lookAt + LOOK.turn + LOOK.hold;
  const again = Math.min(
    back + LOOK.turn + LOOK.gap,
    crouchAt - LOOK.turn - LOOK.hold,
  );
  const spun = ramp(frame, spinAt, ABOUT.spin);
  const facing = mix(-1, 1, spun);
  // Na meia-volta a cabeça continua apontando para onde já olhava: no quadro em
  // que o corpo passa de um lado ao outro, "para trás" vira "para a frente", e
  // na tela ela não muda de lugar.
  const lookBack =
    ramp(frame, lookAt, LOOK.turn) -
    ramp(frame, back, LOOK.turn) +
    ramp(frame, again, LOOK.turn) -
    (facing >= 0 ? 1 : 0);
  // O preparo abaixa o corpo; o giro o solta do chão; a chegada o achata um pouco e ele balança até parar.
  const landed = (frame - spinAt - ABOUT.spin) / ABOUT.settle;
  const squash =
    1 -
    0.05 * ramp(frame, crouchAt, ABOUT.crouch) * (1 - spun) -
    (landed <= 0 || landed >= 1 ? 0 : 0.05 * Math.sin(Math.PI * landed));
  const lean =
    landed <= 0 || landed >= 1
      ? 0
      : 3 * (1 - landed) * Math.sin(landed * Math.PI * 2);
  const idle = vigilIdle(seconds);

  return (
    <SavannaShot
      camera={cameraBetween(
        cameraBetween(
          VIGIL_OPENING,
          VIGIL,
          ramp(frame, 0, OPENING_SECONDS * fps),
        ),
        OWING,
        ramp(frame, length - ABOUT.rest - ABOUT.camera, ABOUT.camera),
      )}
      daylight={0}
      orb={mix(MOON.from, MOON.top, linear(frame, moonAt, MOON.seconds * fps))}
      clock={clock}
    >
      <Thicket daylight={0} seconds={seconds} />
      <Critter
        daylight={0}
        alert
        // Virado para a moita (a direita) até a meia-volta; depois, para o lado em que a conta vai aparecer.
        facing={facing}
        lookBack={lookBack}
        hop={12 * Math.sin(Math.PI * spun)}
        squash={squash}
        {...idle}
        lean={lean + idle.lean}
        seconds={seconds}
      />
    </SavannaShot>
  );
};

type OwingShotProps = ShotClock & {
  /** Quadros do plano em que a conta entra, em que a última linha dela termina e em que a cabeça dá o tranco. */
  readonly oweAt: number;
  readonly doneAt: number;
  readonly jerkAt: number;
};

/** Amanhece: de olheiras, ele cochila em pé, e a conta de "sono devido" se escreve ao lado. */
const OwingShot: React.FC<OwingShotProps> = ({
  oweAt,
  doneAt,
  jerkAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A cabeça cai aos poucos e os joelhos cedem; no meio do plano ela dá um
  // tranco para cima e volta a cair, e é caída que o plano termina.
  // O tranco: a cabeça sobe de uma vez, em quatro quadros, de olho arregalado,
  // fica um instante lá em cima e volta a cair, com peso.
  const jerk =
    interpolate(frame, [jerkAt, jerkAt + JERK.up], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }) *
    (1 - ramp(frame, jerkAt + JERK.up + JERK.hold, JERK.fall));
  const nod =
    drowsyNod(seconds) *
    ramp(frame, 0.1 * fps, 1.2 * fps) *
    (1 - JERK.lift * jerk);
  // A conta desliza de cima do quadro para o lugar dela, e só então as linhas se escrevem, uma a uma.
  const slid = interpolate(frame, [oweAt, oweAt + 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const writeFrom = oweAt + 0.45 * fps;
  const slot = (doneAt - writeFrom) / BILL_LINES;
  const lines = Array.from({ length: BILL_LINES }, (_, index) =>
    ramp(frame, writeFrom + index * slot, Math.min(slot, 0.3 * fps)),
  ).reduce((sum, written) => sum + written, 0);
  const above = OWING_BILL.y + billHeight(0) * OWING_BILL.scale + 40;
  const idle = vigilIdle(seconds);
  const watch = 1 - ramp(frame, 0.1 * fps, 0.4 * fps);

  return (
    <>
      <Sweep
        wipe={DAYBREAK}
        under={
          // A noite do plano anterior, no último quadro dele: a mesma câmera, o
          // mesmo bicho no mesmo lugar e na mesma pose. A borda só troca a pintura.
          <SavannaShot camera={OWING} daylight={0} orb={MOON.top} clock={clock}>
            <Thicket daylight={0} seconds={seconds} />
            <Critter daylight={0} alert {...idle} seconds={seconds} />
          </SavannaShot>
        }
      >
        <SavannaShot
          camera={OWING}
          daylight={1}
          orb={mix(MORNING_ORB.from, MORNING_ORB.to, linear(frame, 0, length))}
          clock={clock}
        >
          <Thicket daylight={1} seconds={seconds} />
          <Critter
            daylight={1}
            nod={nod}
            tired={1}
            // Os olhos arregalados da noite pesam logo que o dia chega; a vigia (a
            // orelha, a cabeça que varre) se desfaz com eles. Enquanto a borda
            // passa, as duas pinturas ainda têm a mesma pose.
            alert={Math.max(watch, JERK.stare * jerk)}
            // No tranco o corpo vai um pouco para trás, com a cabeça.
            lean={idle.lean * watch + JERK.lean * jerk}
            head={idle.head * watch}
            glance={idle.glance * watch}
            ear={idle.ear * watch}
            seconds={seconds}
          />
        </SavannaShot>
      </Sweep>
      {/* A conta entra na fala, não com o plano, e fica para a cena seguinte, no mesmo lugar. */}
      <Stay>
        <Place
          x={OWING_BILL.x}
          y={OWING_BILL.y}
          style={{
            translate: `-50% ${-above * (1 - slid)}px`,
            transformOrigin: "50% 0",
            rotate: `${billSway(seconds)}deg`,
          }}
        >
          <SleepBill scale={OWING_BILL.scale} lines={lines} />
        </Place>
      </Stay>
    </>
  );
};

// O tranco da cabeça vem logo depois de "dívida", como na partitura, e nunca
// tão tarde que ela não esteja caída de novo, e parada, 0,5 s antes de o plano acabar.
const JERK_AFTER_FRAMES = 4;

export const SkipANightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a noite inteira de vigia">
      <VigilShot
        moonAt={cue(scene, "pular")}
        lookAt={cue(scene, "acordado")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="amanhece, e a conta se escreve">
      <OwingShot
        oweAt={cue(scene, "cobra") - shots[1].from}
        doneAt={cue(scene, "dívida") - shots[1].from}
        jerkAt={Math.min(
          cue(scene, "dívida") - shots[1].from + JERK_AFTER_FRAMES,
          shots[1].to - shots[1].from - JERK_BEFORE_END,
        )}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
