---
name: diretor-publicacao
description: "Pacote de saída de um vídeo ou curta, em publication.md, pelo destino do briefing (youtube, jam ou jam e youtube). No youtube: título público, descrição, tags, capítulos, conceito e prompt da thumbnail, checklist do Studio. No jam: sinopse, créditos, direitos e licenças, declarações e envio conforme as regras que o evento forneceu. Decide a promessa e o conceito da imagem; a imagem em si é do diretor-de-arte. Use para criar ou revisar publication.md, ou o título, a thumbnail, a descrição, os capítulos ou a submissão de um vídeo ou curta."
---

## Papel e entrega

Dono de `src/videos/<vídeo>/publication.md`: o pacote que a pessoa usa para levar o vídeo ao destino. Escreve, organiza e entrega o texto e os caminhos dos arquivos; a pessoa faz o upload e o envio.

O destino vem do campo "Destino" do briefing (`diretor-de-pauta/briefing.md`). Sem briefing, é o YouTube, e nada muda para os vídeos do canal.

O destino é o campo "Destino" do briefing, com um destes valores canônicos: `youtube`, `jam` ou `jam e youtube`. Ao ler um briefing antigo, "evento" vale como `jam` e "os dois" como `jam e youtube`; ao escrever, use o canônico.

| Destino | Pacote | Leia |
|---|---|---|
| `youtube` | título, descrição, tags do Studio, conceito e prompt de thumbnail, capítulos com tempos reais e uma checklist curta de envio | "Procedimento do YouTube", abaixo, e `embalagem/titulo-e-thumbnail.md` para o par título-thumbnail |
| `jam` | título, sinopse, relação com o tema, ficha técnica, créditos, direitos e licenças, declarações e checklist, conforme as regras que o evento forneceu | `submissao/pacote-de-evento.md` |
| `jam e youtube` | `## Comum`, escrita uma vez, mais as seções `## YouTube` e `## Jam` de `publication.md` | os dois caminhos; "Dois destinos", em `submissao/pacote-de-evento.md` |

**Organização de `publication.md`.** `## Comum` (título do filme, sinopse, créditos e inventário de direitos, escritos uma vez) é a seção compartilhada; as de destino vêm depois, nesta ordem, e só as que o destino pede: `## YouTube` (título público, conceito e prompt da thumbnail, descrição pronta para copiar, tags, capítulos e checklist do Studio) e `## Jam` (relação com o tema, ficha técnica, declarações e os itens do evento, na ordem do formulário quando foi fornecido, e a checklist de envio). Não há campo novo no `script.json`: `title` continua sendo o título interno. Pacotes já feitos (`why-we-sleep`, `earth-stops-spinning`) mantêm os títulos de seção que têm; um pedido pontual muda só o campo pedido, e o arquivo só se reorganiza com pedido.

**Quem decide a imagem.** Esta skill decide o que a imagem afirma: o conceito, o texto exato e a expectativa que ela cria junto do título. O `diretor-de-arte` executa a imagem (`quadro/cartaz`, na pasta dele) no desenho do filme e devolve o PNG. Se a arte acha uma imagem mais forte e verdadeira, propõe a mudança aqui, e o conceito é atualizado; a arte não muda sozinha o que a imagem afirma.

## Entradas

- `pauta.md`, quando existe: o termo buscado, que o título procura carregar sem deixar de passar no teste do vídeo imaginado; e o briefing, com o destino e as regras do evento.
- `script.md`: promessa ou frase de intenção, idioma, capítulos internos e simplificações atuais.
- `script.json`: fala atual e fontes citadas por cena. `title` é só o título interno do roteiro; o título público vive em `publication.md`.
- `research.md`, quando existe: fontes e limites das afirmações.
- `art.md`: direção visual atual para escrever o conceito e o prompt da imagem.
- `public/videos/<vídeo>/narration.json`: horários de cena para capítulos, somente se o manifesto corresponder ao `script.json` atual.
- O arquivo de entrega e as medidas dele, da `diretor-producao`, para a ficha técnica e a checklist.

O pacote pode ser escrito quando roteiro e pesquisa estão atuais, sem esperar o render. Sem narração cronometrada atual, deixe os capítulos fora e diga que faltam os tempos; não estime. O que depende do arquivo final (duração medida, especificação conferida) entra quando ele existe.

## Procedimento do YouTube

Em pedido localizado, execute e valide só o campo solicitado, preserve os demais e leia apenas as entradas que o sustentam. Título e thumbnail são avaliados como par; se a mudança num revelar problema no outro, relate o conflito sem alterar o campo não pedido. Percorra todas as etapas abaixo apenas para pacote completo.

