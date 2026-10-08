---
name: producao
description: "Operação de voz, trilha e efeitos sonoros já decididos, montagem do arquivo final e descrição. Use para gerar ou corrigir narração, gerar trilha, buscar e baixar efeitos, renderizar e conferir a entrega."
---

## FUNÇÃO

Opera as ferramentas sobre os artefatos atuais que cada comando exige: gera a voz, roda a trilha, baixa efeitos, renderiza e monta o arquivo. É quem executa e cuida das ferramentas, e não quem decide o que vem antes ou depois: a pergunta de cada trabalho é se o que o comando consome existe e corresponde ao estado atual.

## ESCOPO

**Entradas:** o que o comando pedido consome, e só isso. Para a narração, um `script.json` válido, com `shots` em toda cena (skill `diretor-criativo`); para a trilha, o campo `music` e a narração gravada; para os efeitos, a lista de usos (skill `diretor-de-som`); para um render, as cenas pedidas como estão agora (skill `diretor-de-arte`); para a montagem, as cenas, a narração e o som atuais; para a descrição, `script.json`, `script.md` e `research.md`.

**Saídas:** `public/videos/<vídeo>/` com a narração, o tempo de cada palavra e a trilha; `out/<vídeo>/<vídeo>.final.mp4`; `src/videos/<vídeo>/description.md`.

## ANTI-ESCOPO

- O texto de uma frase: pertence à skill `diretor-criativo`. Aqui se aponta a frase que pede reescrita; a reescrita é de lá.
- O que a música faz em cada trecho, os níveis, os silêncios e onde cabe um efeito: pertencem à skill `diretor-de-som`. Aqui se roda o que ela decidiu.
- Desenho, composição e movimento: pertencem à skill `diretor-de-arte`.
- Publicar o vídeo: é sempre ação do usuário. Tags, SEO, calendário e redes ficam fora.
- Arte final de thumbnail.

## ORGANIZAÇÃO

`etapas/` contém os procedimentos por trabalho; esta skill não tem unidades de estilo.

## ETAPAS

Escolha o procedimento pelo artefato pedido. Em tarefa localizada, leia só as seções pertinentes e os apoios daquele caso; leia o procedimento inteiro para o trabalho completo. As linhas não formam uma fila.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Narração | gerar a voz de um roteiro válido, ou de novo depois de uma frase alterada; palavra mal pronunciada; troca da amostra de voz; render que acusa narração ausente ou desatualizada | `etapas/narracao.md` |
| Trilha | a skill `diretor-de-som` pede a trilha, ou uma parte dela de novo; narração que mudou de duração | `etapas/trilha.md` |
| Efeitos sonoros | a skill `diretor-de-som` entrega usos que faltam no catálogo | `etapas/efeitos-sonoros.md` |
| Montagem e arquivo final | montar, exportar ou normalizar o vídeo; conferir o arquivo de entrega | `etapas/corte-final.md` |
| Descrição e publicação | escrever ou refazer a descrição; guardar no acervo o que foi ao ar | `etapas/publicacao.md` |

Renderizar cenas avulsas (`pnpm scene <vídeo> <id>`), só o som (`pnpm sound`) ou quadros (`pnpm stills`) é rodar o comando sobre o que existe agora, sem procedimento próprio: os comandos estão no `AGENTS.md`.

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

- o trabalho pedido entregou o que o procedimento dele promete, com os avisos do comando resolvidos ou conferidos pelo usuário;
- faltar o artefato que o comando consome, ou ele não corresponder ao estado atual: diga qual é e de quem é, sem contorná-lo;
- a mudança pedida for de outro artefato: a frase que pede reescrita é da skill `diretor-criativo`; a imagem ou o movimento, da `diretor-de-arte`; a trilha que pede outra descrição, outro nível ou outro efeito, da `diretor-de-som`;
- restar algo que só o usuário julga ou decide (o ouvido, a licença da voz, publicar): relate e espere;
- o pedido estiver no anti-escopo.
