## PERGUNTA
Como um curta de ficção com narração em off conta uma história em pouco tempo, e o que nele troca as regras do vídeo educativo?

## RESPOSTA

Vale no modo `jam` (`diretor-de-pauta/briefing.md`). A entrada é a premissa escolhida em `pauta.md`, com o briefing: o tema, a duração, os recursos e o prazo.

**O que troca, e o que fica.** O ofício é o mesmo: uma ideia, entendida de primeira por quem ouve uma vez. Muda o que sustenta o texto.

| No vídeo educativo | No curta |
|---|---|
| a tese: o entendimento que o vídeo estabelece | a **frase de intenção**: o que quem assiste deve sentir ou entender ao fim, e por qual meio |
| a promessa: o que o vídeo entrega | a pergunta que a história abre e o fim responde |
| o fato, com fonte em `research.md` | o que a história inventa, coerente com as regras que ela mesma pôs |
| a explicação que muda o entendimento | a mudança da personagem, ou do que se sabe sobre ela |
| a chamada do canal no fim | nenhuma: o filme termina no fim da história |

Cada unidade do índice da skill cai num grupo só:

- **Valem inteiras**: `conducao/entrevista`, `estrutura/arco`, `estrutura/gancho`, `estrutura/fechamento`, `escrita/indicacao-visual`, `escrita/formato` e `revisao/critica`.
- **Vale o ofício, e a decisão do canal é repertório**: `conceito/ouvinte`, `escrita/fio` e `escrita/narracao`.
  - `conceito/ouvinte`: a premissa de quem ouve uma vez, as necessidades 0 a 5 e o teste do leigo valem inteiros. Quem é o ouvinte (quem assiste com TDAH, o adulto curioso que nunca estudou o tema) e o "Um pedido só" da chamada são decisões do canal: no curta, quem assiste é quem o briefing e o usuário disserem.
  - `escrita/fio`: "O que precisa funcionar", os quatro testes e o repertório de mecanismos valem inteiros. A base nos dois vídeos que dão o tom do canal, os sensores (medidos num vídeo de oito minutos) e o limite do narrador em off que não diz "eu" são decisões do canal: no curta, quem narra é o de `## Voz`.
  - `escrita/narracao`: "O ouvido", "A ferramenta de voz" e os testes valem inteiros, com o teste "Boca" feito contra o narrador do filme. "O registro do canal" e os sensores das referências são decisões do canal.
- **Só entram se o curta explicar alguma coisa**: `estrutura/moldes`, `escrita/explicacao`, `escrita/procedencia` e `escrita/analogias`, que são do vídeo que explica. A metáfora que carrega a história não é analogia que explica, e não passa por `escrita/analogias`.
- **Só entram se o curta afirmar algo sobre o mundo real**: `pesquisa/levantamento` e `pesquisa/checagem` ("O que é fato dentro da ficção", abaixo).
- **Regra do canal, repertório aqui**: `conceito/voz` e `escrita/humor`.
- **Não entram**: `conceito/angulo`, que é o compromisso do vídeo educativo (ângulo, tese e promessa) e dá lugar à frase de intenção, formulada aqui; e `estrutura/chamada`, porque o curta não tem chamada.

Em qualquer grupo, os sensores (as medidas das referências e a faixa de duração do canal) situam, e não medem um curta.

**A história cabe na duração.** A medida é a duração do briefing, e não um tamanho de costume: é ela que diz quantos personagens, desejos e viradas a história sustenta, e quanto menor ela é, mais perto de um personagem, um desejo ou um medo, uma virada e um fim que responde ao começo. Com a duração "não fornecido", pergunte ao usuário antes de dimensionar a história; não a deduza do evento, do prazo nem de outros curtas. A resposta entra no campo "Duração" do briefing, pelo `diretor-de-pauta`. Antes de escrever cenas, diga em poucas linhas: quem é, onde está, o que quer ou teme, o que acontece que muda isso, e como termina. Se o resumo não cabe em cinco linhas, a história tem acontecimento demais para ser acompanhada de primeira, e a que cabe ainda é conferida contra a duração do briefing. O que o briefing limita (poucos personagens, poucas locações) é força de foco, e não falta a compensar com narração.

