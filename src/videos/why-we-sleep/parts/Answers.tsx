import { Appear } from "../../../components/Appear";
import { Place } from "../../../components/Place";
import { ALREADY_SHOWN } from "../../../components/timing";
import { BoxIcon, DropIcon, ShelfIcon } from "./Icons";

type AnswersProps = {
  /** Centro horizontal de cada ícone: estoque, prateleiras e faxina. */
  readonly xs: readonly [number, number, number];
  readonly y: number;
  readonly size: number;
  /** Quadro da cena em que cada ícone entra; sem ele, todos já estão na tela. */
  readonly at?: readonly [number, number, number];
  /** A faxina aparece tracejada: é a resposta em disputa. */
  readonly disputed?: boolean;
};

/** As três respostas parciais para o sono, sempre na mesma ordem e com o mesmo desenho. */
export const Answers: React.FC<AnswersProps> = ({
  xs,
  y,
  size,
  at = [ALREADY_SHOWN, ALREADY_SHOWN, ALREADY_SHOWN],
  disputed = false,
}) => (
  <>
    <Place x={xs[0]} y={y}>
      <Appear at={at[0]}>
        <BoxIcon size={size} />
      </Appear>
    </Place>
    <Place x={xs[1]} y={y}>
      <Appear at={at[1]}>
        <ShelfIcon size={size} />
      </Appear>
    </Place>
    <Place x={xs[2]} y={y}>
      <Appear at={at[2]}>
        <DropIcon size={size} dashed={disputed} />
      </Appear>
    </Place>
  </>
);
