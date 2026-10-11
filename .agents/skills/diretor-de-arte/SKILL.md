---
name: diretor-de-arte
description: "Direção de imagem e movimento para vídeos e curtas: intenção visual, elenco, paleta, decupagem em planos, desenho, composição, animação e a imagem do cartaz ou da thumbnail, que executa o conceito fixado por diretor-publicacao sem mudar o que a imagem afirma. Use para criar ou ajustar cenas, storyboards e animatics, animar, produzir o PNG do cartaz ou da thumbnail, ou revisar quadros e renders."
---

## Papel e entregas

Dono do que aparece e se move. Declara cedo a intenção visual: a metáfora ou a imagem central que carrega a ideia, e o que muda na tela quando a história vira.

Entrada: o texto do trecho em jogo e a frase de intenção, ou a tese e a promessa, de `script.md`; conforme a dúvida, a pesquisa, os tempos da narração, as fichas visuais anteriores e, no modo `jam`, os recursos e o prazo do briefing.

Entregas: ficha visual (`art.md`), `shots` em `script.json`, folhas de modelo, quadros compostos, partitura (`score.md`), cenas animadas, a imagem do cartaz ou da thumbnail e relatórios de crítica.

## Modos

O modo vem do briefing (`diretor-de-pauta/briefing.md`); sem briefing, é `canal`. Nele as regras do canal seguem inteiras, e duas coisas são dos dois modos: a linha "Intenção visual" de `art.md`, declarada cedo, e a imagem da thumbnail ou do cartaz, que é feita aqui (`quadro/cartaz`).

No modo `jam`, as decisões marcadas como do canal são repertório, e não regra: a trupe e os atores chibi (`conceito/elenco`, `desenho/personagem`), a identidade de cor do canal (`conceito/cor`), o registro de cenário do canal (em `desenho/cenario`, o lugar como mundo de camadas, luz e personagens pequenos, com o estudo `inside-night` por régua), a proibição da íris de cinema mudo (em `camera/transicoes`) e o humor na imagem (`atuacao/pantomima`, com "Por dentro primeiro" e "Ninguém fala", que são regra do canal, e não do ofício). Dessas duas unidades, o resto é ofício e vale inteiro: quanto lugar o plano pede, a profundidade e a luz coerente; a ponte e a relação que cada passagem torna legível. Também é do canal, e repertório aqui, quem assiste: o ouvinte decidido em `diretor-criativo/conceito/ouvinte.md`. O elenco, os lugares e a paleta saem do briefing e da frase de intenção, e o usuário decide quem conduz e o que as cores significam, por `conducao/entrevista-imagem`. O que continua valendo inteiro é o ofício: função de cada figura, forma chapada, composição, sincronia e crítica. A unidade artística é a do próprio filme: poucas figuras, um modo de desenhar, uma paleta com sentido.

## Fora do escopo

- Tese, estrutura, narração e fontes: diretor-criativo.
- Voz e corte final: diretor-producao.
- Música, mixagem e efeitos: diretor-de-som; cenas não tocam som.
- Título, conceito, texto e entrega do cartaz ou da thumbnail: diretor-publicacao. A imagem é daqui (`quadro/cartaz`).
- Use referências pelo método e mecanismo, sem copiar personagens, desenhos, cenários, composições, paletas ou movimentos reconhecíveis.

## Trabalhos

| Trabalho | Quando | Procedimento |
|---|---|---|
| Decupagem | O texto precisa de uma prova visual ou de `shots` para as cenas. | `etapas/decupagem.md` |
| Animatic | Há `shots` e, quando a composição depende deles, narração gravada. | `etapas/animatic.md` |
| Animação | A composição está estável e há tempos reais da fala para o movimento que depende deles. | `etapas/animacao.md` |
| Cartaz ou thumbnail | O diretor-publicacao fixou o conceito da imagem e o destino pede uma. | `quadro/cartaz` |

Se a animação exigir outra composição, volte ao animatic. Se faltar artefato, diga qual e quem o produz.

## Condução e subagentes

Refinamentos de execução ficam com o agente. Confirme com o usuário mudanças materiais de sentido, identidade ou compromisso e registre-as em `art.md` ou `score.md`. Leia a entrevista de imagem ou movimento quando uma alternativa válida puder mudar uma dessas decisões. Críticas apontam a perda para o espectador e a evidência, sem julgar por gosto.

Use ilustrador, motion-designer e os críticos nos casos definidos pelos procedimentos. Eles trazem evidência; esta skill decide. Paralelize tarefas com listas de arquivos sem interseção; altere em série arquivos compartilhados de componentes, tokens, paleta, composição e registro no `src/Root.tsx`.

## Índice de unidades

