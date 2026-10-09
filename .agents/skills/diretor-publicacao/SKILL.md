---
name: diretor-publicacao
description: "Pacote de publicação no YouTube: título público, descrição, tags, capítulos, prompt de thumbnail e campos de envio. Use para criar ou revisar esses materiais."
---

## Papel e entrega

Dono de `src/videos/<vídeo>/publication.md`: o pacote que a pessoa usa para publicar o vídeo no YouTube. Inclui título, descrição, tags do Studio, conceito e prompt de thumbnail, capítulos com tempos reais e uma checklist curta de envio. A pessoa faz o upload.

Leia `embalagem/titulo-e-thumbnail.md` ao criar ou revisar o par título-thumbnail.

## Entradas

- `script.md`: promessa, idioma, capítulos internos e simplificações atuais.
- `script.json`: fala atual e fontes citadas por cena. `title` é só o título interno do roteiro; o título público vive em `publication.md`.
- `research.md`: fontes e limites das afirmações.
- `art.md`: direção visual atual para escrever o prompt da thumbnail.
- `public/videos/<vídeo>/narration.json`: horários de cena para capítulos, somente se o manifesto corresponder ao `script.json` atual.

O pacote pode ser escrito quando roteiro e pesquisa estão atuais, sem esperar o render. Sem narração cronometrada atual, deixe os capítulos fora e diga que faltam os tempos; não estime.

## Procedimento

Em pedido localizado, execute e valide só o campo solicitado, preserve os demais e leia apenas as entradas que o sustentam. Título e thumbnail são avaliados como par; se a mudança num revelar problema no outro, relate o conflito sem alterar o campo não pedido. Percorra todas as etapas abaixo apenas para pacote completo.

1. Leia os artefatos atuais. Se a promessa ou uma afirmação necessária estiver desatualizada, devolva a mudança à skill dona antes de embalar.
2. Escolha o título e o conceito da thumbnail como um par honesto que vende a promessa existente. Se a escolha exigir outra promessa, devolva ao `diretor-criativo`; não altere `script.md` nem `script.json`.
3. Monte um único bloco copiável de descrição: abertura curta sustentada pelo roteiro, capítulos, fontes citadas por cenas, simplificações pertinentes, limites de pesquisa tocados pelo vídeo e créditos atuais. Preserve autores, títulos e URLs de `research.md`.
4. Use os tempos reais da narração para capítulos e confira as regras vigentes do YouTube. Prefira poucas tags específicas ou variantes de escrita úteis; não encha a descrição de palavras-chave.
5. Escreva um prompt de thumbnail em linguagem simples e sem amarrar a um modelo. Use o conceito escolhido para o pacote, o estilo atual de `art.md` e, para vídeo longo, a proporção 16:9 com saída recomendada de 3840 × 2160 px. Entregue o prompt, não gere nem arquive o PNG.
6. Confira limites atuais do título e da descrição, links, capítulos, afirmações do par e os campos de envio. Para uso de IA, avalie o vídeo e os materiais reais contra a política atual; não recomende divulgação só porque uma ferramenta de IA foi usada. Consulte as fontes oficiais abaixo para regras e limites sujeitos a mudança.

Pedido localizado pronto quando: o campo solicitado foi corrigido e validado, sem alterar os demais. Pacote completo pronto quando: `publication.md` tem o título, o conceito e o prompt da thumbnail, a descrição pronta para copiar, tags e capítulos válidos, as fontes da descrição correspondentes às cenas e uma checklist que separa recomendação fundamentada do que a pessoa precisa decidir no Studio.

## Limites

- Não escreve roteiro nem pesquisa: isso pertence ao `diretor-criativo`.
- Não altera `script.json.title`; ele continua sendo o título interno.
- Não produz a imagem final, não publica, não agenda e não acessa a conta do usuário.
- Não inclui redes sociais, calendário, analytics nem estratégia de canal.

## YouTube oficial

Confira o conteúdo vigente antes de orientar campos, limites ou divulgações:

- [Enviar vídeos e preencher os detalhes](https://support.google.com/youtube/answer/57407?hl=pt-BR)
- [Miniaturas personalizadas](https://support.google.com/youtube/answer/72431?hl=pt-BR)
- [Capítulos de vídeo](https://support.google.com/youtube/answer/9884579?hl=pt-BR)
- [Tags de vídeo](https://support.google.com/youtube/answer/146402?hl=pt-BR)
- [Divulgação de conteúdo gerado ou alterado por IA](https://support.google.com/youtube/answer/14328491?hl=pt-BR)
