# Documentação

A documentação durável do projeto. O [`README.md`](../README.md) da raiz é a entrada (requisitos, instalação, mapa do repositório); aqui ficam os detalhes de trabalho e os critérios que valem para os vídeos.

As decisões de cada vídeo **não** ficam aqui: ficam na pasta do vídeo, em `src/videos/<vídeo>/` (`pauta.md`, `script.md`, `art.md`, `score.md`, `sound.md`, `publication.md`, `voice.json`). Esta pasta guarda o que vale para todos os vídeos.

Não há processo de propostas nem de validação formal: uma mudança que altera um critério ou uma convenção atualiza a página pertinente no mesmo commit, e o histórico fica no Git.

## Páginas

| Página | Conteúdo |
| ------ | -------- |
| [comandos.md](comandos.md) | Comandos `pnpm`, testes, validação e cuidados de execução |
| [arquitetura.md](arquitetura.md) | Como o roteiro, a narração e as cenas se ligam; como uma cena é escrita; scripts e ferramentas |
| [convencoes.md](convencoes.md) | Convenções de código e de conteúdo, onde ficam as decisões, como um ajuste é feito |
| [agentes.md](agentes.md) | Skills, especialistas, fonte central em `.agents/`, destinos `.claude/` e `.codex/`, skills globais |

## Critérios de produção e revisão

| Página | Conteúdo |
| ------ | -------- |
| [nicho.md](../.agents/skills/diretor-de-pauta/nicho.md) | Escolha do tema do canal: filtro do nicho |
| [candidatos.md](../.agents/skills/diretor-de-pauta/candidatos.md) | Escolha do tema do canal: de onde saem os candidatos |
| [medida.md](../.agents/skills/diretor-de-pauta/medida.md) | Escolha do tema do canal: o que cada medição da procura diz |
| [escolha.md](../.agents/skills/diretor-de-pauta/escolha.md) | Escolha do tema do canal: comparação, escolha e registro em `pauta.md` |
| [diretrizes/narracao.md](diretrizes/narracao.md) | Narração sem repetição: cada ideia, número, pessoa e regra dita uma vez |
| [diretrizes/desenhos.md](diretrizes/desenhos.md) | Construção única de personagens e cenários; rosto da pessoa |
| [diretrizes/som.md](diretrizes/som.md) | Efeitos no instante da ação; música no fundo e com uma identidade só |