**A frase de intenção** é formulada com o usuário antes de o texto ser expandido, pela regra de `conducao/entrevista`: duas intenções válidas fazem filmes diferentes. Ela vai para a linha `Intenção` de `script.md` (`escrita/formato`), e é dela que a arte e o som tiram as suas (`diretor-producao/equipe/protocolo.md`). As linhas "O que muda" da tabela `## Estrutura` são as viradas a que imagem e som respondem: num curta, poucas, e uma delas é a principal.

**Quem narra.** A narração em off é obrigatória no modo. Três escolhas definem o narrador, e são do usuário quando fazem filmes diferentes:

- **Quem é**: a personagem, em primeira pessoa; alguém de fora, que a observa; um objeto ou o lugar.
- **De quando fala**: enquanto acontece, ou depois, sabendo o fim.
- **O que sabe e o que cala.**

O narrador do curta fica inteiro na seção `## Voz` de `script.md`, e não como ajuste à voz do canal: "eu" e posição pessoal são permitidos aqui. A ferramenta gera uma voz só (`diretor-producao/etapas/narracao.md`): diálogo entre vozes diferentes não existe, e a fala de outra pessoa entra como discurso indireto ou na imagem.

**A narração diz o que a imagem não mostra.** O que se vê é ação, lugar e gesto; a voz traz o pensamento, a memória, o tempo, a ironia entre o que se diz e o que se vê. A frase que descreve o plano é cortada (`escrita/indicacao-visual`). O silêncio de fala é recurso do texto: a virada pode acontecer sem voz, no `holdMs` da cena, de até 8 s. Toda cena, porém, tem narração: é dela que sai o tempo.

**O que é fato dentro da ficção.** Inventar não pede fonte. Pede fonte, em `research.md` e no campo `sources` da cena, o que o filme afirma como verdade sobre o mundo real: uma data, um lugar, um dado de ciência, o que uma pessoa real fez. Aí valem `pesquisa/levantamento` e `pesquisa/checagem`, e o `checador` confere essas cenas. Sem nenhuma afirmação assim, `research.md` não nasce e o `checador` não é acionado. Pessoa real, marca e obra alheia são também questão de direito: evite, e o que ficar vai dito ao `diretor-publicacao`.

**As regras da ferramenta não mudam.** `script.json` segue `etapas/roteiro.md`: `title`, cenas com `narration` e `shots`, números e unidades por extenso, frase de até 280 caracteres, `holdMs` de até 8000. O `pnpm check-script` continua sendo o erro a corrigir; o perfil da narração que ele imprime e a faixa de 6 a 10 minutos são sensores do canal, e não medem um curta.

**A duração é requisito quando o briefing a limita.** A estimativa do `pnpm check-script` é o sinal antes da voz; a duração real é a da narração gravada mais os `holdMs`. O texto que estoura o limite é cortado antes da voz, pela história: sai um acontecimento, e não palavras de todas as frases. Passar do limite do evento é bloqueante.

**Conferência.** A leitura cega do `editor` vale igual: a história que ele reconstrói só com a narração é a que o filme quer contar? No curta a imagem carrega parte da história de propósito, então o que a leitura cega não acha é conferido contra os `shots`: está num plano, e se lê de um jeito só? Com `youtube` no destino, a conferência de título e abertura de `etapas/roteiro.md` vale para o título do filme; sem ele, não há título provisório a testar.

**Registro em `script.md`**: `Intenção`, com a frase de intenção e, na mesma linha, depois de um travessão, a pergunta dramática que a história abre e o fim responde (é o lugar único das duas, no lugar de `Tese` e `Promessa`; sem campo novo no JSON); `Idioma`; `Duração-alvo` quando o briefing a dá, `## Voz` com quem narra, `## Fio` com a regra do mundo ou o objeto que volta, e a tabela `## Estrutura`.

Pronto quando a história se reconstrói da narração e dos planos, a frase de intenção é a que o usuário decidiu, a duração estimada cabe no briefing, e não há afirmação sobre o mundo real sem fonte.

## DEPENDÊNCIAS
- `diretor-de-pauta/briefing.md`: fornece o modo, a duração, os recursos e as regras do evento.
- `conducao/entrevista`: diz o que, na intenção e no narrador, é decisão do usuário.
- `escrita/formato`: diz onde cada decisão fica.

## LIMITES
- Não vale para o vídeo do canal, que segue `conceito/angulo`, `conceito/voz` e `estrutura/chamada`.
- A premissa é do `diretor-de-pauta`; se nenhuma história honesta cabe nela, volta para lá.
- Nenhuma regra do evento é suposta aqui: tema, duração e restrições vêm do briefing.
