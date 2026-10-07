import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { Build } from "../../../components/Camera";
import { Stay } from "../../../components/Cast";
import { ramp } from "../../../components/timing";
import { HEIGHT } from "../../../format";
import { useShotLength } from "../../../video/Shot";

// A passagem começa 0,4 s antes da deixa e assenta 0,4 s depois, a 30 fps.
// Os dois quadros viajam juntos: a borda nunca expõe o vazio do palco.
const LEAD = 12;
const FRAMES = 24;
type Props = { readonly children: React.ReactNode };

/** O quadro anterior acompanha a subida do seguinte, sem desmontar o elenco. */
export const OpeningExit: React.FC<Props> = ({ children }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        translate: `0 ${-HEIGHT * ramp(frame, length - LEAD, FRAMES)}px`,
      }}
    >
      <Stay>
        <Build lit={1} risen={1}>
          {children}
        </Build>
      </Stay>
    </AbsoluteFill>
  );
};

/** Antes da deixa, o quadro novo já vem de baixo, colado ao anterior. */
export const OpeningPrelude: React.FC<Props> = ({ children }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  if (frame < length - LEAD || frame >= length) return null;
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        translate: `0 ${HEIGHT * (1 - ramp(frame, length - LEAD, FRAMES))}px`,
      }}
    >
      <Freeze frame={0}>
        <Stay>
          <Build lit={1} risen={1}>
            {children}
          </Build>
        </Stay>
      </Freeze>
    </AbsoluteFill>
  );
};

/** Depois da deixa, continua exatamente a viagem que o prelúdio começou. */
export const OpeningArrival: React.FC<Props> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        translate: `0 ${HEIGHT * (1 - ramp(frame, -LEAD, FRAMES))}px`,
      }}
    >
      <Stay only="entering">
        <Build lit={1} risen={1}>
          {children}
        </Build>
      </Stay>
    </AbsoluteFill>
  );
};
