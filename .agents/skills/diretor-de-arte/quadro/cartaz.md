## PERGUNTA
Como a imagem do cartaz ou da thumbnail é feita, a partir do conceito que a publicação fixou?

## RESPOSTA

**Dois donos, uma imagem.** O `diretor-publicacao` decide o que a imagem afirma: o conceito, o texto exato e a expectativa que ela cria junto do título (`diretor-publicacao/embalagem/titulo-e-thumbnail.md`). A arte faz a imagem e responde por ela ser do mesmo filme: elenco, forma e cor de `art.md`. A arte não muda o que a imagem afirma; quando acha uma imagem mais forte e verdadeira, propõe ao `diretor-publicacao`, que atualiza o conceito.

**Entradas.** O conceito atual em `publication.md`; `art.md`; e a especificação do destino: para o YouTube, a que o `diretor-publicacao` confere nas regras vigentes; para um evento, a que o briefing transcreve (`diretor-de-pauta/briefing.md`). Formato que ninguém forneceu é perguntado, e não suposto. Sem conceito, peça-o: a imagem não nasce antes dele.

**Feita no desenho do filme.** A imagem é uma composição de um quadro só, na pasta `design` do `Root.tsx`, como as outras composições de conferência: usa os desenhos de `src/art/` e de `src/videos/<vídeo>/parts/` e as cores de `palette.ts`, sem cor solta. Ela pode recompor um quadro do filme ou ser uma imagem que o filme não mostra daquele jeito, desde que afirme o que o conceito diz. Renderize com `pnpm exec remotion still <id> out/<vídeo>/conceito/<thumbnail|cartaz>.png`, na escala que o destino pede, e abra o PNG: julga-se a imagem renderizada, nunca o código.

**O que precisa valer.** `composicao` e `texto`, e os testes de `titulo-e-thumbnail` que são de imagem:

- **Pequena escala.** Reduzida ao tamanho em que aparece numa lista, o assunto ainda se reconhece e o texto ainda se lê.
- **Inferência visual.** O que alguém concluiria que acontece ali é o que o filme sustenta.
- **Unidade.** Posta ao lado de um quadro do filme, parece do mesmo filme.
- **Texto exato.** O texto é o do conceito, letra por letra, e não ganha palavra decorativa.

O `critico-de-quadro` entra quando a dúvida não cede à sua leitura ou a imagem vai ao usuário como decisão (`critica-quadro`).

**Com gerador externo.** Se o usuário prefere gerar a imagem fora, o prompt de `publication.md` é o pedido. A arte confere o resultado contra `art.md` e o conceito, pelos mesmos testes, e diz o que destoa do filme. A origem da imagem gerada entra no inventário de direitos do `diretor-publicacao`.

**Com prazo no briefing.** No nível essencial (`diretor-producao/etapas/plano.md`), a saída é um quadro forte do filme, recomposto para o formato, com o texto do conceito. Uma imagem exclusiva só entra com folga.

**Entrega.** O caminho do PNG vai ao `diretor-publicacao`, que o registra no pacote; a cópia do que foi ao ar é do acervo (`diretor-producao/etapas/acervo.md`).

Pronto quando o PNG existe no formato do destino, passa nos quatro testes e o `diretor-publicacao` recebeu o caminho.

## DEPENDÊNCIAS
- `diretor-publicacao/embalagem/titulo-e-thumbnail.md`: fornece o conceito e os testes do par.
- composicao: como o olho acha o assunto.
- texto: que texto entra, e a que se prende.

## LIMITES
- Título, conceito, texto da imagem, prompt e entrega são do `diretor-publicacao`.
- A regra de referência vale aqui: nada de personagem, composição ou paleta reconhecível de outra obra.
