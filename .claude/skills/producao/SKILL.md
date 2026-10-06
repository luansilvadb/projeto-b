---
name: producao
description: "Voz e arquivo final de um vídeo do canal, e a operação das ferramentas de som: narração com a voz clonada, geração da trilha, busca de efeitos sonoros, corte final e descrição de publicação. Use para gerar a narração ou corrigir pronúncia, entonação ou amostra de voz; rodar a trilha já decidida ou gerar de novo uma parte dela; buscar e baixar um efeito sonoro; renderizar e conferir se o vídeo está pronto; e montar a descrição com as fontes."
---

## FUNÇÃO

Opera as ferramentas que transformam o roteiro e as cenas aprovados em som e em arquivo. O arquivo passa pela **terceira aprovação do usuário**.

## ESCOPO

**Entradas:** `script.json` aprovado (skill `diretor-criativo`); para o corte final, as cenas animadas e aprovadas (skill `diretor-de-arte`).

**Saídas:** `public/videos/<vídeo>/` com a narração, o tempo de cada palavra e a trilha; `out/<vídeo>.final.mp4`; `src/videos/<vídeo>/description.md`.

## ANTI-ESCOPO

- O texto de uma frase: pertence à skill `diretor-criativo`. Aqui se aponta a frase que pede reescrita; a reescrita é de lá.
- O que a música faz em cada trecho, os níveis, os silêncios e onde cabe um efeito: pertencem à skill `diretor-de-som`. Aqui se roda o que ela decidiu.
- Desenho, composição e movimento: pertencem à skill `diretor-de-arte`.
- Publicar o vídeo: é sempre ação do usuário. Tags, SEO, calendário e redes ficam fora.
- Arte final de thumbnail.

## ETAPAS

O pedido decide a etapa. Cada etapa tem um procedimento só, lido inteiro; esta skill não tem unidades de estilo.

| Etapa | Quando | Procedimento |
|---|---|---|
| 3. Narração | roteiro aprovado ou alterado; palavra mal pronunciada; troca da amostra de voz; render que acusa narração ausente ou desatualizada | `etapas/narracao.md` |
| 6. Som: trilha | a skill `diretor-de-som` pede a trilha, ou uma parte dela de novo; narração que mudou de duração | `etapas/trilha.md` |
| 6. Som: efeitos | a skill `diretor-de-som` entrega usos que faltam no catálogo | `etapas/efeitos-sonoros.md` |
| 7. Corte final | render final, exportar, finalizar; saber se o vídeo está pronto para publicar | `etapas/corte-final.md` |
| 8. Publicação | vídeo aprovado no corte final; escrever ou refazer a descrição | `etapas/publicacao.md` |

A narração tem dois arquivos de apoio, lidos só na seção do caso:

| Apoio | Quando |
|---|---|
| `etapas/narracao-voz.md` | fora do fluxo normal: editar uma frase à mão no estúdio; achar as escolhas e as tomadas; ajustar a regra de escolha; trocar a amostra de voz; mudar o ritmo |
| `etapas/narracao-diagnostico.md` | reclamação da voz (sem energia ou mal-humorada; robótica ou diferente da amostra; fim de frase cortado ou sumindo), antes de mexer em parâmetro, amostra ou texto: guarda o que já foi medido e descartado com a voz atual |

## LIMITES

- Um comando pesado por vez: `pnpm narrate`, `pnpm voice`, `pnpm music` e `pnpm render` disputam os 8 GB da placa e a memória da máquina.
- O agente não ouve áudio nem assiste ao vídeo: o que só o ouvido julga (pronúncia, entonação, música, ritmo) vai ao usuário com o caminho do arquivo, e a entrega diz o que foi medido e o que só ele pode conferir.

## CRITÉRIOS DE PARADA

Pare quando:

- a etapa pedida entregou o que o procedimento dela promete, com os avisos do comando resolvidos ou aceitos pelo usuário;
- uma frase pede reescrita: devolva à skill `diretor-criativo`; a trilha pede outra descrição, outro nível ou outro efeito: devolva à skill `diretor-de-som`;
- o corte final tem pendência que só o usuário resolve: relate e espere, sem contorná-la;
- o pedido estiver no anti-escopo.
