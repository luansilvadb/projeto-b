---
name: producao
description: "Som e arquivo final de um vídeo do canal: narração com a voz clonada, trilha instrumental, efeitos sonoros, corte final e descrição de publicação. Use para gerar a narração ou corrigir pronúncia, entonação ou amostra de voz; gerar ou trocar a trilha, ou ajustá-la contra a voz; buscar ou trocar um efeito sonoro; renderizar e conferir se o vídeo está pronto; e montar a descrição com as fontes."
---

## FUNÇÃO

Opera as ferramentas que transformam o roteiro e as cenas aprovados em som e em arquivo. O arquivo passa pela **terceira aprovação do usuário**.

## ESCOPO

As cinco etapas da tabela de ETAPAS.

**Entradas:** `script.json` aprovado (skill `diretor-criativo`); para o corte final, as cenas animadas e aprovadas (skill `diretor-de-arte`).

**Saídas:** `public/videos/<vídeo>/` com a narração, o tempo de cada palavra e a trilha; `out/<vídeo>.final.mp4`; `src/videos/<vídeo>/description.md`.

## ANTI-ESCOPO

- O texto de uma frase e a descrição da trilha no roteiro: pertencem à skill `diretor-criativo`. Aqui se aponta a frase que pede reescrita; a reescrita é de lá.
- Desenho, composição e movimento: pertencem à skill `diretor-de-arte`, que também decide onde cabe um efeito sonoro e em que deixa ele toca.
- Publicar o vídeo: é sempre ação do usuário. Tags, SEO, calendário e redes ficam fora.
- Arte final de thumbnail.

## ETAPAS

O pedido decide a etapa. Cada etapa tem um procedimento só, lido inteiro; esta skill não tem unidades de estilo.

| Etapa | Quando | Procedimento | Comando | Entrega |
|---|---|---|---|---|
| 3. Narração | roteiro aprovado ou alterado; palavra mal pronunciada; troca da amostra de voz; render que acusa narração ausente ou desatualizada | `etapas/narracao.md` | `pnpm narrate <vídeo>` | áudio e tempo de cada palavra |
| 6. Trilha | vídeo sem trilha; outra música ou outro clima; música alta ou baixa contra a voz; narração que mudou de duração | `etapas/trilha.md` | `pnpm music <vídeo> [semente]` | trilha instrumental original |
| Efeitos sonoros (dentro da animação) | a animação pede um uso que falta no catálogo; trocar um efeito; efeitos altos ou baixos | `etapas/efeitos-sonoros.md` | `pnpm sfx "<busca>"` | som escolhido pelo usuário, no catálogo |
| 7. Corte final | render final, exportar, finalizar; saber se o vídeo está pronto para publicar | `etapas/corte-final.md` | `pnpm render <vídeo>` | `out/<vídeo>.final.mp4` e a **3ª aprovação** |
| 8. Publicação | vídeo aprovado no corte final; escrever ou refazer a descrição | `etapas/publicacao.md` | | `description.md`, com título e fontes |

A narração tem dois arquivos de apoio, lidos só na seção do caso:

| Apoio | Quando |
|---|---|
| `etapas/narracao-voz.md` | fora do fluxo normal: editar uma frase à mão no estúdio; achar as escolhas e as tomadas; ajustar a regra de escolha; trocar a amostra de voz; mudar o ritmo |
| `etapas/narracao-diagnostico.md` | reclamação da voz (sem energia ou mal-humorada; robótica ou diferente da amostra; fim de frase cortado ou sumindo), antes de mexer em parâmetro, amostra ou texto: guarda o que já foi medido e descartado com a voz atual |

## SUBAGENTE

No corte final, a conferência dos fatos é do subagente `checador` (`.claude/agents/`), que não escreveu o roteiro. Ele julga; levar a pendência ao usuário é desta skill.

## LIMITES

- Um comando pesado por vez: `pnpm narrate`, `pnpm voice`, `pnpm music` e `pnpm render` disputam os 8 GB da placa e a memória da máquina.
- O agente não ouve áudio nem assiste ao vídeo: o que só o ouvido julga (pronúncia, entonação, música, ritmo) vai ao usuário com o caminho do arquivo, e a entrega diz o que foi medido e o que só ele pode conferir.
- Uma pendência do corte final vai ao usuário; nunca é contornada.

## CRITÉRIOS DE PARADA

Pare quando:

- a etapa pedida entregou o que a tabela promete, com os avisos do comando resolvidos ou aceitos pelo usuário;
- uma frase pede reescrita ou a trilha pede outra descrição: devolva à skill `diretor-criativo`;
- o corte final tem pendência que só o usuário resolve: relate e espere;
- o pedido estiver no anti-escopo.
