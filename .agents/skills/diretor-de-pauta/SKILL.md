---
name: diretor-de-pauta
description: "Ponto de partida de um vídeo ou curta: o briefing (modo, destino, prazo, duração, recursos e regras do evento) e a escolha do registro em pauta.md. No modo canal, o tema sai da procura (nicho, candidatos, oferta e volume); no modo jam, a premissa de ficção sai dos filtros do briefing, sem procura. Use para abrir um projeto com briefing, comparar temas ou premissas, ou medir a procura de um termo no modo canal."
---

## Papel e entregas

Dono do ponto de partida: o briefing e a escolha do tema ou da premissa. O usuário escolhe; esta skill leva a ele finalistas com a evidência que o modo pede.

Entrada: o pedido do usuário e, quando há evento, as regras que ele forneceu. Nada mais: nenhum outro artefato precisa existir.

Entrega em `src/videos/<vídeo>/pauta.md`. A pasta do vídeo nasce aqui, com nome em inglês, que vira o id da composição e o primeiro argumento de todo comando.

| Modo | `pauta.md` guarda | Caminho |
|---|---|---|
| `canal` | o tema, o termo buscado que o título vai carregar, as medições datadas, o motivo e os finalistas que perderam | "Trabalho no modo canal", abaixo |
| `jam` | o briefing, a premissa escolhida, o motivo e as premissas que perderam | `briefing`, depois `premissa` |

Sem briefing, o modo é `canal` e nada muda para os vídeos do canal. As regras do canal (`nicho`, o desempate pela trupe em `escolha`) não valem no modo `jam`.

## Fora do escopo

- Recorte, tese, promessa, pesquisa de fatos, história e frase de intenção: `diretor-criativo`. Um recorte ou um desfecho possível pode ser anotado como argumento a favor, marcado como não pesquisado; ele não é decisão.
- Título, descrição, tags e pacote de envio: `diretor-publicacao`, que recebe o termo buscado, quando há um, e o destino e as regras do briefing.
- Plano de tempo: `diretor-producao`, que lê o prazo do briefing.
- Desempenho de vídeo publicado, calendário e estratégia de canal.
- Prever viral: mede-se procura, oferta e ponto fora da curva.
- Regulamento do evento: é transcrito como o usuário o forneceu, e nunca deduzido.

## Trabalho no modo canal

1. **Candidatos.** Levante termos que o público digita e passe cada um pelo nicho. Pronto quando há de cinco a dez candidatos que passam, cada um nas palavras em que apareceu.
2. **Oferta.** Leia quem já responde cada candidato e marque os pontos fora da curva. Pronto quando cada candidato tem views, canal, inscritos, idade e formato dos primeiros resultados, ou a limitação dita.
3. **Volume.** Peça ao usuário o volume e a competição dos até cinco melhores, um termo por busca. Pronto quando cada um tem os dois níveis, e o que deu o menor volume com oferta forte foi medido de novo na versão curta.
4. **Base.** Confira se cada finalista tem resposta estabelecida. Pronto quando cada um está marcado "firme" ou saiu.
5. **Escolha.** Apresente de dois a quatro finalistas numa tabela, com a recomendação e o motivo, e pare. Pronto quando o usuário escolheu e `pauta.md` existe.

Os passos 1, 2 e 4 são do agente e vêm antes de qualquer pedido ao usuário além do volume. Um candidato que reprova no nicho ou no corte de volume sai sem consulta, com o motivo dito. Pedido localizado ("mede a procura deste termo", "esse tema é do canal?") vai direto à unidade dele.

## Trabalho no modo jam

1. **Briefing.** Transcreva o que o usuário forneceu e marque o que falta. Pronto quando o modo e o destino estão ditos e nenhuma regra do evento foi suposta (`briefing`).
2. **Premissa.** Levante premissas, passe cada uma pelos filtros e apresente os finalistas, com a recomendação, e pare. Pronto quando o usuário escolheu e `pauta.md` existe (`premissa`).

Não há medida de procura neste modo, mesmo com `youtube` no destino: ela só é feita a pedido.

## Índice de unidades

| Unidade | Pergunta | Leia quando |
|---|---|---|
| `briefing` | Que produto é este, para onde vai e com que tempo e recursos? | O pedido traz evento, prazo, destino ou ficção, ou outra direção pergunta o que o briefing diz. |
| `premissa` | Como um curta de ficção começa por uma premissa? | O modo é `jam`. |
| `nicho` | Este tema é do canal? | Modo `canal`: um candidato aparece, antes de medi-lo. |
| `candidatos` | De onde saem os temas a medir? | Modo `canal`: o levantamento começa. |
| `medida` | O que cada número diz, e qual não vale? | Para ler a oferta, pedir o volume ou interpretar um painel. |
| `escolha` | Qual tema ganha, e o que fica registrado? | Modo `canal`: houver candidatos medidos, ou um tema escolhido cair na pesquisa. |

## Transição e qualidade

O protocolo comum da equipe (frase de intenção, donos, handoff, gravidade e rodadas) está em `diretor-producao/equipe/protocolo.md`.

- **Passa adiante**: `pauta.md` ao `diretor-criativo`, dizendo o que é decisão do usuário (o tema ou a premissa, os campos do briefing) e o que ficou "não fornecido". Sempre que o briefing traz prazo ou regras de evento, em qualquer modo, eles vão também à `diretor-producao` e ao `diretor-publicacao`, que não esperam o roteiro para lê-los: vale igual para o vídeo do canal que tem prazo (`escolha`).
- **Confere antes de passar**: cada número tem data e fonte; cada regra do evento tem a fonte que o usuário deu; nenhum campo foi preenchido por suposição; a premissa passa nos seis filtros com os recursos do briefing.
- **Passagem pontual**: uma mudança de um campo (o prazo, uma regra do evento, o destino) vai com a data, a fonte e os artefatos que a leem (`diretor-producao`, `diretor-publicacao`, `diretor-criativo`). Não reabre a escolha do tema ou da premissa, salvo se o campo mudado a invalida; nesse caso, o registro diz qual e por quê.
- **Informação ausente**: "não fornecido" fica no campo, e a pergunta vai ao usuário com o que depende dela. O trabalho que não depende do campo segue.

## Parada

A escolha termina quando o usuário escolheu um finalista e `pauta.md` está escrito; daí o tema ou a premissa segue para o `diretor-criativo`. No modo `canal`, se nenhum candidato passa no nicho e no corte de volume, diga isso e levante outra rodada de sementes, em vez de afrouxar o filtro. No modo `jam`, se nenhuma premissa cabe no briefing, diga qual filtro reprovou todas e leve ao usuário o campo do briefing que precisaria ceder.