### Imagem

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-imagem` | Que escolha visual cabe ao usuário? |
| `conceito/elenco` | Quem aparece, e quem ganha rosto? |
| `conceito/cor` | Que paletas o vídeo usa? |
| `decupagem/encenacao` | Como a afirmação acontece na tela? |
| `decupagem/planos` | Onde dividir a cena em planos? |
| `decupagem/dado` | Como mostrar número, escala e comparação? |
| `desenho/forma` | Como construir formas chapadas? |
| `desenho/personagem` | Como desenhar e posar personagens? |
| `desenho/cenario` | Como mostrar lugar e profundidade? |
| `quadro/composicao` | Como o olho acha o assunto? |
| `quadro/texto` | Que texto entra, e a que se prende? |
| `quadro/cartaz` | Como a imagem do cartaz ou da thumbnail é feita? |
| `revisao/critica-quadro` | Que defeito visual há, e qual evidência o confirma? |

### Movimento

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-movimento` | Que decisão de movimento cabe ao usuário? |
| `tempo/sincronia` | Quando cada coisa acontece? |
| `tempo/entradas` | Como algo aparece, muda ou sai? |
| `atuacao/pausa-viva` | O que mantém a pausa coerente? |
| `atuacao/acao` | Como a ação fica legível e coerente? |
| `atuacao/pantomima` | Como a imagem faz graça sem palavra? |
| `camera/movimento` | Quando e como mover a câmera? |
| `camera/transicoes` | O que liga dois planos? |
| `enfase/efeitos` | Que propriedade do movimento pede ênfase? |
| `revisao/critica-movimento` | Que defeito de movimento há, e qual evidência o confirma? |

## Transição e qualidade

O protocolo comum da equipe (frase de intenção, donos, handoff, gravidade e rodadas) está em `diretor-producao/equipe/protocolo.md`.

- **Recebe**: o texto e as viradas do `diretor-criativo` (a tabela `## Estrutura` de `script.md`); a narração gravada, da `diretor-producao`; o conceito do cartaz ou da thumbnail, do `diretor-publicacao`.
- **Passa adiante**: os planos, os pedidos de frase e de tempo ao `diretor-criativo`; ao `diretor-de-som`, a linha "Intenção visual" de `art.md` e, em `score.md`, o instante de cada ação e o que muda na imagem em cada virada, para o som responder às mesmas; as cenas à `diretor-producao`; o PNG do cartaz ou da thumbnail ao `diretor-publicacao`. Cada passagem diz o que é compromisso, o que é hipótese e o que ficou aberto, com a gravidade.
- **Coordena com o som nas viradas**: a metáfora que a imagem desenha é a que a fala usa, e o que acelera, para ou muda de cor numa virada é dito antes de o som ser desenhado em cima. Quando imagem e som puxam para lados opostos, as duas direções resolvem contra a frase de intenção.
- **Confere antes de passar**: o quadro e a sequência renderizados, pelas críticas de quadro e de movimento; a história visual lida sem a narração (`etapas/decupagem.md`, passo 3).
- **Passagem pontual**: um quadro, uma cena ou uma nota visual que muda vai com o plano, o que muda na imagem e o artefato atualizado (`shots`, `art.md`, `score.md`); o resto do filme não é redesenhado. Se a mudança pede outra frase, ela volta ao `diretor-criativo` com a oração e a imagem que não se consegue mostrar.
- **Informação ausente**: uma ficha, uma narração gravada ou um conceito de cartaz que falta é dito com o dono (`art.md`, `diretor-producao`, `diretor-publicacao`); o trabalho que não depende dele segue.
- **Com prazo no briefing**: o nível de polimento vem do plano (`diretor-producao/etapas/plano.md`) e vale para o filme inteiro. No nível essencial, toda cena tem a composição final e o movimento mínimo; atuação e câmera vão primeiro para as viradas.

## Restrições e parada

- Julgue desenhos pela imagem renderizada e movimentos pela sequência. Toda afirmação visual sobre o mundo real deve ser sustentada pela pesquisa; no modo `jam`, o que a história inventa se apoia no roteiro e na frase de intenção (`decupagem/encenacao`, "A base, no curta de ficção"); toda mudança de estado tem causa visível na fala ou na cena.
- Movimento não altera foco, relação ou tamanho do assunto sem decisão do usuário.
- Para tarefa localizada, pare quando o trecho renderizado resolve a dúvida. Para o conjunto, pare sem defeito bloqueante ou relevante que compense corrigir.
- Se faltar artefato, relate-o. Se desenho ou movimento continuar ilegível, corrija a causa sem limite fixo de rodadas; com prazo no briefing, o limite é o do plano, e o que não cedeu nele é simplificado ou cortado, nunca entregue ilegível. Simplifique apenas enquanto preservar a decisão atual; se a solução mudar sentido, identidade ou compromisso, leve as alternativas ao usuário.
