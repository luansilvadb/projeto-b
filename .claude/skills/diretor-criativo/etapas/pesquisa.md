# Pesquisa de um vídeo

O que sai daqui é `src/videos/<vídeo>/research.md`: os fatos que o roteiro pode usar, cada um ligado a uma fonte numerada. O diferencial do canal é estar certo, e o usuário julga o roteiro podendo conferir essas fontes, então um fato sem fonte vale menos que nenhum fato.

A pesquisa não é uma fase que fecha. `research.md` nasce pequeno (o foco de partida e poucos fatos com fonte já são um começo) e cresce enquanto o roteiro é escrito. Não existe "pesquisa pronta" nem aprovação da pesquisa: a evidência é usada quando sustenta a próxima afirmação ou decisão (`pesquisa/levantamento`), e quando há suporte para a próxima hipótese o texto já pode ser testado.

## Como trabalhar

1. **Pasta.** Derive o nome do vídeo do tema: inglês, minúsculas e hifens (`sunlight-travel-time`). Pergunte só se o usuário pediu um nome, se já existe uma pasta com ele ou se o nome já circula fora do repositório.
2. **Foco de partida.** O tema, a pergunta inicial e o contexto que o usuário trouxe, o bastante para orientar a busca. É hipótese, e não a tese nem o ângulo do vídeo (`conceito/angulo`): não descarta um fato por não servir a uma conclusão que ainda não foi testada, e a pesquisa pode desmenti-lo.
3. **Perguntas da dúvida atual.** Formule as que a próxima decisão ou afirmação pede, por `levantamento`: de orientação, quando o tema ainda é amplo; de suporte, quando um trecho quer afirmar algo.
4. **Buscar.** A pergunta pequena, você mesmo resolve, por `levantamento`. A que pede várias fontes, artigos ou contraditório vai a um subagente `pesquisador`, com a pergunta, o foco de partida, a afirmação em teste, quando há uma, e o caminho de `research.md`, quando ele já existe. Perguntas independentes ("quanto dorme X?", "quanto dorme Y?") saem na mesma mensagem, em paralelo; a que depende da resposta de outra espera por ela.
5. **Gravar.** Antes de um fato entrar em "Fatos", cobre do relatório, ou de você mesmo: a fonte aberta, com a frase ou o número conferido nela (a página que não abriu é dita na entrada da fonte), e a conta de cada número derivado. O que vier como *não verificado* entra em "Pontos em aberto", nunca em "Fatos". O incerto e o disputado são registrados como tal: o roteiro decide como falar disso; a pesquisa não esconde.
6. **Seguir.** Com suporte para testar um compromisso, o texto é escrito (`etapas/roteiro.md`): a base não precisa cobrir o tema.

O `pesquisador` não escolhe ângulo nem escreve frase, cena ou metáfora: é o que impede a fonte de ser dobrada para caber numa frase bonita. Isso não segura quem dirige: havendo suporte para uma prova, você a escreve, e a prova diz o que pesquisar em seguida.

## Durante o roteiro

O trecho que precisa de um fato fora de `research.md` (o gancho com a água-viva pede "sem cérebro"; um bloco quer dizer que elefantes dormem cerca de duas horas) volta ao problema factual, e não a uma fase de pesquisa: pesquise aquilo, abra a fonte, registre e continue. O fato é registrado antes de virar afirmação.

Quando o vídeo depende de uma premissa de risco (uma causalidade central, um resultado controverso, um estudo isolado), sustente-a com revisões e contraditório antes de expandir o texto, e peça ao `checador` o trecho que se apoia nela. Quando e como ele entra, no trecho e no conjunto, está em `etapas/roteiro.md` ("Instrumentos").

## Formato de research.md

Siga `src/videos/why-we-sleep/research.md`:

```markdown
# Pesquisa: <pergunta ou tema do vídeo>

Foco de partida: <o que orientou a busca; não é a tese do vídeo>

## Fatos

- <afirmação, com números, unidades e recorte>. [1]
  <conta, quando o número é derivado; limite ou grau de consenso, quando pesa>. [1] [2]

## Pontos em aberto

- <lacuna que importa para uma decisão ou afirmação do vídeo: o não confirmado, o divergente, a fonte a localizar>

## Fontes

1. <instituição ou autor>, "<título>". <URL> (consultada em <dd/mm/aaaa>)
```

- O arquivo fica nessas três seções. O rigor vem da evidência, e não de campos: sem situação, nota, etiqueta nem responsável por fato.
- Os números das fontes são referenciados pelo campo `sources` de cada cena do roteiro: depois que o roteiro cita um, não renumere; a fonte nova entra no fim.
- O fato que deixou de ser usado pode ficar. Foco, fontes e contraditório não são copiados para `script.md`, que guarda decisões (`escrita/formato`).

## O que vai ao usuário

A pesquisa não é mostrada para pedir licença de continuar. Ela vai ao usuário quando:

- duas leituras sustentadas fariam vídeos diferentes (o mecanismo mais aceito, ou a disputa entre hipóteses): é decisão de `angulo` e `conducao/entrevista`;
- a evidência derruba uma premissa que ele pediu: explique o que a base mostra e siga dentro do que ela permite, sem oferecer a versão sem suporte como alternativa;
- uma incerteza material pede escolha de posicionamento;
- ele pediu para ver as fontes.

Fonte forte contra fonte fraca não é pergunta: você decide. Fontes confiáveis que divergem podem mudar o vídeo, e aí a decisão é editorial, e não bibliográfica.
