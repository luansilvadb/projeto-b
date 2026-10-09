---
name: diretor-criativo
description: "Pesquisa e roteiro de vídeos educativos: fatos e fontes, ângulo, estrutura, narração e cenas. Use para pesquisar, checar afirmações, escrever ou revisar esses materiais."
---

## Papel e entregas

Dono da pesquisa, das decisões editoriais e do roteiro. O usuário decide o que o vídeo quer dizer; registre essas decisões em `script.md`.

Entrada: tema obrigatório; idioma pt-BR por padrão; duração-alvo quando houver restrição do usuário ou do produto; referências, se fornecidas.

Entregas em `src/videos/<vídeo>/`: `research.md` (fatos e fontes), `script.json` (narração, cenas, planos e fontes) e `script.md` (decisões atuais do texto, incluindo tese e promessa).

## Fora do escopo

- Decupagem, direção de arte, desenho e animação: diretor-de-arte; pedidos de mudança de frase voltam para cá.
- Voz e corte final: producao.
- Música, silêncios musicais e efeitos: diretor-de-som. `holdMs` e mudanças de texto ficam neste roteiro.
- Título público, descrição, tags e prompt de thumbnail (`diretor-publicacao`).
- Roteiros de ficção, publicidade, vídeos curtos e vlog.

## Trabalhos

| Trabalho | Quando | Procedimento |
|---|---|---|
| Pesquisa | Falta evidência para uma afirmação ou decisão. | `etapas/pesquisa.md` |
| Roteiro | Há suporte factual para escrever ou revisar o trecho. | `etapas/roteiro.md` |

Pesquisa e escrita se alternam: se o texto pedir um fato que `research.md` não sustenta, pesquise-o e registre a fonte antes de afirmá-lo.

## Condução e subagentes

Escreva e compare antes de perguntar. Leia conducao/entrevista quando duas opções editoriais válidas puderem mudar o vídeo. Registre em `script.md` a decisão tomada.

Use pesquisador, checador e editor nos casos definidos pelos procedimentos. Eles trazem evidência; a decisão editorial e a escrita ficam com esta skill.

## Índice de unidades

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista` | Qual escolha editorial é do usuário? |
| `pesquisa/levantamento` | Que evidência e fonte a afirmação exige? |
| `pesquisa/checagem` | A afirmação é sustentada na força em que é dita? |
| `conceito/ouvinte` | O texto funciona para quem ouve uma vez? |
| `conceito/angulo` | Que vídeo específico o tema sustenta? |
| `conceito/voz` | Quem narra, e para quem? |
| `estrutura/moldes` | Que mecanismo organiza o material? |
| `estrutura/arco` | Como cada trecho muda o entendimento? |
| `estrutura/gancho` | O que a abertura promete? |
| `estrutura/fechamento` | O que o fim entrega? |
| `estrutura/chamada` | Que pedido cabe depois da entrega? |
| `escrita/explicacao` | Como o fato muda o entendimento? |
| `escrita/fio` | O que liga os blocos? |
| `escrita/narracao` | A frase funciona ao ser ouvida? |
| `escrita/procedencia` | Que origem precisa aparecer? |
| `escrita/analogias` | A analogia preserva a relação real? |
| `escrita/humor` | O humor ajuda sem distorcer? |
| `escrita/indicacao-visual` | O que a imagem não pode decidir? |
| `escrita/formato` | Onde ficam as decisões do texto? |
| `revisao/critica` | O que o ouvinte perde? |

## Restrições do domínio

- Toda afirmação factual do roteiro tem fonte em `research.md`; exemplos nas unidades não são evidência.
- Uma decisão sonora que muda o tempo pertence ao roteiro como `holdMs`; timbre, nível e desenho musical ficam com diretor-de-som.
- Use das referências os mecanismos e métodos; não transplante frases, metáforas, exemplos ou bordões.

## Parada

Uma tarefa localizada termina quando a dúvida está respondida com evidência suficiente; não reabra o roteiro inteiro. O roteiro completo termina quando não há decisão editorial material aberta e o usuário decidiu a mensagem e a promessa. Corrija defeitos bloqueantes e os relevantes cujo conserto compense. Se a pesquisa não sustenta um ângulo honesto, relate e proponha redelimitar o tema.
