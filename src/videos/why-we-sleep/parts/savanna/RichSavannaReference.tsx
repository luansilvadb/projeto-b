import { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../../components/Idle";
import {
  GrassTuft,
  TimeContext,
  useStudyTime,
} from "../../../../studies/savanna-reference/SavannaReference";
import { RichAntelope } from "./RichAntelope";
import {
  Bush,
  CloudBank,
  RichAcacia,
  useRichGrassColors,
  RichLayer,
  SmallTuft,
  TallGrass,
} from "./RichScenery";
import { NightSky } from "./NightSky";
import {
  astroAt,
  RichTheme,
  savannaColorsAt,
  useRichPalette,
  useRichTheme,
} from "./RichTheme";
import { Layer, useCarriedNumber } from "../../../../components/Camera";
import { clamp01, mix } from "../../../../components/timing";

// As coordenadas acompanham a segunda referência. A reconstrução é vetorial:
// cada plano de distância e cada parte móvel continuam editáveis no Remotion.
const Paint = () => {
  const p = useRichPalette();
  const { moonlight, uid } = useRichTheme();
  return (
    <defs>
      <linearGradient
        id={`${uid}-rich-sky`}
        x1="0"
        y1="0"
        x2="0"
        y2="610"
        gradientUnits="userSpaceOnUse"
      >
        {p.sky.map((color, index) => (
          <stop
            key={index}
            offset={index / (p.sky.length - 1)}
            stopColor={color}
          />
        ))}
      </linearGradient>
      <radialGradient
        id={`${uid}-rich-sunrise`}
        cx="550"
        cy={mix(620, 580, moonlight)}
        r={mix(510, 410, moonlight)}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={p.sunshine} stopOpacity={mix(0.85, 0.7, moonlight)} />
        <stop offset=".38" stopColor={p.sunshine} stopOpacity=".3" />
        <stop offset="1" stopColor={p.sunshine} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-rich-sun-orange`} x2=".25" y2="1">
        <stop stopColor={p.sunCoral} />
        <stop offset=".45" stopColor={p.sunOrange} />
        <stop offset="1" stopColor={p.clouds.orange} />
      </linearGradient>
      <linearGradient id={`${uid}-rich-sun`} x2=".6" y2="1">
        <stop stopColor={p.sunEdge} />
        <stop offset="1" stopColor={p.sun} />
      </linearGradient>
      <linearGradient id={`${uid}-rich-canopy`} x1=".1" y1="0" x2=".8" y2="1">
        <stop stopColor={p.canopy.light} />
        <stop offset=".55" stopColor={p.canopy.mid} />
        <stop offset="1" stopColor={p.canopy.dark} />
      </linearGradient>
      <linearGradient id={`${uid}-rich-hill`} x2="1" y2=".7">
        <stop stopColor={p.hills[1]} />
        <stop offset=".7" stopColor={p.hills[3]} />
        <stop offset="1" stopColor={p.hills[2]} />
      </linearGradient>
      <linearGradient
        id={`${uid}-rich-ground`}
        x1="0"
        y1="698"
        x2="0"
        y2="941"
        gradientUnits="userSpaceOnUse"
      >
        {p.ground.map((color, index) => (
          <stop
            key={index}
            offset={index / (p.ground.length - 1)}
            stopColor={color}
          />
        ))}
      </linearGradient>
      <linearGradient id={`${uid}-rich-grass-gold`} x2="0" y2="1">
        <stop stopColor={p.earth.bright} />
        <stop offset=".6" stopColor={p.grass.gold} />
        <stop offset="1" stopColor={p.bush.orange} />
      </linearGradient>
      <linearGradient id={`${uid}-rich-grass-orange`} x2="0" y2="1">
        <stop stopColor={p.grass.orange} />
        <stop offset="1" stopColor={p.bush.rose} />
      </linearGradient>
    </defs>
  );
};

const Sky = () => {
  const p = useRichPalette();
  const { moonlight, orb, uid } = useRichTheme();
  const t = useStudyTime();
  // Sem astro pedido, o sol fica onde a referência do entardecer o pôs.
  const [sunX, sunY] = orb === undefined ? [114, 293] : astroAt(orb);
  return (
    <>
      <RichLayer depth={0.12} backdrop>
        {/* O céu vai até a base do quadro, por trás do chão: com as camadas ainda embaixo, na entrada e na saída, não sobra uma faixa reta no horizonte. */}
        <rect
          x="-150"
          y="-100"
          width="1972"
          height="1300"
          fill={`url(#${uid}-rich-sky)`}
        />
        <rect
          x="-150"
          y="0"
          width="1972"
          height="710"
          fill={`url(#${uid}-rich-sunrise)`}
        />
      </RichLayer>
      <RichLayer depth={0.12}>
        {/* O sol e a lua trocam por opacidade: a luz que passa do entardecer à noite não troca de desenho num quadro. */}
        {moonlight > 0 ? (
          <g opacity={moonlight}>
            <NightSky />
          </g>
        ) : null}
        {moonlight < 1 ? (
          <g
            transform={`translate(${sunX} ${sunY + t * 0.6})`}
            opacity={1 - moonlight}
          >
            <circle r="194" fill={p.sunHalo} opacity=".27" />
            <circle r="162" fill={p.sunCoral} opacity=".68" />
            <circle r="119" fill={`url(#${uid}-rich-sun-orange)`} />
            <circle r="69" fill={`url(#${uid}-rich-sun)`} />
          </g>
        ) : null}
        <CloudBank
          name="upper-left-cloud"
          x={340}
          y={232}
          width={328}
          color={p.clouds.rose}
          speed={0.8}
          lobes={[
            [23, 20, 11],
            [61, 22, 17],
            [112, 43, 47],
            [165, 31, 34],
            [214, 24, 19],
            [242, 24, 10],
            [285, 34, 5],
          ]}
        />
        <CloudBank
          name="upper-left-lit-base"
          x={340}
          y={232}
          width={327}
          color={p.clouds.orange}
          speed={0.8}
          lobes={[
            [23, 20, 11],
            [48, 24, 5],
            [252, 32, 4],
            [297, 19, 3],
          ]}
        />
        <CloudBank
          name="upper-small-cloud"
          x={650}
          y={273}
          width={82}
          color={p.clouds.coral}
          speed={1.1}
          lobes={[
            [15, 14, 6],
            [41, 18, 15],
            [66, 15, 7],
          ]}
        />
        <CloudBank
          name="upper-small-strand"
          x={739}
          y={273}
          width={31}
          color={p.clouds.rose}
          speed={1.1}
          lobes={[[15, 14, 3]]}
        />
        <CloudBank
          name="upper-right-lit-cloud"
          x={1347}
          y={213}
          width={423}
          color={p.clouds.orange}
          speed={0.65}
          lobes={[
            [23, 20, 4],
            [54, 13, 8],
            [82, 22, 12],
            [115, 24, 20],
            [145, 18, 16],
            [180, 35, 43],
            [233, 42, 64],
            [313, 51, 104],
            [381, 48, 61],
          ]}
        />
        <CloudBank
          name="upper-right-shadow"
          x={1457}
          y={213}
          width={324}
          color={p.clouds.rose}
          speed={0.65}
          lobes={[
            [32, 26, 6],
            [119, 37, 37],
            [174, 39, 51],
            [222, 55, 102],
            [281, 51, 54],
          ]}
        />
        <CloudBank
          name="left-lit-cloud-bank"
          x={238}
          y={478}
          width={492}
          color={p.clouds.lemon}
          speed={1.15}
          lobes={[
            [55, 27, 52],
            [113, 44, 97],
            [165, 31, 72],
            [219, 45, 68],
            [263, 27, 41],
            [294, 26, 27],
            [335, 24, 22],
            [381, 25, 6],
            [440, 28, 3],
          ]}
        />
        <CloudBank
          name="left-orange-cloud-bank"
          x={235}
          y={478}
          width={455}
          color={p.clouds.gold}
          speed={1.15}
          lobes={[
            [59, 31, 42],
            [113, 43, 90],
            [147, 22, 56],
            [181, 32, 60],
            [236, 34, 57],
            [279, 30, 29],
            [322, 28, 20],
            [357, 29, 10],
          ]}
        />
        <CloudBank
          name="left-coral-cloud-front"
          x={285}
          y={478}
          width={337}
          color={p.clouds.orange}
          speed={1.15}
          lobes={[
            [48, 44, 78],
            [92, 32, 53],
            [125, 21, 42],
            [164, 31, 50],
            [210, 32, 25],
            [259, 27, 10],
            [294, 25, 6],
          ]}
        />
        <CloudBank
          name="left-purple-cloud-front"
          x={152}
          y={478}
          width={308}
          color={p.clouds.purple}
          speed={1.15}
          lobes={[
            [22, 25, 7],
            [60, 26, 23],
            [124, 46, 54],
            [173, 27, 34],
            [215, 25, 14],
            [262, 26, 5],
          ]}
        />
        <CloudBank
          name="left-small-purple-cloud"
          x={0}
          y={479}
          width={151}
          color={p.clouds.purple}
          speed={1.15}
          lobes={[
            [21, 21, 6],
            [49, 19, 14],
            [95, 37, 33],
            [130, 22, 7],
          ]}
        />
        <CloudBank
          name="right-lit-cloud-bank"
          x={984}
          y={368}
          width={455}
          color={p.clouds.gold}
          speed={0.8}
          lobes={[
            [42, 35, 5],
            [89, 33, 15],
            [139, 35, 36],
            [185, 28, 25],
            [227, 28, 47],
            [282, 37, 78],
            [341, 47, 104],
            [390, 38, 59],
            [428, 24, 19],
          ]}
        />
        <CloudBank
          name="right-orange-cloud-front"
          x={1012}
          y={369}
          width={427}
          color={p.clouds.orange}
          speed={0.8}
          lobes={[
            [43, 27, 4],
            [95, 32, 17],
            [151, 25, 21],
            [204, 29, 30],
            [244, 25, 55],
            [294, 39, 80],
            [350, 40, 52],
            [393, 27, 20],
          ]}
        />
        <CloudBank
          name="right-rose-cloud"
          x={1257}
          y={359}
          width={184}
          color={p.clouds.rose}
          speed={0.8}
          lobes={[
            [39, 27, 57],
            [92, 40, 88],
            [137, 32, 39],
          ]}
        />
        <CloudBank
          name="right-purple-cloud-front"
          x={1266}
          y={369}
          width={466}
          color={p.clouds.dark}
          speed={0.8}
          lobes={[
            [40, 29, 20],
            [87, 35, 61],
            [126, 32, 31],
            [171, 34, 43],
            [240, 47, 84],
            [314, 35, 42],
            [364, 27, 9],
            [412, 33, 4],
          ]}
        />
        <CloudBank
          name="center-high-cloud"
          x={869}
          y={351}
          width={181}
          color={p.clouds.coral}
          lobes={[
            [20, 22, 4],
            [54, 23, 11],
            [80, 25, 8],
            [123, 24, 21],
            [164, 16, 3],
          ]}
        />
        <CloudBank
          name="left-thin-cloud"
          x={400}
          y={363}
          width={67}
          color={p.clouds.orange}
          lobes={[
            [20, 19, 5],
            [45, 16, 4],
          ]}
        />
        <CloudBank
          name="right-thin-cloud"
          x={1430}
          y={415}
          width={204}
          color={p.clouds.coral}
          lobes={[
            [26, 24, 4],
            [72, 24, 8],
            [106, 23, 18],
            [137, 20, 9],
            [169, 31, 6],
          ]}
        />
        <CloudBank
          name="center-low-cloud"
          x={777}
          y={448}
          width={321}
          color={p.clouds.orange}
          speed={1.3}
          lobes={[
            [34, 30, 5],
            [78, 31, 10],
            [111, 23, 22],
            [162, 32, 32],
            [210, 29, 15],
            [261, 33, 10],
            [291, 23, 5],
          ]}
        />
        <CloudBank
          name="right-low-purple-cloud"
          x={1128}
          y={456}
          width={239}
          color={p.clouds.purple}
          lobes={[
            [24, 28, 5],
            [56, 31, 11],
            [109, 31, 21],
            [146, 32, 13],
            [183, 24, 28],
            [212, 17, 8],
          ]}
        />
        <CloudBank
          name="right-low-rose-cloud"
          x={847}
          y={476}
          width={337}
          color={p.clouds.rose}
          lobes={[
            [44, 34, 7],
            [91, 36, 12],
            [135, 29, 17],
            [170, 28, 14],
            [229, 48, 46],
            [278, 27, 25],
            [312, 24, 7],
          ]}
        />
        <CloudBank
          name="horizon-lit-cloud"
          x={248}
          y={582}
          width={607}
          color={p.clouds.lemon}
          speed={0.5}
          lobes={[
            [90, 39, 45],
            [151, 48, 63],
            [202, 35, 28],
            [287, 38, 23],
            [351, 51, 49],
            [400, 30, 25],
            [462, 37, 28],
            [504, 30, 17],
            [551, 29, 10],
          ]}
        />
        <CloudBank
          name="horizon-coral-cloud"
          x={247}
          y={587}
          width={621}
          color={p.clouds.coral}
          speed={0.5}
          lobes={[
            [95, 42, 43],
            [154, 45, 64],
            [203, 34, 27],
            [293, 37, 31],
            [351, 48, 55],
            [415, 30, 36],
            [467, 37, 41],
            [507, 28, 23],
            [552, 26, 13],
          ]}
        />
        <CloudBank
          name="low-detached-cloud"
          x={760}
          y={537}
          width={179}
          color={p.clouds.coral}
          speed={0.6}
          lobes={[
            [28, 26, 4],
            [51, 22, 9],
            [78, 22, 24],
            [107, 22, 10],
            [140, 15, 6],
          ]}
        />
        <CloudBank
          name="far-right-horizon-cloud"
          x={1554}
          y={498}
          width={196}
          color={p.clouds.coral}
          speed={0.6}
          lobes={[
            [29, 27, 6],
            [64, 25, 12],
            [105, 34, 24],
            [164, 34, 6],
          ]}
        />
      </RichLayer>
    </>
  );
};

const Hills = () => {
  const p = useRichPalette();
  const { uid } = useRichTheme();
  return (
    <>
      <RichLayer depth={0.3}>
        <path
          d="M-100 557 C-20 548 42 513 70 524 C98 537 129 521 166 537 C250 559 312 569 389 580 C448 592 470 577 520 584 C615 598 701 575 786 578 C893 580 997 570 1086 573 C1253 577 1373 593 1493 568 C1530 561 1551 544 1595 545 C1631 545 1681 554 1760 574 L1760 755 L-100 755 Z"
          fill={p.hills[0]}
        />
        <path
          d="M-100 578 C26 553 95 566 172 570 C241 575 326 586 416 604 C493 625 587 632 668 614 C790 585 880 579 976 561 C1072 543 1146 550 1226 556 C1302 561 1368 577 1449 594 C1520 614 1620 599 1760 603 L1760 762 L-100 762 Z"
          fill={`url(#${uid}-rich-hill)`}
        />
        <RichAcacia name="far-left-tree" x={48} y={621} scale={0.16} distant />
        <RichAcacia
          name="far-middle-tree"
          x={545}
          y={626}
          scale={0.19}
          distant
        />
        <RichAcacia
          name="far-right-tree"
          x={1596}
          y={611}
          scale={0.19}
          distant
        />
      </RichLayer>
      <RichLayer depth={0.48}>
        <path
          d="M-100 623 C79 604 177 623 283 637 C406 650 511 661 639 670 C799 684 930 674 1031 666 C1135 657 1229 665 1340 675 C1448 685 1590 670 1760 675 L1760 754 L-100 754 Z"
          fill={p.hills[4]}
        />
        <RichAcacia
          name="middle-tree"
          x={991}
          y={674}
          scale={0.24}
          distant
          color={p.nearTree}
        />
        <RichAcacia
          name="tiny-middle-tree"
          x={887}
          y={691}
          scale={0.11}
          distant
          color={p.nearTree}
        />
        <path
          d="M-100 695 C43 682 102 694 165 693 C302 678 431 692 537 698 C648 713 703 702 796 693 C899 696 1042 685 1143 685 C1228 680 1300 700 1408 690 C1526 682 1612 690 1760 692 L1760 749 L-100 749 Z"
          fill={p.bush.rose}
        />
        <SmallTuft name="hill-tuft-left" x={413} y={704} scale={0.62} />
        <SmallTuft name="hill-tuft-middle" x={679} y={706} scale={0.9} />
      </RichLayer>
      <RichLayer depth={0.74}>
        <RichAcacia name="rich-left-acacia" x={260} y={699} scale={0.69} />
        <RichAcacia name="rich-right-acacia" x={1368} y={698} />
      </RichLayer>
    </>
  );
};

const Ground = ({ subject = true }: { readonly subject?: boolean }) => {
  const p = useRichPalette();
  const { uid } = useRichTheme();
  const RichGrassColors = useRichGrassColors();
  return (
    <RichLayer depth={1}>
      <path
        d="M-200 700 C84 692 248 695 409 701 C621 708 794 710 991 708 C1225 704 1474 703 1800 694 L1800 1100 L-200 1100 Z"
        fill={`url(#${uid}-rich-ground)`}
      />
      {/* Desníveis compridos e irregulares fazem a luz correr pelo chão sem uma grade. */}
      <path
        d="M-100 714 C132 706 232 711 373 709 L543 715 L391 721 C616 718 712 729 908 722 C1123 713 1287 717 1456 711 L1760 705 L1760 725 C1489 727 1310 734 1092 732 C924 737 718 738 562 734 C337 729 180 733 -100 739 Z"
        fill={p.earth.bright}
        opacity=".64"
      />
      <path
        d="M-100 750 C99 743 243 740 388 746 C490 747 573 746 662 751 C582 756 507 755 445 758 C235 765 74 760 -100 767 Z M840 751 C984 746 1058 746 1169 750 C1125 755 993 759 901 757 Z M1294 749 C1449 753 1580 747 1760 741 L1760 757 C1577 759 1453 765 1367 759 Z"
        fill={p.earth.gold}
        opacity=".5"
      />
      <path
        d="M-100 784 C143 786 305 775 478 782 C565 782 600 787 682 786 C610 794 529 795 453 803 C272 809 91 800 -100 805 Z M751 791 C872 783 1016 785 1144 795 C1221 800 1311 797 1377 791 C1343 807 1241 815 1127 811 C956 808 863 800 751 803 Z M1491 789 C1585 786 1681 785 1770 789 L1770 812 C1661 807 1605 807 1518 810 Z"
        fill={p.earth.orange}
        opacity=".5"
      />
      <path
        d="M-100 809 C102 809 176 819 330 816 C431 815 563 820 659 823 C573 830 420 827 343 828 C173 830 54 822 -100 823 Z M751 826 C940 821 1058 816 1203 823 C1131 830 995 834 908 832 C855 830 792 833 751 831 Z M1349 821 C1511 821 1641 831 1770 825 L1770 840 C1617 831 1512 835 1396 832 Z"
        fill={p.earth.gold}
        opacity=".55"
      />
      <path
        d="M-100 856 C161 849 269 858 420 861 C562 864 708 872 890 866 C1108 860 1260 868 1416 872 C1580 876 1700 859 1770 866 L1770 894 C1592 894 1472 896 1312 883 C1184 877 1072 882 919 884 C709 887 603 874 432 882 C228 877 65 869 -100 882 Z"
        fill={p.earth.coral}
        opacity=".65"
      />
      <path
        d="M-100 920 C80 902 195 919 339 916 C518 920 623 908 804 912 C1015 912 1207 929 1365 922 C1540 914 1665 925 1770 912 L1770 1090 L-100 1090 Z"
        fill={p.earth.red}
      />
      <g fill={p.shadow} opacity=".16">
        <path d="M252 698 L271 698 L571 745 L543 745 Z" />
        <path d="M1350 698 L1385 698 L1740 758 L1690 757 Z" />
      </g>
      {(
        [
          [35, 716, 0.33],
          [136, 715, 0.3],
          [196, 717, 0.46],
          [281, 720, 0.26],
          [517, 727, 0.63],
          [489, 725, 0.26],
          [910, 716, 0.5],
          [1019, 718, 0.56],
          [1115, 720, 0.38],
          [1440, 716, 0.36],
          [1577, 724, 0.42],
        ] as const
      ).map(([x, y, scale], i) => (
        <SmallTuft
          key={i}
          name={`back-grass-${i}`}
          x={x}
          y={y}
          scale={scale}
          warm
        />
      ))}
      <Bush name="back-bush-left" x={179} y={713} scale={0.33} />
      <Bush name="back-bush-middle" x={354} y={732} scale={0.5} />
      <Bush name="back-bush-right" x={850} y={712} scale={0.43} />
      {(
        [
          [170, 780, 0.68],
          [225, 789, 0.4],
          [452, 809, 0.7],
          [512, 804, 0.56],
          [538, 804, 0.33],
          [824, 792, 0.8],
          [1100, 779, 0.75],
          [1170, 809, 0.8],
          [1450, 797, 0.55],
          [1580, 834, 0.75],
          [263, 875, 1.25],
          [508, 917, 1.3],
          [1022, 880, 1.05],
          [1211, 939, 0.83],
        ] as const
      ).map(([x, y, scale], i) => (
        <SmallTuft
          key={i}
          name={`field-grass-${i}`}
          x={x}
          y={y}
          scale={scale}
          warm
        />
      ))}
      <Bush name="middle-bush-left" x={273} y={809} scale={0.76} />
      <Bush name="middle-small-bush" x={869} y={826} scale={0.47} shade />
      <Bush name="near-bush-right" x={881} y={904} scale={0.88} />
      <SmallTuft name="left-feature-tuft" x={397} y={833} scale={1.73} />
      <SmallTuft name="center-feature-tuft" x={649} y={872} scale={2.05} />
      <SmallTuft name="right-feature-tuft" x={954} y={808} scale={1.75} />
      {subject && (
        <>
          <TallGrass />
          {/* As quatro sombras começam nos cascos e apontam para longe do sol. */}
          <g fill={p.shadow} opacity=".46">
            <path d="M1152 818 L1166 818 L1389 868 L1367 865 Z" />
            <path d="M1175 818 L1189 818 L1443 883 L1418 878 Z" />
            <path d="M1220 818 L1238 818 L1491 878 L1466 874 Z" />
            <path d="M1273 818 L1289 818 L1583 886 L1557 882 Z" />
          </g>
          <RichAntelope />
          <GrassTuft
            parallelEdges
            name="ankle-grass"
            colors={RichGrassColors}
            blades={[
              [1128, 811, 1129, 45, 8, "gold"],
              [1140, 812, 1129, 20, 8, "orange"],
              [1302, 816, 1296, 40, 10, "gold"],
              [1315, 816, 1321, 55, 11, "mid"],
              [1334, 818, 1344, 44, 11, "orange"],
            ]}
          />
        </>
      )}
    </RichLayer>
  );
};

const Foreground = () => {
  const p = useRichPalette();
  const RichGrassColors = useRichGrassColors();
  const t = useStudyTime();
  const sway = 0.8 * (wave(t, 5.3) - wave(0, 5.3));
  return (
    <RichLayer depth={1.26}>
      <GrassTuft
        parallelEdges
        name="corner-grass-left"
        colors={RichGrassColors}
        blades={[
          [10, 849, 24, 181, 24, "dark", 4],
          [41, 845, 69, 195, 24, "gold", -4],
          [70, 851, 96, 169, 25, "orange", -4],
          [121, 876, 140, 110, 25, "mid"],
          [181, 944, 217, 85, 24, "gold"],
          [237, 938, 272, 84, 21, "mid"],
        ]}
      />
      <g transform={`translate(0 940) skewX(${sway}) translate(0 -940)`}>
        <path
          d="M-25 969 C-37 883 -12 764 24 704 C57 679 28 786 8 851 C45 803 99 733 121 739 C122 758 82 814 55 856 C101 799 141 771 166 779 C193 787 145 841 103 877 C159 832 181 829 195 839 C220 853 166 906 132 927 C200 883 229 891 248 918 L250 971 Z"
          fill={p.bush.dark}
        />
        <path
          d="M-22 958 C-21 910 3 868 55 822 C86 797 122 778 147 781 C125 804 90 826 68 852 C58 865 50 880 50 889 C29 916 7 943 -22 958 Z"
          fill={p.grass.shade}
        />
        <path
          d="M13 966 C44 931 68 904 87 885 C98 870 105 858 106 844 C136 815 155 804 167 810 C171 822 144 852 115 876 C113 885 109 894 105 900 C160 869 188 858 196 863 C171 897 128 926 96 951 Z"
          fill={p.canopy.dark}
        />
      </g>
      <Bush name="bottom-left-shrub" x={386} y={973} scale={1.9} shade />
      <Bush
        name="bottom-middle-left-shrub"
        x={464}
        y={987}
        scale={1.75}
        shade
      />
      <Bush name="bottom-coral-shrub" x={810} y={980} scale={1.65} />
      <Bush name="bottom-center-shrub" x={762} y={982} scale={1.55} shade />
      <Bush name="bottom-right-rose-shrub" x={923} y={984} scale={1.7} />
      <Bush name="bottom-right-shrub" x={976} y={995} scale={1.73} shade />
      <Bush name="bottom-small-left" x={249} y={970} scale={1.16} shade />
      <Bush name="bottom-small-right" x={1308} y={996} scale={1.7} shade />
      <GrassTuft
        parallelEdges
        name="corner-grass-right"
        colors={RichGrassColors}
        blades={[
          [1496, 947, 1438, 141, 26, "mid", 7],
          [1521, 952, 1462, 167, 26, "orange", 9],
          [1542, 955, 1515, 197, 24, "mid", 7],
          [1576, 971, 1594, 182, 23, "shade", -5],
          [1629, 950, 1680, 214, 25, "dark", -6],
          [1673, 960, 1709, 233, 25, "mid", -5],
        ]}
      />
      <g
        transform={`translate(1640 940) skewX(${-sway * 0.8}) translate(-1640 -940)`}
      >
        <path
          d="M1700 979 C1664 921 1654 842 1641 793 C1656 778 1669 819 1672 835 C1680 811 1694 769 1712 766 L1750 975 Z"
          fill={p.bush.dark}
        />
        <path
          d="M1669 976 C1635 923 1596 886 1531 867 C1499 857 1465 849 1484 878 C1498 899 1530 918 1564 935 C1521 921 1484 915 1445 917 C1459 939 1503 957 1541 965 L1496 978 Z"
          fill={p.bush.dark}
        />
        <path
          d="M1689 964 C1663 918 1629 885 1598 871 C1611 877 1630 890 1638 906 C1619 896 1602 892 1586 893 C1612 916 1634 943 1646 964 Z"
          fill={p.grass.shade}
        />
      </g>
    </RichLayer>
  );
};

export const RichSavannaReference = ({
  animated = false,
  daylight = 0.5,
  environmentOnly = false,
  cameraDriven = false,
  orb,
}: {
  readonly animated?: boolean;
  /** 0 é noite, 0,5 é o entardecer e 1 é pleno dia; no meio, as cores passam de um horário ao outro. */
  readonly daylight?: number;
  readonly environmentOnly?: boolean;
  readonly cameraDriven?: boolean;
  readonly orb?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId();
  return (
    <RichTheme.Provider
      value={{
        palette: savannaColorsAt(daylight),
        moonlight: clamp01(1 - 2 * daylight),
        cameraDriven,
        orb,
        uid,
      }}
    >
      <TimeContext.Provider value={animated ? frame / fps : 0}>
        <AbsoluteFill>
          <svg
            viewBox="0 0 1672 940.5"
            width="100%"
            height="100%"
            aria-label="Savana em camadas, com nuvens, acácias e o sol ou a lua"
          >
            <Paint />
            <Sky />
            <Hills />
            <Ground subject={!environmentOnly} />
            <Foreground />
          </svg>
        </AbsoluteFill>
      </TimeContext.Provider>
    </RichTheme.Provider>
  );
};

export const RichSavannaAnimation = () => <RichSavannaReference animated />;
export const NightSavannaReference = () => (
  <RichSavannaReference daylight={0} />
);
export const NightSavannaAnimation = () => (
  <RichSavannaReference daylight={0} animated />
);

// A conferência da luz: nove horas, do dia (quadro 0) à noite (quadro 8).
const HOURS = 8;
export const SAVANNA_HOURS_FRAMES = HOURS + 1;
export const SavannaHours = () => (
  <RichSavannaReference
    daylight={1 - useCurrentFrame() / HOURS}
    environmentOnly
    orb={0.3}
  />
);

/**
 * O cenário do elenco: o mesmo desenho das referências, sem o ator de
 * demonstração. Na mesma savana do plano anterior, a luz e o astro continuam
 * de onde estavam.
 */
export const RichSavannaBackdrop = ({
  daylight: ownDaylight,
  orb: ownOrb,
  children,
}: {
  readonly daylight: number;
  /** Posição do sol ou da lua ao longo do arco: 0 nasce à esquerda, 1 se põe à direita. */
  readonly orb?: number;
  readonly children: React.ReactNode;
}) => {
  const daylight = useCarriedNumber("savanna-daylight", ownDaylight);
  const orb = useCarriedNumber("savanna-orb", ownOrb ?? 0);
  return (
    <>
      <RichSavannaReference
        animated
        daylight={daylight}
        environmentOnly
        cameraDriven
        orb={ownOrb === undefined ? undefined : orb}
      />
      <Layer depth={1}>{children}</Layer>
    </>
  );
};
