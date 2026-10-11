## PERGUNTA
O que entra no pacote de submissão de um curta a um evento ou jam, e de onde vem cada item?

## RESPOSTA

**O evento manda, e só o que ele disse.** A fonte das regras é o campo "Regras do evento" do briefing (`diretor-de-pauta/briefing.md`): o que o usuário colou ou o link que ele deu, com a data. Regulamento, prazo, campo de formulário, licença aceita e permissão nunca são deduzidos, nem trazidos de outro evento ou da memória. Com link fornecido, abra a página vigente e transcreva; sem regra fornecida, o item fica "não fornecido" no pacote e vira uma pergunta ao usuário, com o que depende dela.

**Cedo, o que pode barrar o filme.** Antes de a voz ser gerada, leia as regras fornecidas atrás de três coisas e diga o que achou à `diretor-producao` (`etapas/plano.md`, na pasta dela) e ao usuário: o que dizem de IA e de material gerado; que licenças e que autoria exigem; e a especificação do arquivo, com a duração máxima. O que as regras não dizem é dito como silêncio delas, e não como permissão.

**O pacote**, na seção `## Jam` de `publication.md`. Só entram os itens que o evento pede ou que o usuário quer; a ordem é a do formulário, quando ele foi fornecido.

| Item | De onde vem | O que precisa valer |
|---|---|---|
| Título | o título do filme, decidido com o usuário | é o mesmo em todo destino, salvo decisão dele |
| Sinopse | a frase de intenção e a história em `script.md` e `script.json` | diz quem, onde e o que está em jogo, sem contar o fim; no tamanho que o evento pede, ou curta, se ele não diz; não promete o que o filme não mostra |
| Relação com o tema | a linha "Tema" de `pauta.md` | uma ou duas frases, quando o evento pede a justificativa |
| Ficha técnica | o usuário e o que foi usado | duração medida no arquivo, idioma, formato, data |
| Créditos | o usuário, para pessoas e funções; o inventário, para ferramentas e sons | nomes e funções como o usuário os deu; nenhum crédito é inventado, e ferramenta não vira pessoa |
| Direitos e licenças | o inventário, abaixo | cada elemento com origem e licença, ou "a conferir" |
| Declarações | as regras fornecidas | só as que o evento pede (autoria, IA, material de terceiros), respondidas com o que o inventário mostra |
| Imagem | o `diretor-de-arte` (`quadro/cartaz`, na pasta dele) | o cartaz ou a thumbnail no formato pedido, com o caminho do arquivo |
| Arquivo | a `diretor-producao` | o caminho do arquivo de entrega e as medidas contra a especificação fornecida |
| Checklist de envio | as regras fornecidas | separa o que está conferido do que a pessoa decide ou preenche no formulário |

**Inventário de direitos.** Uma linha por elemento que está no filme, tirada dos artefatos, e não de memória:

| Elemento | Onde conferir |
|---|---|
| Voz | a narração é gerada com voz clonada pelo OmniVoice, de pesos de uso não comercial (CC-BY-NC), a partir da amostra em `voice/`; de quem é a voz da amostra, o usuário diz |
| Música | gerada pelo ACE-Step a partir de `music` em `script.json`; a licença de uso da saída é conferida na fonte oficial do modelo, na versão instalada |
| Efeitos | os de `sfx` em `script.json`, pelo catálogo `src/audio/sfx.ts`; o `pnpm sfx` só busca CC0 no Freesound, e o id de cada arquivo permite conferir |
| Imagem | desenhada em código para o projeto; fonte tipográfica e qualquer imagem de fora têm licença própria, a conferir |
| Texto | escrito para o filme; citação, personagem, marca ou pessoa real que o `diretor-criativo` apontou |

Cada linha termina num de três estados: **conferido**, com a fonte; **a conferir**, com quem confere; **em conflito** com uma regra fornecida. O conflito é bloqueante (`diretor-producao/equipe/protocolo.md`): vai ao usuário na hora, com o elemento, a regra e as saídas (trocar o elemento, pedir esclarecimento ao evento, desistir do destino). Esta skill não declara que um uso é permitido: mostra a licença, a regra e onde as duas se encontram.

**Dois destinos.** O que é comum (título, sinopse, créditos, inventário) é escrito uma vez e usado nos dois; o que é de um destino só fica na seção dele. A descrição do YouTube pode abrir pela sinopse e levar os créditos; ela ganha os campos do Studio, e o evento, as declarações. Uma regra do evento sobre publicação anterior ou exclusividade, se fornecida, decide a ordem dos envios, e vai dita ao usuário; se não foi fornecida, isso é perguntado antes de ele publicar no YouTube.

**A pessoa envia.** O pacote termina no texto pronto para copiar e nos caminhos dos arquivos. Preencher o formulário, aceitar termos e enviar são do usuário.

Pronto quando cada item que o evento pede está no pacote ou marcado "não fornecido", o inventário não tem linha em conflito sem decisão do usuário, e a checklist diz o que só ele pode conferir no envio.

## DEPENDÊNCIAS
- `diretor-de-pauta/briefing.md`: fornece o destino e as regras do evento, com a fonte.

## LIMITES
- Não é parecer jurídico: o inventário organiza o que há para o usuário decidir.
- Não escreve regulamento que não foi fornecido, não estima prazo e não preenche campo por suposição.
- A sinopse não muda a história nem a intenção: o que ela não consegue dizer com verdade volta ao `diretor-criativo`.
