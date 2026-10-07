# Decupagem de um vídeo

Acontece dentro da etapa de roteiro, acionada pela skill `diretor-criativo` com o texto escrito e ainda não aprovado. Aqui se descobre uma direção visual para o vídeo e se deixa o bastante para o animatic começar: a ficha visual, `src/videos/<vídeo>/art.md`, e os planos de cada cena, o campo `shots` de `src/videos/<vídeo>/script.json`.

É a única etapa em que a imagem ainda pode pedir outra frase sem custo: a narração não foi gravada. Mexer nos planos nunca regera áudio; mexer numa frase, depois da narração, sim.

A etapa não fecha a direção de arte. Escala de verdade, personagem no cenário, paleta na composição e texto no quadro só se resolvem no animatic: o que se decide aqui é o que cada trecho mostra e os compromissos que o vídeo inteiro precisa respeitar desde já.

## Passo 1: conceito visual

Unidades `entrevista-imagem`, `elenco` e `cor`. Parta de `script.md` (a analogia central e a nota visual de cada bloco) e de `research.md` (como as coisas são de verdade).

Elenco, cor, analogia e planos se descobrem juntos, e um corrige o outro: uma encenação pode mostrar que o protagonista não funciona, um personagem pode pedir outro modo de cor, e uma figura pode nem precisar existir. Avance com o bastante para testar, e volte quando a imagem mostrar coisa melhor.

**Prova.** Diante de uma incerteza grande (a personificação funciona? a analogia se entende, ou vira slide? a paleta aguenta personagem e dado?), desenhe a menor imagem que a responde: um quadro, dois ou três planos do trecho em que ela pesa. Sem incerteza desse tamanho, não há prova a fazer. A prova é descartável: fica como estudo (os de `src/studies/` são o modelo) ou em `out/rascunho/`, sem componente novo em `src/components/`, token ou convenção. O que ela provar é construído direito no animatic.

Não se produz variação de personagem, paleta alternativa ou folha de modelo só para haver opção. O que vai ao usuário é o que `entrevista-imagem` define, depois de explorado e no menor artefato que mostra a diferença; as imagens levadas a ele vão para `out/<vídeo>/conceito/`. Havendo uma hipótese plausível, barata de testar e de desfazer, siga por ela em vez de parar para perguntar.

`art.md` guarda o estado atual, com `src/videos/why-we-sleep/art.md` como modelo. Duas autoridades moram nela:

- **Compromisso**: o que o vídeo inteiro precisa manter. Quem conduz e o que ganhou rosto, o que cada modo de cor significa e quando troca, a relação que a analogia central afirma, as simplificações aceitas. Uma decisão tomada com o usuário leva a data e o porquê.
- **Estado da solução**: o tom de cada cor, o desenho ainda não visto no tamanho final, o detalhe do cenário, os figurantes. Evolui no animatic sem nova pergunta.

As alternativas recusadas não ficam na ficha: o histórico é o git.

Pronto quando: `art.md` diz quem conduz o vídeo, o que as cores significam e que forma a analogia central tem, as decisões que eram do usuário foram tomadas por ele, e o que ficou em aberto é dúvida de execução.

## Passo 2: planos

Unidades `encenacao`, `planos` e `dado`. Para cada cena de `script.json`, encene o que a narração afirma e divida a cena em planos. Cada plano de `shots` leva o que a unidade `planos` registra, nos campos que o validador exige:

| Campo | O que é | Valores |
|---|---|---|
| `cue` | a deixa: palavra da narração da cena em que o plano começa | o primeiro plano da cena não leva; os outros, sempre |
| `occurrence` | qual ocorrência da palavra, quando ela se repete na cena | opcional; começa em 1 |
| `staging` | a encenação: quem faz o quê, e onde, mais o texto de tela | texto |
| `scale` | a escala | `wide` (aberto), `medium` (médio), `close`, `detail` (detalhe) |
| `palette` | a paleta do plano | um nome de `art.md` |
| `entry` | a entrada: como a imagem anterior vira esta | texto; o costume é `cut` (corte), `camera` (câmera), `transform` (transformação) ou `wipe` (varredura), e a passagem que não cabe neles é dita em poucas palavras |

A deixa e a encenação são o que o plano precisa dizer. A escala, a paleta e a entrada registram a solução de agora: a escala é a intenção de distância, a paleta é o nome de um modo, e não um valor de cor, e a entrada é a relação com o plano anterior. No animatic, o médio que vira close dizendo a mesma coisa é refino (`entrevista-imagem`), e o campo acompanha.

Quando a encenação pede outra frase, o pedido volta ao `diretor-criativo`, com a oração, o que a imagem não consegue mostrar e a frase que resolveria. Isso se pede diante de um problema que apareceu, não por prevenção.

Pronto quando: toda cena tem `shots`, cada trecho tem uma encenação concreta que dá para construir, todo plano depois do primeiro tem `cue`, e cada `palette` existe em `art.md`.

## Passo 3: conferir

```bash
pnpm check-script <vídeo>
```

Ele recusa plano sem deixa ou com deixa que não está na narração, e isso é erro. Também estima a duração de cada plano e marca os longos, e isso é sinal: a marca diz onde olhar (`planos`), e o plano em que a imagem muda lá dentro segue como está.

Depois leia só a coluna da encenação, de cima a baixo e sem a narração: a história visual acompanha a explicação? Aprofunde, pelas lentes de encenação e de decupagem de `critica-quadro`, onde a imagem depende de etiqueta, uma relação não se vê, vários planos fazem a mesma coisa, uma virada da fala não tem resposta na tela ou o comando deixou uma marca. A lente de fidelidade entra onde a encenação pode afirmar um fato. Aqui não há subagente, nem crítica de composição ou de desenho: ainda não existe imagem para abrir.

Pronto quando: o comando não acusa erro, e não segue adiante nenhuma encenação que já se sabe que não diz o que a oração afirma.

## Entrega

Devolva ao `diretor-criativo`:

- os planos de cada cena e o tempo médio por plano que o comando imprime;
- os compromissos visuais assumidos, e as provas que sustentam uma direção;
- as frases que a imagem pediu para mudar;
- o que ainda é decisão do usuário, e as hipóteses que o animatic vai testar.

Quem mostra o roteiro ao usuário e registra a **primeira aprovação** é ele. Ela fecha o que o texto e a imagem querem dizer e os compromissos visuais que já importam; a execução continua evoluindo. Se o animatic mostrar que um personagem, uma cor ou um plano não funciona, ele é revisto ali: o que só refina fica com o agente, e o que muda sentido ou identidade vai ao usuário (`entrevista-imagem`).
