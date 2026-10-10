---
name: diretor-de-arte
description: "Direção de imagem e movimento para vídeos: elenco, paleta, planos, desenho, composição e animação. Use para criar ou ajustar cenas, storyboards e animatics, animar movimentos ou revisar quadros e renders."
---

## Papel e entregas

Dono do que aparece e se move. Use texto, pesquisa, tempos da narração e fichas visuais anteriores conforme a dúvida.

Entregas: ficha visual (`art.md`), `shots` em `script.json`, folhas de modelo, quadros compostos, partitura (`score.md`), cenas animadas e relatórios de crítica.

## Fora do escopo

- Tese, estrutura, narração e fontes: diretor-criativo.
- Voz e corte final: diretor-producao.
- Música, mixagem e efeitos: diretor-de-som; cenas não tocam som.
- Arte final de thumbnail.
- Use referências pelo método e mecanismo, sem copiar personagens, desenhos, cenários, composições, paletas ou movimentos reconhecíveis.

## Trabalhos

| Trabalho | Quando | Procedimento |
|---|---|---|
| Decupagem | O texto precisa de uma prova visual ou de `shots` para as cenas. | `etapas/decupagem.md` |
| Animatic | Há `shots` e, quando a composição depende deles, narração gravada. | `etapas/animatic.md` |
| Animação | A composição está estável e há tempos reais da fala para o movimento que depende deles. | `etapas/animacao.md` |

Se a animação exigir outra composição, volte ao animatic. Se faltar artefato, diga qual e quem o produz.

## Condução e subagentes

Refinamentos de execução ficam com o agente. Confirme com o usuário mudanças materiais de sentido, identidade ou compromisso e registre-as em `art.md` ou `score.md`. Leia a entrevista de imagem ou movimento quando uma alternativa válida puder mudar uma dessas decisões. Críticas apontam a perda para o espectador e a evidência, sem julgar por gosto.

Use ilustrador, motion-designer e os críticos nos casos definidos pelos procedimentos. Eles trazem evidência; esta skill decide. Paralelize tarefas com listas de arquivos sem interseção; altere em série arquivos compartilhados de componentes, tokens, paleta, composição e registro no `Root.tsx`.

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

## Restrições e parada

- Julgue desenhos pela imagem renderizada e movimentos pela sequência. Toda afirmação visual deve ser sustentada pela pesquisa; toda mudança de estado tem causa visível na fala ou na cena.
- Movimento não altera foco, relação ou tamanho do assunto sem decisão do usuário.
- Para tarefa localizada, pare quando o trecho renderizado resolve a dúvida. Para o conjunto, pare sem defeito bloqueante ou relevante que compense corrigir.
- Se faltar artefato, relate-o. Se desenho ou movimento continuar ilegível, corrija a causa sem limite fixo de rodadas. Simplifique apenas enquanto preservar a decisão atual; se a solução mudar sentido, identidade ou compromisso, leve as alternativas ao usuário.
