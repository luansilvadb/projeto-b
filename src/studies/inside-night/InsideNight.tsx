// Estudo fora de qualquer vídeo: "A noite, por dentro", em movimento.
//
// Parte do quadro-chave aprovado e prova o movimento: a câmera que viaja pelo
// lugar com as camadas respondendo, a luz que muda, o mecanismo que acontece e
// os dois personagens atuando com o corpo. Uma tomada só, de 12,5 s, muda: a
// fala a que ela responde ("Só que o corpo cobra o sono que faltou, como quem
// cobra uma dívida.") começaria em 3,4 s.
//
// O que a imagem afirma: a pressão acumulada no reservatório empurra a
// alavanca para o lado de dormir, pelo conduto; a Vigília a segura, e a
// alavanca, pelo cabo, segura a pálpebra da janela aberta. O Contador faz a
// conta nas lâmpadas da borda do anel.
//
// Os arquivos: `timing.ts` é a partitura em números; `acting.ts`, a atuação da
// Vigília, pose a pose, sobre as poses de `poses.ts`; `base.tsx`, a paleta e a
// geometria; `scenery.tsx`, o lugar; `cast.tsx`, os dois. O desenho dela é o
// de `src/art/Vigilia.tsx`, e a folha de modelo, `VigiliaSheet.tsx`.

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Layer } from "../../components/Camera";
import { Grain } from "../../components/Grain";
import { SvgLayer } from "../../components/SvgLayer";
import {
  AbyssMist,
  Beam,
  Cable,
  Conduit,
  Deep,
  EyeWindow,
  FarGrove,
  FloorShadows,
  Foreground,
  Groves,
  Halo,
  Lever,
  Motes,
  NowProvider,
  RingFront,
  Vault,
  Vessel,
  Walkway,
  Warmth,
  WaveFront,
  type Now,
} from "./scenery";
import { vigiliaAt } from "./acting";
import { C, DEPTH, LEVER } from "./base";
import { Contador, Vigilia } from "./cast";
import {
  dozeAt,
  levelAt,
  leverAngle,
  lidAt,
  nightAt,
  pressureAt,
  shotAt,
  shutOf,
  span,
  throbAt,
} from "./timing";

export const InsideNight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { h, slack } = lidAt(t);
  const vigilia = vigiliaAt(t);
  const now: Now = {
    t,
    lever: leverAngle(t),
    lid: h,
    slack,
    cold: 1 - shutOf(h),
    level: levelAt(t),
    pressure: pressureAt(t),
    doze: dozeAt(t),
    calm: span(t, 9.4, 11.2),
    throb: throbAt(t),
    night: nightAt(t),
    vigiliaX: LEVER.hub[0] + vigilia.x,
    vigiliaLift: vigilia.lift,
  };
  const { camera, lens } = shotAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall[0] }}>
      <NowProvider value={now}>
        {/* A lente aproxima o quadro inteiro por igual; a câmera, por baixo dela, desloca cada camada conforme a profundidade. */}
        <AbsoluteFill style={{ scale: lens.scale, translate: `${lens.x}px ${lens.y}px` }}>
          <Camera {...camera}>
            <Layer depth={DEPTH.wall}>
              <SvgLayer>
                <Vault />
                <EyeWindow />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.far}>
              <SvgLayer>
                <FarGrove />
              </SvgLayer>
            </Layer>
            {/* O halo é do reservatório e anda com ele, mas fica atrás dos bosques, que se recortam contra ele. */}
            <Layer depth={DEPTH.subject}>
              <SvgLayer>
                <Halo />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.grove}>
              <SvgLayer>
                <Groves />
              </SvgLayer>
            </Layer>
            {/* O feixe passa por cima da floresta e a ilumina; o cabo corre ao lado dele, da janela até a alavanca. */}
            <Layer depth={0}>
              <SvgLayer>
                <Beam />
                <Cable />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.deep}>
              <SvgLayer>
                <Deep />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.subject}>
              <SvgLayer>
                <Walkway />
                <AbyssMist />
                <Vessel />
                <RingFront />
                <FloorShadows />
                <Conduit />
                <Lever />
                <Vigilia />
                <Contador />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.motes}>
              <SvgLayer>
                <Motes />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.frame}>
              <SvgLayer>
                <Foreground />
              </SvgLayer>
            </Layer>
            {/* O calor toma a cor do salão sem apagar o escuro dele; a frente da onda soma luz. */}
            <AbsoluteFill style={{ mixBlendMode: "soft-light" }}>
              <SvgLayer>
                <Warmth />
              </SvgLayer>
            </AbsoluteFill>
            <Layer depth={0} light>
              <SvgLayer>
                <WaveFront />
              </SvgLayer>
            </Layer>
          </Camera>
        </AbsoluteFill>
        {/* O salão adormece: o quadro inteiro baixa um tom. */}
        <AbsoluteFill style={{ backgroundColor: C.hush, mixBlendMode: "multiply", opacity: 0.55 * now.calm }} />
      </NowProvider>
      {/* A vinheta fecha os cantos e deixa o olho no meio. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 85% at 54% 50%, transparent 60%, ${C.near}99 100%)`,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
