# Design

## Context

Motivação em `proposal.md`; comportamento em `specs/topic-selection/spec.md`. As decisões abaixo foram tomadas pelo usuário, uma a uma, na entrevista de 2026-10-10.

O que o repositório impõe:

- As cinco direções locais seguem um molde: `SKILL.md` roteador (papel, entregas, fora do escopo, índice de unidades, parada) e unidades com `PERGUNTA`, `RESPOSTA`, `DEPENDÊNCIAS`, `REFERÊNCIAS`, `LIMITES` e `EXEMPLO`.
- `.claude` é link para `.agents`: uma pasta nova em `.agents/skills/` é descoberta pelos dois clientes sem configuração.
- Decisão do usuário fica na pasta do vídeo, no arquivo do dono, e não existe estado global.
- Lição nova entra marcada como **proposta** e vira regra quando um produto feito por ela é aceito de primeira.
- Skills são criadas e podadas pela `creator`, global.

## Goals / Non-Goals

**Goals:**
- Uma skill de texto, sem código, que leve do "não tenho ideia" a um tema escolhido com evidência.
- Que os erros de medição de 2026-10-10 estejam escritos como regra, onde o próximo levantamento os lê.
- Que a escolha seguinte parta do que a anterior já mediu.

**Non-Goals:**
- Prever viral: a skill mede procura, oferta e pontos fora da curva.
- Comando `pnpm`, script ou API para volume.
- Calendário, série ou estratégia de canal além do filtro do nicho.

## Decisions

**1. Sexta direção local, com o nicho dentro.** O padrão `diretor-*` nomeia hoje só as donas de artefato do canal. Alternativa descartada: skill global com o método e o nicho num arquivo do projeto; só valeria com um segundo canal, que não existe.

**2. Nome `diretor-de-pauta`.** "Pauta" é a decisão do que vai ser feito. Descartados: `diretor-de-tema` ("tema" já é a entrada do `diretor-criativo`), `diretor-editorial` (o `diretor-criativo` já se descreve assim), `diretor-de-demanda` (nomeia o método), `diretor-de-audiencia` (sugere acompanhar desempenho, que ficou de fora).

**3. Quatro unidades planas, sem pastas de categoria.**

| Unidade | Pergunta | Guarda |
|---|---|---|
| `nicho` | Este tema é do canal? | As três condições e as três exclusões. |
| `candidatos` | De onde saem os temas a medir? | Frases-semente, autocompletar, finalistas de `pauta.md` anteriores, material cortado de `research.md` de outros vídeos. |
| `medida` | O que cada número diz, e qual não vale? | Um termo por busca, versão curta, leitura da oferta, campos a ignorar, o pedido ao usuário. |
| `escolha` | Qual tema ganha, e o que fica registrado? | O corte fixo, a ordem de peso (proposta), a conferência da base, a tabela de finalistas, o formato de `pauta.md`, a volta quando o tema cai. |

As outras direções agrupam unidades em pastas (`conceito/`, `escrita/`) porque têm vinte; com quatro, a pasta é sobra. Alternativa descartada: um `SKILL.md` só. Caberia, mas `medida` cresce a cada erro novo de leitura e ficaria enterrada no roteador.

**4. Sem subagente e sem `grilling`.** Os especialistas das outras direções existem para uma leitura independente ou para trabalho longo em paralelo. Aqui o levantamento é meia dúzia de consultas e a decisão é uma só, do usuário, já apresentada pela tabela de finalistas.

**5. Evidência sem ferramenta nova.** O agente consulta o autocompletar do YouTube (endpoint público de sugestões, com `ds=yt`, `hl=pt-BR`, `gl=BR`; funcionou em 2026-10-10 sem chave) e lê a página de busca para a oferta. O usuário mede volume e competição no vidIQ. Alternativa descartada: API do YouTube ou de palavras-chave, que pede chave e cota para poupar minutos.

**6. Formato de `pauta.md`.** Cabeçalho com tema, termo buscado e data da escolha; tabela de medições (termo, data, volume, competição, views máximas e médias, pontos fora da curva, base); o motivo em uma ou duas linhas; tabela dos finalistas que perderam, com as mesmas colunas; e uma seção de trocas, vazia até um tema cair. O recorte anotado como argumento entra no motivo, marcado como não pesquisado.

**7. A ordem de peso entra como proposta.** Ela saiu de uma comparação só (cinco pontos a menos na nota, quatro vezes mais views). Vira regra quando um vídeo escolhido por ela for publicado e render, e sai se não render. Nenhum limiar numérico além do corte de volume: com um dia de medições, qualquer número seria inventado.

**8. Conferência da base antes, pesquisa depois.** A `diretor-de-pauta` faz uma busca rápida por finalista e marca a base na tabela; fonte por afirmação continua em `research.md`, do `diretor-criativo`. Alternativa descartada: não conferir nada antes, que arrisca horas de pesquisa num finalista sem base.

**9. Quando o tema inteiro cai, a pasta é renomeada.** Nesse ponto só existem `pauta.md` e talvez `research.md`; não há roteiro, narração nem composição em `src/Root.tsx`. O `research.md` do tema que caiu vai junto para a pasta nova só se servir ao tema novo; senão é apagado, e o git guarda.

**10. O primeiro caso fecha a mudança.** A escolha do segundo vídeo roda pela skill pronta, com os quatro termos de 2026-10-10 como candidatos já medidos. É o único jeito de testar a leitura da oferta antes de arquivar.

## Risks / Trade-offs

- [A página de busca do YouTube não se deixa ler pelo agente] → a spec já prevê a queda: a oferta passa ao usuário pelos campos de views do painel. A unidade `medida` é escrita depois do teste, com o caminho que funcionou.
- [O endpoint de sugestões não é documentado e pode mudar] → a unidade `candidatos` descreve o que se procura (o que o público digita), e cita o endpoint como o meio atual; sem ele, o usuário digita as sementes na busca e cola as sugestões.
- [Os níveis do vidIQ são estimativa de terceiro] → servem para comparar candidatos entre si, nunca como número absoluto; por isso as views dos resultados pesam mais.
- [O filtro do nicho descarta temas de muita busca, como jejum] → é a troca aceita pelo usuário: o canal não dá conselho.
- [Seis direções em vez de cinco aumentam o que o agente lê] → o roteador é curto, e a skill só carrega quando o pedido é escolher tema.
- [A ordem de peso pode estar errada] → está marcada como proposta e tem critério de saída.

## Migration Plan

Só texto novo e edições de documentação; desfazer é reverter os commits. O `why-we-sleep` não muda.
