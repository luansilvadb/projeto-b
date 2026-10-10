# Proposal

## Why

Nenhuma skill é dona da pergunta "que vídeo fazer": o `diretor-criativo` começa com "tema obrigatório" na entrada, e o `diretor-publicacao` só aparece depois, para o título. Na escolha do segundo vídeo, em 2026-10-10, a falta custou quatro erros seguidos: recortes sugeridos sem olhar a procura de nenhum, frases de recorte medidas como se fossem termos de busca, quatro termos medidos colados numa busca só, e um campo do painel com valor impossível (média de assinantes de 282 milhões) quase usado na comparação. O nicho do canal também não está escrito em arquivo nenhum, então não há filtro que reprove um tema antes de medi-lo.

## What Changes

- Nova skill local `diretor-de-pauta`, em `.agents/skills/diretor-de-pauta/`, a sexta direção: dona da escolha do tema de um vídeo. Roteador e quatro unidades (`nicho`, `candidatos`, `medida`, `escolha`), sem subagente próprio e sem acionar a `grilling`.
- O nicho do canal passa a estar escrito, na unidade `nicho`: três condições (pergunta de curiosidade de leigo, ciência com base firme, perene) e três exclusões (conselho, notícia e moda, ciência disputada no centro).
- Novo artefato por vídeo, `src/videos/<vídeo>/pauta.md`: tema, termo buscado, medições datadas, motivo da escolha e finalistas que perderam. O `diretor-de-pauta` cria a pasta do vídeo e escolhe o id dela.
- `diretor-criativo`: a entrada "tema obrigatório" passa a dizer de onde o tema vem, e a regra de parada ganha o caminho de volta quando o tema inteiro não se sustenta na pesquisa.
- `diretor-publicacao`: o termo buscado de `pauta.md` vira entrada do par título-thumbnail.
- `AGENTS.md` e `README.md`: de cinco para seis direções, `pauta.md` na lista dos arquivos de decisão, a linha nova na tabela de trabalhos, donos e artefatos.
- A escolha do segundo vídeo é o primeiro caso da skill: os termos já medidos em 2026-10-10 entram como candidatos, e a leitura da oferta, ainda não testada, é provada nesse caso.

Fica de fora: acompanhar o desempenho de vídeo publicado, automatizar o volume por API, script ou comando `pnpm` novo, e `pauta.md` retroativo para o `why-we-sleep`.

## Capabilities

### New Capabilities
- `topic-selection`: a escolha do tema de um vídeo — o filtro do nicho, o levantamento de candidatos e de evidência de procura, a comparação, a decisão do usuário, o registro em `pauta.md` e a volta quando o tema não se sustenta.

### Modified Capabilities

Nenhuma. A `agent-guidance` já cobre onde uma skill local mora e como é descoberta, e a skill nova segue esses requisitos sem alterá-los.

## Impact

- Novos: `.agents/skills/diretor-de-pauta/SKILL.md` e as quatro unidades; `src/videos/<vídeo>/pauta.md` no primeiro vídeo escolhido por ela.
- Alterados: `.agents/skills/diretor-criativo/SKILL.md`, `.agents/skills/diretor-publicacao/SKILL.md` e `embalagem/titulo-e-thumbnail.md` (se o termo buscado mudar o que ela diz do título), `AGENTS.md`, `README.md`.
- Sem código: nenhum arquivo em `src/` (fora o `pauta.md`), `scripts/` ou `tools/` muda, e `pnpm lint` e `pnpm test` não são afetados.
- Dependência externa de uso, não de instalação: o autocompletar e a busca do YouTube, lidos pelo agente, e o painel do vidIQ, lido pelo usuário.