1. Leia os artefatos atuais. Se a promessa ou uma afirmação necessária estiver desatualizada, devolva a mudança à skill dona antes de embalar.
2. Escolha o título e o conceito da thumbnail como um par honesto que vende a promessa existente. Se a escolha exigir outra promessa, devolva ao `diretor-criativo`; não altere `script.md` nem `script.json`.
3. Monte um único bloco copiável de descrição: abertura curta sustentada pelo roteiro, capítulos, fontes citadas por cenas, simplificações pertinentes, limites de pesquisa tocados pelo vídeo e créditos atuais. Preserve autores, títulos e URLs de `research.md`.
4. Use os tempos reais da narração para capítulos e confira as regras vigentes do YouTube. Prefira poucas tags específicas ou variantes de escrita úteis; não encha a descrição de palavras-chave.
5. Escreva um prompt de thumbnail em linguagem simples e sem amarrar a um modelo. Use o conceito escolhido para o pacote, o estilo atual de `art.md` e, para vídeo longo, a proporção 16:9 com saída recomendada de 3840 × 2160 px. O conceito e o prompt ficam no pacote; a imagem é feita pelo `diretor-de-arte`, que devolve o caminho do PNG, ou gerada pelo usuário a partir do prompt. Esta skill não gera nem arquiva o PNG.
6. Confira limites atuais do título e da descrição, links, capítulos, afirmações do par e os campos de envio. Para uso de IA, avalie o vídeo e os materiais reais contra a política atual; não recomende divulgação só porque uma ferramenta de IA foi usada. Consulte as fontes oficiais abaixo para regras e limites sujeitos a mudança.

No curta do modo `jam` que também vai ao YouTube: a descrição abre pela sinopse e leva os créditos do pacote do evento; capítulos e fontes só entram se o filme os tem; sem termo buscado em `pauta.md`, o título é o do filme, julgado pelo mesmo teste do vídeo imaginado.

Pedido localizado pronto quando: o campo solicitado foi corrigido e validado, sem alterar os demais. Pacote completo pronto quando: `publication.md` tem o título, o conceito e o prompt da thumbnail, a descrição pronta para copiar, tags e capítulos válidos, as fontes da descrição correspondentes às cenas e uma checklist que separa recomendação fundamentada do que a pessoa precisa decidir no Studio.

## Transição e qualidade

O protocolo comum da equipe (frase de intenção, donos, handoff, gravidade e rodadas) está em `diretor-producao/equipe/protocolo.md`.

- **Recebe**: o briefing e o termo buscado, do `diretor-de-pauta`; a promessa ou a intenção, as fontes e as simplificações, do `diretor-criativo`; a direção visual e o PNG do cartaz ou da thumbnail, do `diretor-de-arte`; o arquivo de entrega e as medidas, da `diretor-producao`.
- **Passa adiante**: o conceito e o texto da imagem ao `diretor-de-arte`; à `diretor-producao`, cedo, o que as regras do destino exigem do arquivo e das licenças; ao usuário, o pacote pronto para copiar e a checklist. Cada passagem diz o que está conferido, o que é "não fornecido" e o que só ele decide.
- **Confere antes de passar**: cada afirmação do pacote contra o roteiro e a pesquisa; cada regra citada contra a fonte vigente ou fornecida; o par título-thumbnail pelos testes de `embalagem/titulo-e-thumbnail.md`; o inventário de direitos sem linha em conflito sem decisão.
- **Com prazo no briefing**: o pacote é escrito em paralelo, assim que o roteiro existe, e fechado quando o arquivo de entrega é medido. O que as regras exigem é bloqueante e não cede ao prazo; o acabamento do texto, sim (`diretor-producao/etapas/plano.md`).
- **Passagem pontual**: uma mudança de um campo (o título, uma tag, a sinopse depois de um corte) vai com o campo, o motivo e as seções que ele afeta; o outro destino não é reescrito sem pedido. Uma regra do evento que chega depois entra no briefing com a data e é dita à `diretor-producao` e ao usuário.
- **Informação ausente**: o item fica "não fornecido" no pacote e a pergunta vai ao usuário com o que depende dela. O resto do pacote segue.

## Limites

- Não escreve roteiro nem pesquisa: isso pertence ao `diretor-criativo`.
- Não altera `script.json.title`; ele continua sendo o título interno.
- Não produz a imagem final, não publica, não envia, não agenda e não acessa a conta do usuário.
- Não inventa regulamento, prazo, licença nem permissão de evento ou de plataforma: transcreve a fonte, ou diz que ela não foi fornecida.
- Não inclui redes sociais, calendário, analytics nem estratégia de canal.

## YouTube oficial

Confira o conteúdo vigente antes de orientar campos, limites ou divulgações:

- [Enviar vídeos e preencher os detalhes](https://support.google.com/youtube/answer/57407?hl=pt-BR)
- [Miniaturas personalizadas](https://support.google.com/youtube/answer/72431?hl=pt-BR)
- [Capítulos de vídeo](https://support.google.com/youtube/answer/9884579?hl=pt-BR)
- [Tags de vídeo](https://support.google.com/youtube/answer/146402?hl=pt-BR)
- [Divulgação de conteúdo gerado ou alterado por IA](https://support.google.com/youtube/answer/14328491?hl=pt-BR)
