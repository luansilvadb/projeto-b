import { AntelopeDrawing } from "../../art/AntelopeDrawing";
import { antelopePaint } from "../../art/Antelope";
import { antelope } from "../../videos/why-we-sleep/palette";
import { createContext, useContext, type ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { blink, wave } from "../../components/Idle";
import { ramp } from "../../components/timing";
import { palette as p } from "./palette";

export const TimeContext = createContext(0);
export const useStudyTime = () => useContext(TimeContext);

// O piloto tem duração própria, por não pertencer a um roteiro narrado. Uma
// única câmera move as camadas; chão e animal dividem a mesma profundidade.
const DepthLayer = ({
  depth,
  children,
}: {
  readonly depth: number;
  readonly children: ReactNode;
}) => {
  const seconds = useStudyTime();
  const scale = 1 + 0.075 * depth * ramp(seconds, 0, 8);
  return (
    <g transform={`translate(1450 890) scale(${scale}) translate(-1450 -890)`}>
      {children}
    </g>
  );
};

// Coordenadas da referência reduzida a 2048 × 1152. Todas as peças são vetores:
// a referência não é usada como textura, fundo ou conteúdo do render.
const Sky = () => {
  const seconds = useStudyTime();
  return (
    <g id="reference-sky" data-layer="sky">
      <rect width="2048" height="1152" fill="url(#ref-sky)" />
      <g transform={`translate(0 ${seconds * 0.8})`}>
        <circle cx="178" cy="347" r="196" fill={p.sunOuter} opacity="0.55" />
        <circle cx="178" cy="347" r="137" fill="url(#ref-sun-middle)" />
        <circle cx="178" cy="347" r="87" fill={p.sun} />
      </g>
      <g
        fill={p.cloudUpper}
        opacity="0.47"
        transform={`translate(${seconds * 2.8} 0)`}
      >
        <path d="M1490 220 C1535 216 1552 215 1585 208 C1602 204 1613 202 1633 201 C1653 190 1680 184 1706 188 C1718 191 1727 194 1737 197 C1762 197 1788 199 1806 205 C1850 210 1904 213 1983 218 Z" />
        <path d="M1329 252 C1386 248 1406 247 1435 240 C1459 234 1489 234 1507 239 C1540 247 1576 247 1631 252 Z" />
        <path d="M1780 353 C1839 348 1870 346 1904 338 C1938 333 1951 322 1992 326 C2010 327 2027 329 2048 332 L2048 353 Z" />
      </g>
      <g
        fill={p.cloudLower}
        opacity="0.46"
        transform={`translate(${seconds * 1.9} 0)`}
      >
        <path d="M326 459 C389 451 417 444 448 435 C473 428 488 429 511 436 C546 446 556 441 580 448 C623 453 661 456 713 459 Z" />
        <path d="M540 493 C599 489 621 486 652 480 C677 476 716 471 739 478 C750 481 748 484 770 484 L868 493 Z" />
        <path d="M1251 492 C1301 489 1341 485 1360 478 C1377 474 1388 478 1401 472 C1431 461 1460 461 1486 464 C1519 465 1537 466 1557 474 C1583 476 1601 480 1625 480 C1693 486 1761 486 1856 492 Z" />
        <path d="M1508 454 C1557 451 1580 451 1613 445 C1645 439 1656 438 1679 445 C1696 449 1708 451 1728 454 Z" />
        <path d="M61 582 C106 578 117 577 141 573 C165 566 177 569 197 575 L242 582 Z" />
        <path
          d="M1757 590 C1853 585 1874 585 1911 579 L2017 588 Z"
          opacity="0.25"
        />
      </g>
      <g
        fill={p.cloudLight}
        opacity="0.33"
        transform={`translate(${seconds * 1.2} 0)`}
      >
        <path d="M112 606 C185 601 218 598 253 595 C300 585 321 584 350 590 C369 593 365 597 399 598 L513 606 Z" />
        <path d="M0 594 C70 594 77 597 119 602 L272 605 L0 604 Z" />
        <path
          d="M0 632 C145 625 274 630 349 625 C375 623 405 627 426 629 L714 637 L0 642 Z"
          opacity="0.42"
        />
        <path
          d="M988 624 C1032 620 1070 619 1109 622 L1143 626 Z"
          opacity="0.22"
        />
      </g>
    </g>
  );
};

const Hills = () => (
  <g id="reference-hills" data-layer="distant-hills">
    <path
      d="M0 706 C74 692 117 705 166 712 C233 723 284 733 371 739 C485 731 531 746 638 763 C753 780 867 739 990 711 C1141 674 1242 667 1355 674 C1464 679 1561 713 1663 712 C1787 706 1922 722 2048 737 L2048 901 L0 901 Z"
      fill="url(#ref-hills-far)"
    />
    <path
      d="M0 807 C101 800 107 820 194 817 C320 800 405 805 515 797 C614 786 698 788 775 793 C848 799 866 811 950 805 C1086 787 1204 786 1310 792 C1412 801 1465 816 1571 798 C1715 776 1826 783 1911 788 C1969 789 2008 794 2048 799 L2048 902 L0 902 Z"
      fill="url(#ref-hills-middle)"
    />
    <path
      d="M0 849 C97 839 141 842 219 839 C384 827 484 832 621 846 C757 865 773 854 862 847 C1018 829 1124 838 1228 841 C1393 841 1458 865 1589 853 C1735 838 1886 836 2048 850 L2048 908 L0 908 Z"
      fill="url(#ref-hills-near)"
    />
  </g>
);

const LeftAcacia = () => {
  const seconds = useStudyTime();
  const sway = 0.45 * (wave(seconds, 5.8, 0.12) - wave(0, 5.8, 0.12));
  return (
    <g
      id="reference-acacia-left"
      data-layer="trees"
      fill={p.tree}
      transform={`translate(340 881) skewX(${sway}) translate(-340 -881)`}
    >
      <path d="M326 881 C330 847 330 816 331 790 C330 772 324 761 309 749 L278 733 L286 733 L322 750 L309 732 L316 732 L335 752 L348 733 L357 732 L349 753 L381 734 L394 732 L360 755 L407 732 L422 729 C391 746 364 755 356 770 C349 784 351 813 352 839 L356 881 Z" />
      <path
        d="M154 723 C166 715 181 710 197 703 C191 700 200 694 214 690 C228 684 239 683 245 679 C245 675 260 672 274 668 C282 666 285 668 296 663 C329 650 368 652 393 658 C403 660 410 662 407 665 C427 667 443 672 459 680 C475 687 497 693 492 697 C516 704 535 714 543 720 C551 730 515 728 495 729 C459 733 428 729 401 733 C370 735 337 729 313 732 C284 739 260 735 234 733 C204 732 181 730 161 728 C153 727 150 727 154 723 Z"
        stroke={p.treeEdge}
        strokeWidth="1.7"
      />
    </g>
  );
};

const RightAcacia = () => {
  const seconds = useStudyTime();
  const sway = 0.28 * (wave(seconds, 6.4, 0.38) - wave(0, 6.4, 0.38));
  return (
    <g
      id="reference-acacia-right"
      data-layer="trees"
      fill={p.tree}
      transform={`translate(1644 881) skewX(${sway}) translate(-1644 -881)`}
    >
      <path d="M1627 883 C1630 831 1633 780 1632 731 C1631 709 1623 700 1608 690 C1590 679 1574 672 1556 668 L1565 667 C1587 674 1603 679 1620 686 L1592 663 L1602 663 L1632 688 L1609 658 L1620 658 L1644 683 L1662 660 L1675 660 L1658 687 L1697 662 L1709 661 L1671 690 C1689 680 1708 671 1731 666 L1748 664 C1708 678 1679 691 1662 708 C1655 720 1653 738 1654 759 L1658 883 Z" />
      <path
        d="M1409 649 C1419 640 1432 640 1430 637 C1424 633 1446 628 1457 626 C1452 623 1456 621 1470 616 C1488 610 1508 606 1520 603 C1524 594 1543 589 1573 589 C1610 574 1648 574 1681 578 C1722 582 1764 595 1794 606 C1811 612 1823 617 1814 622 C1834 627 1861 636 1871 645 C1879 653 1871 655 1855 657 C1826 662 1801 659 1776 662 C1747 665 1725 659 1705 663 C1674 669 1663 659 1641 662 C1618 666 1604 663 1584 665 C1568 667 1556 665 1544 667 C1513 669 1482 658 1456 661 C1440 666 1424 659 1410 656 C1404 655 1404 653 1409 649 Z"
        stroke={p.treeEdge}
        strokeWidth="1.9"
      />
    </g>
  );
};

const Ground = () => (
  <g id="reference-ground" data-layer="ground">
    <path
      d="M0 880 C149 872 215 875 289 879 C376 883 433 872 531 877 C649 878 722 886 809 881 C927 877 990 877 1093 878 C1243 882 1338 875 1460 877 C1585 876 1714 881 1810 877 C1908 878 1981 870 2048 879 L2048 1152 L0 1152 Z"
      fill="url(#ref-ground)"
    />
    <path
      d="M0 901 C166 895 240 897 369 890 C448 887 535 889 624 888 C765 891 844 886 950 888 C1094 885 1164 894 1298 891 C1428 886 1551 884 1692 889 C1841 884 1946 889 2048 895 L2048 914 C1858 912 1768 907 1640 911 C1427 915 1320 903 1148 910 C944 910 898 916 748 915 C612 911 478 909 323 915 C202 918 98 914 0 917 Z"
      fill={p.groundBands[0]}
      opacity="0.26"
    />
    <path
      d="M0 940 C191 920 298 925 459 923 C647 918 747 917 897 925 C1057 931 1132 916 1267 918 C1418 921 1549 933 1716 928 C1812 924 1939 928 2048 935 L2048 971 C1908 954 1811 950 1664 948 C1469 942 1366 951 1228 942 C1030 939 934 939 793 936 C618 928 513 929 320 945 C178 952 99 961 0 966 Z"
      fill={p.groundBands[1]}
      opacity="0.5"
    />
    <path
      d="M145 918 C411 900 605 906 834 914 C1043 910 1184 914 1268 920 C1014 918 847 923 622 920 C437 914 278 918 145 922 Z"
      fill={p.groundBands[2]}
      opacity="0.58"
    />
    <path
      d="M0 979 C167 965 312 978 423 983 C557 987 693 958 817 969 C963 979 1045 964 1165 977 C1305 988 1489 985 1628 988 C1790 989 1914 980 2048 988 L2048 1036 C1884 1021 1796 1031 1650 1024 C1498 1022 1379 1012 1247 1011 C1032 1007 919 1000 770 1004 C507 1004 266 1006 0 1028 Z"
      fill={p.groundBands[2]}
      opacity="0.36"
    />
    <path
      d="M0 1028 C276 1036 497 1065 729 1066 C906 1058 1058 1052 1248 1060 C1436 1070 1566 1079 1779 1073 C1877 1070 1961 1074 2048 1074 L2048 1100 C1845 1082 1616 1075 1456 1080 C1252 1089 1055 1107 806 1101 C507 1091 234 1082 0 1080 Z"
      fill={p.groundBands[4]}
      opacity="0.58"
    />
    <path
      d="M0 1080 C300 1086 469 1097 739 1100 C942 1104 1080 1084 1267 1084 C1415 1084 1495 1077 1653 1075 C1831 1077 1923 1082 2048 1091 L2048 1152 L0 1152 Z"
      fill={p.groundBands[5]}
      opacity="0.48"
    />
    <path
      d="M1210 999 C1363 1008 1449 1005 1590 1009 C1703 1016 1810 1015 1853 1020 C1694 1022 1606 1024 1466 1013 C1355 1008 1242 1007 1210 999 Z"
      fill={p.contact}
      opacity="0.68"
    />
  </g>
);

type GrassColor = "dark" | "shade" | "mid" | "gold" | "orange";
type Blade = readonly [
  x: number,
  y: number,
  tipX: number,
  height: number,
  width: number,
  color: GrassColor,
  bend?: number,
];
const grassColors = {
  dark: p.grass,
  shade: p.grassShade,
  mid: p.grassMid,
  gold: "url(#ref-grass-gold)",
  orange: "url(#ref-grass-orange)",
};

// Duas curvas independentes dão uma folha que afina. Cada touceira tem seu
// próprio desenho; o helper conserva as formas separadas para animar depois.
export const GrassTuft = ({
  name,
  blades,
  colors = grassColors,
  parallelEdges = false,
}: {
  readonly name: string;
  readonly blades: readonly Blade[];
  readonly colors?: Readonly<Record<GrassColor, string>>;
  readonly parallelEdges?: boolean;
}) => {
  const seconds = useStudyTime();
  return (
    <g id={name}>
      {blades.map(([x, y, originalTipX, height, width, color, bend = 0], i) => {
        // O vento passa de uma folha à outra. A raiz fica exatamente no mesmo
        // ponto, e o primeiro quadro conserva o desenho fixo.
        const phase = x / 850 + i * 0.07;
        const sway =
          height *
          0.035 *
          (wave(seconds, 3.7 + (i % 3) * 0.3, phase) -
            wave(0, 3.7 + (i % 3) * 0.3, phase));
        const tipX = originalTipX + sway;
        const flex = bend + sway * 0.35;
        return (
          <path
            key={i}
            fill={colors[color]}
            d={
              parallelEdges
                ? `M${x - width / 2} ${y} C${x - width / 2 + flex} ${y - height * 0.43} ${tipX - width * 0.12 - flex * 0.3} ${y - height * 0.86} ${tipX} ${y - height} C${tipX + width * 0.12 - flex * 0.3} ${y - height * 0.86} ${x + width / 2 + flex} ${y - height * 0.43} ${x + width / 2} ${y} Z`
                : `M${x - width / 2} ${y} C${x - width / 2 + flex} ${y - height * 0.43} ${tipX - width * 0.12 - flex * 0.3} ${y - height * 0.86} ${tipX} ${y - height} C${tipX - width * 0.3 + flex * 0.1} ${y - height * 0.72} ${x + width / 2 + flex * 0.45} ${y - height * 0.31} ${x + width / 2} ${y} Z`
            }
          />
        );
      })}
    </g>
  );
};

const Thicket = () => (
  <g id="reference-thicket" data-layer="grass-behind-animal">
    <path
      d="M1439 997 C1585 990 1728 990 1834 997 C1752 1002 1512 1005 1439 1001 Z"
      fill={p.contact}
      opacity="0.7"
    />
    <GrassTuft
      name="thicket-blades"
      blades={[
        [1480, 996, 1454, 63, 23, "shade"],
        [1490, 996, 1494, 111, 25, "dark", -5],
        [1512, 996, 1528, 144, 25, "mid", -9],
        [1521, 996, 1523, 118, 22, "shade", -5],
        [1545, 996, 1552, 175, 23, "dark", -8],
        [1566, 996, 1582, 209, 22, "orange", -10],
        [1573, 996, 1585, 123, 18, "mid", -5],
        [1592, 996, 1612, 136, 26, "dark", -9],
        [1600, 996, 1633, 103, 17, "gold", -6],
        [1630, 996, 1621, 91, 19, "shade"],
        [1648, 996, 1667, 86, 21, "dark", -3],
        [1681, 995, 1665, 184, 22, "orange", -1],
        [1693, 995, 1694, 249, 28, "gold", 14],
        [1697, 995, 1715, 149, 25, "dark", -6],
        [1711, 995, 1712, 207, 22, "shade", 5],
        [1736, 995, 1764, 236, 26, "dark", -11],
        [1743, 995, 1761, 146, 22, "mid", -8],
        [1753, 995, 1772, 155, 22, "gold", -5],
        [1782, 995, 1835, 261, 27, "gold", -5],
        [1788, 995, 1781, 181, 23, "mid", 1],
        [1804, 995, 1837, 183, 25, "shade", -8],
        [1818, 995, 1830, 137, 27, "dark", -3],
        [1836, 995, 1878, 226, 25, "orange", -5],
        [1844, 995, 1878, 168, 29, "shade", -11],
        [1862, 995, 1943, 247, 23, "gold", -4],
        [1858, 995, 1909, 175, 24, "mid", -10],
        [1872, 995, 1892, 112, 24, "shade", -7],
        [1704, 995, 1721, 53, 16, "gold"],
      ]}
    />
  </g>
);

const Antelope = () => {
  const seconds = useStudyTime();
  const attentive = ramp(seconds, 1.5, 1.15) - ramp(seconds, 5.8, 1.3);
  return (
    <g transform="translate(1442 999) scale(1.18) translate(-1095 -823)">
      <AntelopeDrawing
        colors={antelopePaint(antelope)}
        breathing={1 + 0.008 * wave(seconds, 3.8)}
        turn={-4 * attentive}
        lid={blink(seconds, "savanna-reference-antelope", {
          every: [2.5, 3.8],
          seconds: 0.17,
        })}
        earAngle={-5 * attentive}
      />
    </g>
  );
};

const Foreground = () => (
  <g id="reference-foreground" data-layer="foreground-grass">
    <g fill={p.contact} opacity="0.6">
      <path d="M4 968 Q82 965 144 971 Q73 975 4 970 Z" />
      <path d="M398 1016 Q480 1016 551 1022 Q466 1025 398 1019 Z" />
      <path d="M698 1073 Q791 1067 878 1076 Q778 1082 698 1077 Z" />
      <path d="M1082 971 Q1162 967 1244 976 Q1171 979 1082 975 Z" />
      <path d="M1826 1053 C1887 1047 1932 1053 1984 1058 C1937 1064 1880 1061 1826 1058 Z" />
    </g>
    <GrassTuft
      name="reference-tuft-left"
      blades={[
        [36, 969, 20, 56, 14, "shade", -3],
        [43, 969, 35, 93, 17, "dark", -5],
        [59, 969, 53, 120, 17, "gold", 2],
        [63, 969, 59, 77, 19, "mid", -4],
        [77, 970, 76, 112, 16, "orange", 4],
        [84, 970, 118, 132, 23, "gold", -1],
        [88, 970, 93, 83, 21, "shade", -5],
        [103, 970, 147, 148, 21, "orange", 2],
        [106, 970, 113, 109, 19, "dark", -7],
        [122, 970, 152, 49, 20, "shade", -6],
        [133, 970, 145, 92, 18, "dark", -4],
        [99, 965, 160, 103, 9, "gold"],
      ]}
    />
    <GrassTuft
      name="reference-tuft-480"
      blades={[
        [442, 1019, 419, 87, 19, "dark", -1],
        [453, 1019, 442, 111, 18, "orange"],
        [466, 1019, 454, 117, 18, "gold"],
        [467, 1019, 474, 111, 18, "shade", -8],
        [475, 1019, 547, 165, 14, "orange", -7],
        [480, 1019, 500, 144, 24, "dark", -6],
        [491, 1019, 536, 118, 19, "shade", -4],
        [509, 1019, 559, 107, 23, "mid", -6],
        [503, 1019, 519, 100, 16, "dark", -6],
        [522, 1019, 548, 71, 19, "shade", -5],
      ]}
    />
    <GrassTuft
      name="reference-tuft-800"
      blades={[
        [745, 1075, 715, 93, 21, "shade", 1],
        [754, 1075, 718, 130, 24, "orange", 6],
        [773, 1075, 773, 130, 21, "dark", -9],
        [786, 1075, 817, 148, 21, "orange", -6],
        [794, 1075, 812, 104, 19, "shade", -6],
        [805, 1075, 848, 126, 23, "dark", -5],
        [822, 1075, 876, 138, 24, "orange", -6],
        [836, 1075, 874, 68, 28, "shade", -6],
        [826, 1075, 862, 98, 21, "dark", -8],
        [765, 1075, 751, 102, 15, "mid", -4],
      ]}
    />
    <GrassTuft
      name="reference-tuft-1170"
      blades={[
        [1126, 973, 1103, 62, 22, "shade"],
        [1143, 973, 1139, 126, 18, "gold", -6],
        [1141, 973, 1120, 99, 21, "dark", -3],
        [1157, 973, 1161, 107, 16, "orange", -5],
        [1166, 973, 1210, 138, 24, "gold", -4],
        [1177, 973, 1190, 113, 26, "dark", -8],
        [1190, 973, 1238, 151, 22, "orange", -3],
        [1207, 973, 1246, 88, 22, "shade", -5],
        [1220, 973, 1239, 104, 23, "dark", -10],
      ]}
    />
    <GrassTuft
      name="reference-tuft-right"
      blades={[
        [1858, 1056, 1836, 96, 29, "dark", -2],
        [1871, 1056, 1869, 168, 25, "gold", -8],
        [1888, 1056, 1860, 155, 27, "mid", 9],
        [1903, 1056, 1896, 167, 27, "shade", 4],
        [1914, 1056, 1986, 241, 28, "gold", -7],
        [1928, 1056, 1968, 165, 26, "dark", -9],
        [1940, 1056, 1989, 127, 26, "orange", -8],
        [1955, 1056, 1989, 110, 29, "shade", -8],
        [1878, 1056, 1874, 118, 20, "dark", -1],
        [1906, 1056, 1952, 148, 22, "mid", -8],
      ]}
    />
  </g>
);

export const SavannaReference = ({
  animated = false,
}: {
  readonly animated?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <TimeContext.Provider value={animated ? frame / fps : 0}>
      <AbsoluteFill>
        <svg
          viewBox="0 0 2048 1152"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Reconstrução vetorial da savana ao pôr do sol, com um antílope à direita"
        >
          <defs>
            <linearGradient
              id="ref-sun-middle"
              x1="0"
              y1="210"
              x2="0"
              y2="484"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={p.sunMiddleTop} />
              <stop offset="0.35" stopColor={p.sunMiddleCenter} />
              <stop offset="1" stopColor={p.sunMiddle} />
            </linearGradient>
            <linearGradient
              id="ref-sky"
              x1="0"
              y1="0"
              x2="0"
              y2="770"
              gradientUnits="userSpaceOnUse"
            >
              {p.sky.map((color, i) => (
                <stop
                  key={color}
                  offset={
                    [0, 100, 200, 300, 400, 500, 600, 650, 700, 770][i] / 770
                  }
                  stopColor={color}
                />
              ))}
            </linearGradient>
            <linearGradient
              id="ref-hills-far"
              x1="0"
              y1="685"
              x2="2048"
              y2="860"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={p.hillsFar[0]} />
              <stop offset="0.5" stopColor={p.hillsFar[1]} />
              <stop offset="1" stopColor={p.hillsFar[2]} />
            </linearGradient>
            <linearGradient
              id="ref-hills-middle"
              x1="0"
              y1="795"
              x2="0"
              y2="885"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={p.hillsMiddle[0]} />
              <stop offset="1" stopColor={p.hillsMiddle[1]} />
            </linearGradient>
            <linearGradient
              id="ref-hills-near"
              x1="0"
              y1="833"
              x2="0"
              y2="894"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={p.hillsNear[0]} />
              <stop offset="1" stopColor={p.hillsNear[1]} />
            </linearGradient>
            <linearGradient
              id="ref-ground"
              x1="0"
              y1="877"
              x2="0"
              y2="1152"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={p.ground[0]} />
              <stop offset="0.17" stopColor={p.ground[1]} />
              <stop offset="0.37" stopColor={p.ground[2]} />
              <stop offset="0.68" stopColor={p.ground[3]} />
              <stop offset="1" stopColor={p.ground[4]} />
            </linearGradient>
            <linearGradient
              id="ref-antelope-body"
              x1="1500"
              y1="810"
              x2="1620"
              y2="923"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={p.animal} />
              <stop offset="0.55" stopColor={p.animal} />
              <stop offset="1" stopColor={p.animalLight} />
            </linearGradient>
            <linearGradient id="ref-grass-gold" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={p.grassGold} />
              <stop offset="0.4" stopColor={p.grassOrange} />
              <stop offset="0.8" stopColor={p.grassMid} />
              <stop offset="1" stopColor={p.grass} />
            </linearGradient>
            <linearGradient id="ref-grass-orange" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={p.grassOrange} />
              <stop offset="0.7" stopColor={p.grassMid} />
              <stop offset="1" stopColor={p.grass} />
            </linearGradient>
          </defs>
          <DepthLayer depth={0.08}>
            <Sky />
          </DepthLayer>
          <DepthLayer depth={0.3}>
            <Hills />
          </DepthLayer>
          <DepthLayer depth={0.75}>
            <LeftAcacia />
            <RightAcacia />
          </DepthLayer>
          <DepthLayer depth={1}>
            <Ground />
            <Thicket />
            <Antelope />
          </DepthLayer>
          <DepthLayer depth={1.2}>
            <Foreground />
          </DepthLayer>
        </svg>
      </AbsoluteFill>
    </TimeContext.Provider>
  );
};

export const SavannaAnimation = () => <SavannaReference animated />;
