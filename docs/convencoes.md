# Convenções

## Código

- Ao escrever, alterar, revisar ou projetar código (e ao escolher dependências), a regra é a skill `ponytail` no modo `full`, que permanece ativa em toda resposta até o usuário dizer "stop ponytail" ou "normal mode": a solução mais simples que funciona, sem abstração especulativa, reaproveitando o que já existe no repositório, depois a stdlib, o recurso nativo e as dependências já instaladas, nesta ordem. Não vale para pesquisa, roteiro, narração e demais conteúdo dos vídeos, que não são código. A skill é global, em `~/.agents/skills/ponytail/`.
- Nomes de arquivos, código e chaves do roteiro em inglês. Comentários, documentação, conteúdo dos vídeos e skills (com as suas etapas e unidades) em português do Brasil.
- Os comentários do código explicam o porquê (a decisão, o workaround), com densidade alta; siga o padrão dos arquivos vizinhos.
- Nenhuma cena escreve cor solta. As cores de um vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual dele (`art.md`). Tamanhos de texto, formas e curvas de movimento vêm de `src/design/tokens.ts`.
- A direção de arte base do canal é a `abissal`, em `src/design/tokens.ts`. Ela vale para as cenas que ainda não foram redesenhadas.
- O nome da pasta de um vídeo é também o id da composição e o argumento de todos os comandos.

## Roteiro, som e tempo

- A duração de cada cena vem da narração. Cenas não têm durações fixas.
- A cena é a unidade da fala; a da imagem é o plano. Cada cena do roteiro lista os seus planos (`shots`), e cada plano começa numa palavra da narração.
- O som além da voz é dado do roteiro, e nenhuma cena toca som: a trilha, os momentos dela, os níveis e os silêncios ficam em `music`, e os efeitos, em `sfx`. O volume de cada um é uma distância em dB abaixo da voz (`src/audio/ducking.ts` e `src/audio/sfx.ts`), nunca um número ajustado à mão.
- Um efeito usa a palavra `cue`, o começo do plano `shot` ou o começo da cena. Com `at: "end"`, usa o fim do plano indicado ou, sem `shot`, o fim da cena; não combina com `cue`. O `offsetMs` desloca dessa âncora até a ação, inclusive para antes do fim.
- O formato (1920×1080, 30 fps) e a narração em uma voz só valem nos dois modos (`canal` e `jam`).

## Onde ficam as decisões

O que o usuário decidiu fica na pasta do vídeo, no Git, no arquivo do dono:

| Arquivo | Conteúdo |
| ------- | -------- |
| `pauta.md` | o briefing, quando há, e o tema escolhido, o termo buscado e as medições, ou a premissa |
| `script.md` | as decisões do texto, sem narração |
| `publication.md` | o pacote de saída de cada destino |
| `art.md` | a ficha visual |
| `score.md` | a partitura da animação |
| `sound.md` | o arco e o mapa de som |
| `voice.json` | as tomadas de voz escolhidas de ouvido no `pnpm voice`, que valem acima da escolha automática do `pnpm narrate` |

A execução equivalente pode mudar; a decisão material que o usuário já tomou não é alterada em silêncio. Não há registro global de decisões nem de estado de um vídeo.

Os `src/videos/<vídeo>/approvals.md` que existem são histórico legado dos vídeos feitos sob o processo antigo, de aprovações numeradas: ficam como estão, nada os consulta e nenhuma linha nova é escrita neles. Um vídeo novo não tem esse arquivo.

## Fora do Git

`public/videos/` (narração e trilha geradas), `vendor/` (ferramentas clonadas), `voice/` (amostras de voz, dado pessoal), `out/` (a bancada: renders e conferências) e `acervo/` (o que foi publicado ou enviado ao evento). Tudo em `out/` e `public/videos/` pode ser gerado de novo; o mapa de `out/` está no `README.md`.

## Como um ajuste é feito

Vale em toda conversa de produção.

- **No lugar.** Um ajuste edita o arquivo da cena ou do desenho, e o "antes" é o Git. Nada de versão ao lado atrás de uma chave, nem de composição paralela para depois ligar cena a cena: isso só cabe a um desenho que ainda não existe em cena nenhuma. O ajuste é visto com `pnpm scene <vídeo> <id>`, que leva segundos por cena, e o vídeo inteiro sai de `pnpm join`.
- **Um endereço por arquivo.** O que um comando grava em `out/` tem lugar fixo e é sobrescrito. O que não tem lugar (comparação lado a lado, script avulso, teste) vai para `out/rascunho/`, que pode ser apagada inteira a qualquer hora.
- **Linha de parada.** A régua de uma cena é o trecho do mesmo vídeo que o usuário já aceitou (sem ele, o padrão aceito mais recente: o último vídeo publicado, ou o estudo de `src/studies/` que ele aceitou depois), não o canal de referência: a referência ensina método e não reprova cena. Depois de duas recusas do usuário no mesmo ajuste, diga que a linha chegou, explicite o defeito que resta e proponha encerrar na terceira entrega com a ressalva à vista, dita na conversa: o defeito vira lição candidata. Com prazo no briefing, o limite aperta pelo nível do plano (`.agents/skills/diretor-producao/equipe/protocolo.md`, "Rodadas"). Não vale para o que quebra o entendimento (imagem que contradiz a narração, texto ilegível, erro de fato), que é consertado sempre.
- **Retrospectiva.** Quando o usuário aceita algo que antes recusou, a diferença entre a primeira entrega e a aceita é uma lição. Pergunte em uma linha, na língua do produto (o que se vê ou se ouve, nunca o texto da skill), se ela vale para os próximos vídeos. Com o "sim": se a unidade dona do assunto já dizia aquilo, reescreva o trecho que não foi seguido; se não dizia, acrescente a lição marcada como **proposta**. A proposta pode ser usada, e a crítica não reprova por ela; vira regra quando um produto feito por ela é aceito de primeira, e sai quando é recusado. Uma lição por commit, para poder ser desfeita sozinha. O que foi aceito de primeira não gera pergunta.

## Mudanças na documentação

Não há processo de propostas. Uma mudança de comportamento ou de critério atualiza, no mesmo commit, a página de `docs/` ou a unidade da skill que a descreve; o histórico fica no Git.
