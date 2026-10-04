import { describe, expect, it } from "vitest";
import { narrationProfile, profileProblems } from "./profile";

// Um trecho no molde da referência: fala com quem assiste, em frases médias, amarradas por conectivos.
const EXPLAINED = [
  "Toda noite você se deita, fecha os olhos e passa horas sem reagir ao mundo.",
  "Parece normal, porque você faz a mesma coisa desde que nasceu.",
  "Mas pense no que isso custa a um bicho que vive cercado de outros bichos com fome.",
  "Se ele dorme, fica parado no mesmo lugar e demora muito mais para notar o perigo chegando.",
  "Um animal que conseguisse ficar acordado o tempo todo teria uma vantagem enorme sobre os vizinhos.",
  "Então era de esperar que, em centenas de milhões de anos, algum deles já tivesse abandonado esse hábito tão arriscado de uma vez por todas.",
  "Nenhum abandonou, e é por esse motivo que o seu corpo insiste nisso hoje.",
  "Para você entender a razão, vale olhar primeiro para quem chegou mais perto de escapar do seu problema.",
];
// O defeito que o canal já teve: fatos em terceira pessoa, picotados.
const LISTED = [
  "Uma água-viva pulsa. Cinquenta e oito vezes por minuto.",
  "Duas elefantas dormiam duas horas por dia. É o menor tempo já medido.",
  "A fragata dorme voando. Onze segundos por cochilo.",
];

describe("narrationProfile", () => {
  it("conta frases, palavras e o tamanho típico da frase", () => {
    const profile = narrationProfile([
      "Um dois três. Um dois três quatro cinco.",
    ]);
    expect(profile.sentences).toBe(2);
    expect(profile.words).toBe(8);
    expect(profile.medianSentenceWords).toBe(4);
    expect(profile.shortShare).toBe(1);
    expect(profile.longShare).toBe(0);
  });

  it("mede quanto o texto fala com quem assiste e quanto encadeia as frases", () => {
    const profile = narrationProfile([
      "Se você dorme, então o seu corpo descansa.",
    ]);
    expect(profile.viewerPer100).toBeCloseTo((100 * 2) / 8);
    expect(profile.connectivesPer100).toBeCloseTo((100 * 2) / 8);
  });

  it('conta "nós" e o verbo na primeira pessoa do plural como fala com quem assiste', () => {
    const profile = narrationProfile([
      "Nós dormimos os mesmos oito últimos minutos.",
    ]);
    expect(profile.viewerPer100).toBeCloseTo((100 * 2) / 7);
  });
});

describe("profileProblems", () => {
  it("aceita uma explicação dirigida a quem assiste", () => {
    expect(profileProblems(narrationProfile(EXPLAINED))).toEqual([]);
  });

  it("acusa a lista de fatos picotada e em terceira pessoa", () => {
    const labels = profileProblems(narrationProfile(LISTED)).map(
      (criterion) => criterion.label,
    );
    expect(labels).toContain("Frases de até 6 palavras");
    expect(labels).toContain('"você" e "nós" a cada 100 palavras');
    expect(labels).toContain("Palavras por frase (mediana)");
  });

  it("não acusa o texto por ter poucas frases longas", () => {
    const profile = narrationProfile(LISTED);
    expect(profile.longShare).toBe(0);
    expect(
      profileProblems(profile).map((criterion) => criterion.label),
    ).not.toContain("Frases de 25 palavras ou mais");
  });
});
