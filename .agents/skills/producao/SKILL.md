---
name: producao
description: "Operação de voz, trilha e efeitos sonoros já decididos, montagem do arquivo final e descrição. Use para gerar ou corrigir narração, gerar trilha, buscar e baixar efeitos, renderizar e conferir a entrega."
---

## Papel e entregas

Opera as ferramentas sobre os artefatos atuais; não decide o conteúdo.

Entregas: narração, manifesto de palavras e trilha em `public/videos/<vídeo>/`; arquivo final em `out/<vídeo>/<vídeo>.final.mp4`; descrição em `src/videos/<vídeo>/description.md`.

Use o comando só com as entradas atuais que ele exige: roteiro válido e com `shots` para narrar; `music` e narração gravada para gerar trilha; lista de usos para buscar efeitos; cenas, voz e som atuais para montar; `script.json`, `script.md` e `research.md` para a descrição.

## Fora do escopo

- Texto do roteiro: diretor-criativo.
- Mapa musical, níveis, silêncios e usos de efeitos: diretor-de-som.
- Desenho, composição e movimento: diretor-de-arte.
- Publicação é sempre ação do usuário; arte final de thumbnail, tags, SEO, calendário e redes ficam fora.

## Procedimentos

| Trabalho | Quando | Procedimento |
|---|---|---|
| Narração | Gerar ou corrigir voz, pronúncia, tomada ou sincronização. | `etapas/narracao.md` |
| Trilha | diretor-de-som pede geração ou mudança, ou a duração da voz mudou. | `etapas/trilha.md` |
| Efeitos sonoros | diretor-de-som entrega usos que faltam. | `etapas/efeitos-sonoros.md` |
| Montagem e arquivo final | Montar, normalizar ou conferir a entrega. | `etapas/corte-final.md` |
| Descrição e acervo | Escrever a descrição ou guardar o que foi publicado. | `etapas/publicacao.md` |

Para exceções à narração normal, leia só o apoio do caso:

| Apoio | Quando |
|---|---|
| `etapas/narracao-voz.md` | Edição manual, escolhas de tomada, regra de escolha, troca da amostra ou ritmo. |
| `etapas/narracao-diagnostico.md` | Reclamação de energia, naturalidade ou fim de frase cortado, antes de mudar texto ou parâmetro. |

`pnpm scene`, `pnpm sound` e `pnpm stills` não têm procedimento próprio; os comandos estão no `AGENTS.md`.

## Limites de operação

- O agente não ouve nem assiste ao vídeo. Entregue o caminho e as medidas; pronúncia, entonação, música, ritmo e publicação ficam para o usuário.
- Cada procedimento define sua conclusão. Se faltar entrada, diga qual artefato falta e seu dono; não contorne a dependência.
