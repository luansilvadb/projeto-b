import { wave } from "../../../../components/Idle";
import { useStudyTime } from "../../../../studies/savanna-reference/SavannaReference";
import { useRichTheme } from "./RichTheme";
import { savanna, savannaNightSky as s } from "../../palette";

const p = savanna.night;

// Pontos fixos e tamanhos variados, sem gerar outra constelação a cada frame.
const starPoints = [
  [60, 39, 1.6],
  [164, 55, 1.3],
  [241, 30, 1.6],
  [338, 61, 1.7],
  [402, 45, 1.3],
  [565, 67, 2.7],
  [696, 69, 1.7],
  [843, 74, 1.4],
  [926, 126, 2.4],
  [998, 67, 1.3],
  [1053, 41, 1.4],
  [1178, 134, 3],
  [1306, 54, 1.7],
  [1412, 98, 2.8],
  [1532, 57, 1.8],
  [1576, 96, 1.4],
  [58, 113, 1.8],
  [295, 108, 1.3],
  [360, 132, 2.4],
  [463, 327, 1.4],
  [609, 329, 2.6],
  [689, 380, 1.2],
  [744, 196, 1.3],
  [927, 256, 4.3],
  [1045, 172, 1.8],
  [1074, 240, 1.6],
  [1110, 184, 1.3],
  [1267, 187, 1.4],
  [1328, 139, 1.7],
  [1287, 214, 1.1],
  [366, 274, 1],
  [654, 114, 1.3],
  [529, 81, 1.2],
  [496, 127, 1.3],
  [1150, 54, 1.1],
  [922, 39, 1.2],
] as const;
const dust = Array.from({ length: 340 }, (_, i) => {
  const a = Math.sin((i + 19) * 127.1) * 43758.5453;
  const b = Math.sin((i + 37) * 311.7) * 19341.7923;
  return {
    x: (a - Math.floor(a)) * 1672,
    y: 22 + (b - Math.floor(b)) * 457,
    r: i % 6 === 0 ? 0.9 : 0.5,
  };
});

export const NightSky = () => {
  const t = useStudyTime();
  const { orb } = useRichTheme();
  const arc = orb === undefined ? 0 : orb - 0.36;
  return (
    <>
      <defs>
        <radialGradient id="night-moon-glow">
          <stop stopColor={s.moonGlow} stopOpacity=".49" />
          <stop offset=".47" stopColor={s.moonGlow} stopOpacity=".16" />
          <stop offset="1" stopColor={s.moonGlow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="night-star-glow">
          <stop stopColor={s.stars} stopOpacity=".6" />
          <stop offset=".18" stopColor={s.blueStars} stopOpacity=".2" />
          <stop offset="1" stopColor={s.blueStars} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="night-moon">
          <stop stopColor={p.sunEdge} />
          <stop offset="1" stopColor={p.sun} />
        </radialGradient>
        <radialGradient id="night-moon-corona">
          <stop offset=".56" stopColor={s.moonGlow} stopOpacity=".56" />
          <stop offset=".69" stopColor={s.moonGlow} stopOpacity=".35" />
          <stop offset=".86" stopColor={s.moonGlow} stopOpacity=".12" />
          <stop offset="1" stopColor={s.moonGlow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g id="night-star-field">
        {dust.map(({ x, y, r }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={i % 5 === 0 ? s.blueStars : s.faintStars}
            opacity={0.24 + (i % 4) * 0.13}
          />
        ))}
        {starPoints.map(([x, y, r], i) => (
          <g key={i} opacity={0.86 + 0.12 * wave(t, 4.8 + (i % 3), i / 37)}>
            {r > 2 && (
              <circle cx={x} cy={y} r={r * 3.4} fill="url(#night-star-glow)" />
            )}
            {r > 2 ? (
              <rect
                x={x - r * 0.74}
                y={y - r * 0.74}
                width={r * 1.48}
                height={r * 1.48}
                rx={r * 0.24}
                transform={`rotate(45 ${x} ${y})`}
                fill={s.stars}
              />
            ) : (
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={i % 4 === 0 ? s.blueStars : s.stars}
              />
            )}
          </g>
        ))}
      </g>
      <g
        id="night-moon"
        transform={`translate(${153 + arc * 450} ${281 + t * 0.15 - arc * 500})`}
      >
        <circle r="174" fill={p.sunHalo} opacity=".19" />
        <circle r="135" fill={p.sunCoral} opacity=".19" />
        <circle r="105" fill={p.sunOrange} opacity=".12" />
        <circle r="174" fill="url(#night-moon-glow)" />
        <circle r="119" fill="url(#night-moon-corona)" />
        <circle r="79" fill="url(#night-moon)" />
        <g fill={s.moonCrater} opacity=".28">
          <path d="M-59 -28 C-49 -53 -29 -66 -10 -62 C6 -59 -22 -56 -31 -48 C-45 -39 -46 -31 -48 -21 C-51 -15 -51 -3 -56 -5 C-64 -7 -64 -18 -59 -28 Z" />
          <path d="M-38 -42 C-26 -52 -9 -49 -8 -38 C-3 -45 9 -42 11 -30 C12 -20 4 -17 -7 -20 C-9 -10 -22 -5 -34 -4 C-39 3 -48 -1 -46 -11 C-53 -21 -48 -34 -38 -42 Z" />
          <path d="M-28 -9 C-21 -12 -13 -14 -9 -10 L-17 -3 L-11 4 L-5 -4 C2 -7 7 0 5 5 L-3 9 L0 18 C13 13 20 23 18 33 C14 46 1 41 -7 35 L-8 45 C-18 45 -20 36 -23 31 C-34 35 -39 27 -35 20 C-43 20 -50 11 -49 2 L-40 12 L-32 15 L-31 4 L-40 -3 Z" />
          <path d="M-52 36 C-47 39 -37 40 -31 48 C-26 50 -26 54 -32 53 C-43 51 -47 43 -52 36 Z M-25 46 C-17 42 -10 45 -8 52 C-12 60 -24 55 -25 46 Z M-4 -18 C1 -24 13 -22 12 -16 C11 -10 2 -10 -4 -12 Z" />
        </g>
      </g>
    </>
  );
};
