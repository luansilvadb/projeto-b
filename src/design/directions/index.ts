/** Três tons da mesma cor: é o que dá volume a uma forma chapada. */
export type Ramp = {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
};

/**
 * Uma direção de arte: tudo o que mudaria de uma identidade para outra.
 * O que é igual em todas (tamanhos de texto, traços, margem) fica em tokens.ts.
 */
export type Direction = {
  readonly palette: {
    /** Topo do fundo e a cor do texto dentro de etiquetas. */
    readonly ink: string;
    /** Base do fundo. */
    readonly dusk: string;
    /** Linhas e marcações secundárias. */
    readonly mist: string;
    /** Texto solto e pontos de luz. */
    readonly paper: string;
    readonly sun: Ramp;
    readonly ocean: Ramp;
    readonly leaf: Ramp;
    /** Cor de assinatura da direção: a etiqueta padrão. */
    readonly accent: Ramp;
  };
  readonly font: {
    readonly family: string;
    /** Arquivo em public/, variável: um só arquivo cobre a faixa de pesos. */
    readonly file: string;
    readonly weightRange: string;
    readonly weight: number;
  };
  readonly tagRadius: number;
  readonly motion: {
    readonly enter: (progress: number) => number;
    readonly seconds: {
      readonly enter: number;
      /** Intervalo entre elementos que entram em sequência. */
      readonly stagger: number;
    };
  };
};

