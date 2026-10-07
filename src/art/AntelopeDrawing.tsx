import { useId } from "react";
import { clamp01, mix } from "../components/timing";
import type { Point } from "./shapes";

export type AntelopePaint = {
  readonly body: string;
  readonly light: string;
  readonly shade: string;
  readonly deep: string;
  readonly cream: string;
  readonly creamShade: string;
  readonly rim: string;
  readonly band: string;
  readonly horn: string;
  readonly hornRim: string;
  readonly eye: string;
};
export type AntelopePose = {
  readonly lid?: number;
  readonly tired?: number;
  readonly look?: Point;
  readonly droop?: number;
  readonly rest?: number;
  readonly stride?: number;
  readonly turn?: number;
  readonly gait?: number;
  readonly pace?: number;
  readonly lookBack?: number;
  readonly breathing?: number;
  readonly earAngle?: number;
  readonly tailAngle?: number;
};

// O desenho aprovado na savana é a folha de modelo única. As poses deformam
// suas partes, sem trocar corpo, rosto, chifres ou manchas entre os planos.
const rotatePoint = ([x, y]: Point, angle: number): Point => {
  const radians = (angle * Math.PI) / 180;
  return [
    1168 + (x - 1168) * Math.cos(radians) - (y - 704) * Math.sin(radians),
    704 + (x - 1168) * Math.sin(radians) + (y - 704) * Math.cos(radians),
  ];
};
// Estes caminhos só usam comandos absolutos com pares x/y (M, L, C e Q).
// Deslocar também os controles conserva as curvas nas poses intermediárias.
const mapPath = (path: string, point: (value: Point) => Point) =>
  path.replace(
    /(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g,
    (_, x: string, y: string) => {
      const at = point([Number(x), Number(y)]);
      return `${at[0].toFixed(3)} ${at[1].toFixed(3)}`;
    },
  );

export const AntelopeDrawing = ({
  colors: p,
  lid = 0,
  tired = 0,
  look = [0, 0],
  droop = 0,
  rest = 0,
  stride = 0,
  turn = 0,
  gait,
  pace = 1,
  lookBack = 0,
  breathing: breath = 1,
  earAngle = 0,
  tailAngle = 0,
}: AntelopePose & { readonly colors: AntelopePaint }) => {
  const id = useId();
  const front = clamp01(rest * 1.7);
  const hind = clamp01(rest * 1.7 - 0.7);
  const drop = (70 * (front + hind)) / 2;
  const neckAngle = -droop * mix(28, 58, rest);
  const headAt = rotatePoint([1136, 664], neckAngle);
  const headY = (664 - 734) * (breath - 1);
  const head = turn + neckAngle + 35 * rest * droop;
  const side = Math.cos(Math.PI * clamp01(lookBack));
  const profile = Math.abs(side) < 0.3 ? (side < 0 ? -0.3 : 0.3) : side;
  const neckPath = (path: string) =>
    neckAngle === 0
      ? path
      : mapPath(path, ([x, y]) => {
          // A base do pescoço fica presa no ombro; só a ponta acompanha a cabeça.
          const weight = clamp01((1168 - x) / 24) * clamp01((723 - y) / 59);
          return rotatePoint([x, y], neckAngle * weight);
        });
  const legPath = (
    path: string,
    folded: number,
    phase: number,
    back: boolean,
    near: boolean,
  ) => {
    if (folded === 0 && gait === undefined && stride === 0 && drop === 0)
      return path;
    const angle = ((gait ?? 0) + phase) * Math.PI * 2;
    const reach =
      gait === undefined
        ? stride * (near ? -1 : 1) * 15
        : Math.cos(angle) * 29 * pace;
    const lift =
      gait === undefined ? 0 : Math.max(0, Math.sin(angle)) * 15 * pace;
    return mapPath(path, ([x, y]) => {
      const u = clamp01((y - (back ? 728 : 738)) / (back ? 94 : 84));
      if (back) {
        // Coxa, canela e casco se recolhem sob a garupa em três segmentos.
        // Girar a largura junto ao eixo de cada segmento evita achatar o
        // casco e transformar a perna deitada numa cunha atrás do corpo.
        const joints = near
          ? [
              [728, 1260, 1258, 798],
              [759, 1242, 1236, 808],
              [785, 1239, 1250, 811],
              [818, 1230, 1246, 820],
            ]
          : [
              [728, 1271, 1267, 798],
              [769, 1274, 1249, 808],
              [795, 1283, 1265, 811],
              [818, 1280, 1263, 820],
            ];
        let foldedX = x;
        let foldedY = y + 70;
        if (y > joints[0][0]) {
          let segment = 0;
          while (segment < joints.length - 2 && y > joints[segment + 1][0])
            segment++;
          const a = joints[segment];
          const b = joints[segment + 1];
          const along = (y - a[0]) / (b[0] - a[0]);
          const offset = x - mix(a[1], b[1], along);
          const dx = b[2] - a[2];
          const dy = b[3] - a[3];
          const length = Math.hypot(dx, dy);
          foldedX = mix(a[2], b[2], along) + (offset * dy) / length;
          foldedY = mix(a[3], b[3], along) - (offset * dx) / length;
        }
        return [
          mix(x + reach * u, foldedX, folded),
          mix(y + drop * (1 - u) - lift * u, foldedY + drop - 70, folded),
        ];
      }
      const knee = Math.sin(Math.PI * u);
      const foldX = -31 * knee - (near ? 4 : 0) * u;
      const shiftedY = y + drop * (1 - u) + folded * 13 * knee;
      return [
        x + folded * foldX + reach * u * (1 - folded),
        shiftedY - lift * u * (1 - folded),
      ];
    });
  };
  const farFrontPath = (path: string) =>
    legPath(path, front, 0.56, false, false);
  const farHindPath = (path: string) => legPath(path, hind, 0.06, true, false);
  const nearFrontPath = (path: string) => legPath(path, front, 0, false, true);
  const nearHindPath = (path: string) => legPath(path, hind, 0.5, true, true);
  return (
    <g data-part="antelope" data-layer="character">
      <defs>
        <linearGradient id={`${id}-coat`} x1="0" y1=".15" x2=".35" y2="1">
          <stop stopColor={p.light} />
          <stop offset=".35" stopColor={p.body} />
          <stop offset="1" stopColor={p.shade} />
        </linearGradient>
      </defs>
      <g data-part="antelope-far-legs">
        <path
          d={farFrontPath(
            "M1153 721 C1160 723 1163 734 1163 746 L1160 770 L1165 792 L1166 811 L1160 818 L1152 815 L1155 790 L1152 772 L1150 746 Z",
          )}
          fill={p.deep}
        />
        <path
          d={farFrontPath(
            "M1154 773 L1162 774 L1165 793 L1165 810 L1158 812 L1157 795 Z",
          )}
          fill={p.shade}
        />
        <path
          d={farFrontPath(
            "M1155 812 L1166 812 L1165 821 L1152 821 L1150 820 Z",
          )}
          fill={p.band}
        />
        <path
          d={farHindPath(
            "M1261 720 C1275 726 1279 743 1281 760 L1285 779 L1289 807 L1284 816 L1273 813 L1276 791 L1267 769 L1257 746 Z",
          )}
          fill={p.shade}
        />
        <path
          d={farHindPath("M1277 778 L1285 776 L1289 803 L1282 810 L1274 809 Z")}
          fill={p.deep}
        />
        <path
          d={farHindPath("M1276 810 L1288 807 L1289 817 L1278 821 L1273 820 Z")}
          fill={p.band}
        />
      </g>
      <g
        data-part="antelope-tail"
        transform={`translate(0 ${drop + (689 - 734) * (breath - 1)}) rotate(${tailAngle} 1263 689)`}
      >
        <path
          d="M1263 687 C1275 691 1281 700 1285 711 C1289 719 1291 728 1290 735 C1280 731 1273 724 1273 714 C1273 701 1269 695 1261 692 Z"
          fill={p.band}
        />
      </g>
      <g
        data-part="antelope-body"
        transform={`translate(0 ${drop}) translate(0 734) scale(1 ${breath}) translate(0 -734)`}
      >
        <path
          d={neckPath(
            "M1129 648 C1134 639 1142 638 1145 648 C1152 662 1159 675 1168 683 C1186 679 1201 682 1220 680 C1235 678 1252 676 1264 683 C1277 690 1281 703 1278 715 C1275 731 1268 740 1257 743 C1230 741 1210 744 1190 742 C1176 741 1160 737 1154 726 C1147 716 1147 705 1143 694 L1127 664 L1119 660 Z",
          )}
          fill={`url(#${id}-coat)`}
        />
        <path
          d={neckPath(
            "M1135 659 L1141 658 C1144 674 1152 688 1158 702 C1158 707 1154 710 1154 714 C1157 722 1162 728 1167 733 C1156 730 1151 725 1148 717 C1146 704 1140 688 1131 671 Z",
          )}
          fill={p.cream}
        />
        <path
          d={neckPath(
            "M1131 671 L1135 670 C1144 688 1148 702 1150 714 C1149 717 1151 721 1153 724 L1148 717 C1146 704 1140 688 1131 671 Z",
          )}
          fill={p.creamShade}
        />
        <path
          d="M1176 726 C1196 731 1223 728 1242 719 L1246 733 C1223 743 1195 744 1178 737 Z"
          fill={p.cream}
        />
        <path
          d="M1179 728 C1197 734 1223 733 1242 725 L1246 733 C1223 743 1195 744 1178 737 Z"
          fill={p.creamShade}
        />
        <path
          d="M1174 712 C1195 721 1229 718 1257 704 C1244 718 1228 725 1209 728 C1194 730 1185 726 1179 724 Z"
          fill={p.band}
        />
        <path
          d="M1261 683 C1274 687 1281 696 1280 711 C1278 720 1275 724 1272 727 L1265 736 L1262 728 L1263 720 L1268 726 C1273 716 1274 703 1270 696 Z"
          fill={p.cream}
        />
        <path
          d="M1166 684 C1185 680 1202 684 1224 680 C1241 677 1257 678 1264 684"
          fill="none"
          stroke={p.rim}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M1182 684 L1190 685 M1212 682 L1217 683 M1237 680 L1245 680 M1252 681 L1255 684"
          fill="none"
          stroke={p.light}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
      <g data-part="antelope-near-front-leg">
        <path
          d={nearFrontPath(
            "M1167 726 C1170 722 1175 724 1177 729 C1178 744 1178 756 1180 770 L1183 787 L1186 809 L1182 815 L1176 814 L1177 791 L1174 774 L1170 754 L1168 739 Z",
          )}
          fill={p.body}
        />
        <path
          d={nearFrontPath(
            "M1174 776 C1177 782 1179 788 1179 795 L1179 812 L1182 813 L1176 814 L1177 791 L1174 774 Z",
          )}
          fill={p.shade}
        />
        <path
          d={nearFrontPath(
            "M1174 773 Q1178 775 1180 771 L1183 781 L1180 789 L1177 786 Z",
          )}
          fill={p.band}
        />
        <path
          d={nearFrontPath(
            "M1181 811 L1188 808 L1189 818 L1182 823 L1175 822 L1175 817 Z",
          )}
          fill={p.band}
        />
      </g>
      <g data-part="antelope-near-hind-leg">
        <path
          d={nearHindPath(
            "M1257 694 C1269 702 1271 712 1267 726 C1263 738 1255 749 1250 759 C1248 765 1246 771 1244 778 L1238 807 L1237 816 L1227 813 C1230 798 1236 785 1238 772 C1239 761 1234 752 1234 743 C1233 730 1243 713 1257 694 Z",
          )}
          fill={p.body}
        />
        <path
          d={nearHindPath(
            "M1238 738 C1235 751 1245 760 1243 772 C1241 786 1236 800 1234 811 L1237 816 L1227 813 C1230 798 1236 785 1238 772 C1239 761 1234 752 1234 743 Z",
          )}
          fill={p.shade}
        />
        <path
          d={nearHindPath("M1231 791 L1244 793 L1238 812 L1228 812 Z")}
          fill={p.band}
        />
        <path
          d={nearHindPath(
            "M1228 810 L1238 813 L1236 821 L1224 822 L1220 821 L1223 816 Z",
          )}
          fill={p.band}
        />
      </g>
      <g
        data-part="antelope-head-pose"
        transform={`translate(${headAt[0] - 1136} ${drop + headY + headAt[1] - 664}) rotate(${head} 1136 664) translate(1136 664) scale(${profile} 1) translate(-1136 -664)`}
      >
        <g data-part="antelope-horns">
          <path
            d="M1121 634 C1127 619 1118 608 1125 590 C1129 580 1130 576 1135 572 C1130 584 1129 595 1130 604 C1132 616 1133 625 1129 635 Z"
            fill={p.horn}
          />
          <path
            d="M1127 635 C1131 621 1137 610 1137 593 C1137 581 1140 575 1146 571 C1143 582 1144 594 1141 607 C1139 617 1137 626 1135 636 Z"
            fill={p.horn}
          />
          <path
            d="M1127 589 C1122 603 1125 612 1125 621 M1140 585 C1137 604 1136 610 1132 621"
            fill="none"
            stroke={p.hornRim}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M1122 611 L1125 615 M1123 617 L1127 620 M1125 624 L1128 626"
            fill="none"
            stroke={p.hornRim}
            strokeWidth="1.1"
          />
        </g>
        <g data-part="antelope-head">
          <path
            d="M1134 632 C1142 629 1147 639 1142 648 L1142 655 C1140 664 1133 668 1122 670 L1105 675 C1099 678 1093 674 1096 668 C1095 664 1101 660 1106 655 L1118 643 C1123 636 1128 633 1134 632 Z"
            fill={p.body}
          />
          <path
            d="M1097 664 C1106 659 1118 651 1126 646 L1123 651 L1110 660 L1101 671 Z"
            fill={p.band}
          />
          <path
            d="M1097 665 C1102 662 1105 662 1109 664 L1107 668 C1118 669 1129 666 1136 663 C1132 669 1120 672 1107 675 C1103 678 1099 675 1096 672 Z"
            fill={p.cream}
          />
          <path d="M1098 666 L1103 666 L1100 671 L1096 670 Z" fill={p.band} />
          <path
            d="M1101 674 Q1107 675 1113 671"
            fill="none"
            stroke={p.band}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M1116 645 C1120 637 1129 633 1137 634"
            fill="none"
            stroke={p.rim}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {tired > 0 && (
            <path
              d="M1119 652 Q1127 658 1134 650"
              fill="none"
              stroke={p.shade}
              strokeWidth="3"
              opacity={tired * 0.75}
            />
          )}
          <g
            data-part="antelope-eye"
            transform={`translate(1127 646) scale(1 ${1 - 0.96 * lid}) translate(-1127 -646)`}
          >
            <path
              d="M1120 646 C1122 640 1127 639 1132 642 C1135 645 1132 650 1127 651 C1122 652 1119 650 1120 646 Z"
              fill={p.cream}
            />
            <path
              transform={`translate(${look[0] * 1.8} ${look[1] * 1.1})`}
              d="M1123 646 C1125 642 1128 643 1130 644 C1132 647 1129 649 1126 649 C1123 649 1122 648 1123 646 Z"
              fill={p.eye}
            />
            <ellipse
              cx="1127.4"
              cy="644.3"
              rx="1.55"
              ry="1.15"
              fill={p.cream}
            />
          </g>
          <path
            d="M1121 648 Q1127 647 1133 645"
            fill="none"
            stroke={p.band}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={lid}
          />
        </g>
        <g data-part="antelope-ear" transform={`rotate(${earAngle} 1144 642)`}>
          <path
            d="M1141 641 C1147 628 1155 621 1166 616 C1163 632 1155 641 1146 644 Z"
            fill={p.rim}
          />
          <path
            d="M1144 640 C1150 629 1157 624 1163 622 C1160 632 1152 639 1147 641 Z"
            fill={p.cream}
          />
          <path
            d="M1148 637 C1152 630 1156 627 1160 626 C1158 632 1154 636 1148 639 Z"
            fill={p.band}
          />
        </g>
      </g>
    </g>
  );
};
