## PERGUNTA
Como a imagem faz a graça do vídeo sem palavra, colada à frase ou num número só dela?

## RESPOSTA

**Princípio.** O humor do canal mora na imagem (decisão do usuário em 2026-10-09): a narração segue séria, e quem faz a graça é quem está em cena, com o corpo, como no cinema mudo. A graça nasce do que a figura percebe, quer e tenta, e nunca de um enfeite posto ao lado da explicação. O teste: sem o som, dá para dizer a que ela reagiu, ou o que ela queria e onde deu errado?

**Alcance.** Três decisões desta unidade são do canal e valem no modo `canal`: o humor morar na imagem com a narração séria (o princípio acima), "Por dentro primeiro" e "Ninguém fala". No modo `jam` são repertório, e não regra (`SKILL.md`, "Modos"): se o curta tem graça, onde ela mora e se alguém fala na imagem saem do briefing e da frase de intenção, e as três só entram como estão aqui quando o usuário manda trazê-las. O resto é ofício e vale nos dois modos, para a graça e para qualquer ação sem fala: as duas formas, o que precisa funcionar, quem decide e como um número se arma; onde o texto diz "explicação", leia no curta o que a cena conta. A narração em off continua obrigatória no `jam` (`diretor-de-pauta/briefing.md`): o número mudo é uma pausa dela, contada como em `sincronia`, e não um trecho de filme sem narração.

**Duas formas:**

- **Reação.** Quem está em cena responde, com o corpo, ao que acabou de acontecer ou ao que a oração afirmou. É a base do vídeo inteiro: colada à frase, no máximo uma por oração. Depois da frase forte a fala espera por ela: é o **respiro**, de 1 a 1,5 s no plano em que a reação nasceu.
- **Número mudo.** A fala para e a imagem carrega a cena sozinha, de 5 a 8 s, com a música à frente. É um plano só, que evolui.

O tempo das duas é do roteiro: como ele se conta e a quem se pede está em `sincronia`.

**O que precisa funcionar:**

- **A graça serve à explicação.** A reação mostra o que a frase quer dizer para quem a vive. O número encena o que a narração acabou de afirmar ou está para afirmar, e quando ele termina quem assiste entendeu o que a nota visual do roteiro pede. Teste de remoção: se o número sai e a explicação não perde um passo, é enfeite.
- **Por dentro primeiro** (do canal: decisão do usuário em 2026-10-09). Quando o trecho explica um mecanismo, o número acontece dentro dele: a trupe encena as partes (`elenco`), o intento delas é o raciocínio que quem assiste faria, e o ponto em que ele se frustra é a explicação. Quando o trecho só conta um caso, vale a cena de fora. Vale no modo `canal`; no modo `jam` é repertório, e não regra: o número acontece onde a história está.
- **O raciocínio se vê em ação.** O que a figura pensa aparece no que ela faz e nos objetos que usa (a conta que acende, a alavanca que cede). Raciocínio escrito na tela é slide (`encenacao`).
- **A quebra é verdadeira.** O que frustra o intento é o mecanismo ou o fato que a pesquisa sustenta: a cena não inventa causa, e a figura não ganha mais intenção do que a base de fatos permite (`encenacao`, `elenco`). No curta de ficção, a verdade da quebra é a da história: o que frustra o intento sai das regras que o roteiro e a frase de intenção puseram, e a pesquisa só é cobrada do que o filme afirma como verdade sobre o mundo real (`encenacao`, "A base, no curta de ficção").
- **Uma ideia por número**: um intento e uma quebra.
- **O alvo e o peso são os de `humor`**: ri-se da situação e do mecanismo, nunca de quem sofre, e o trecho grave pode não ter graça nenhuma.

**Ninguém fala** (do canal: decisão do usuário em 2026-10-09). Vale no modo `canal`; no modo `jam` é repertório, e não regra: se alguém fala na imagem, e como, é do filme (`texto`), sem que isso crie outra voz gravada além da narração. No canal, os personagens não conversam. Quando um trecho isolado precisa mostrar que alguém fala, ele fala uma língua própria: o balão sem palavras de `texto`, com a voz inventada que a skill `diretor-de-som` dá a ele. É raro, e nada de que o vídeo depende passa por ali.

**Quem decide.** A reação é do agente. O número mudo é do usuário, e vai a ele na lista de `entrevista-movimento`.

**Como um número se arma.** É a estrutura do trecho de prova de 2026-10-09, que o usuário aceitou de primeira quando a atuação foi refeita por ela:

1. **O intento.** Vê-se o que a figura quer, pela pose, antes de qualquer coisa dar errado. A frase anterior pode apresentá-lo.
2. **A tentativa escala.** Ela insiste, cada vez com mais corpo. Três vezes costumam bastar, e a última é a que quebra.
3. **A quebra.** O mecanismo vence, com a causa à vista.
4. **A reação.** Ela entende, e a pose fica antes de a fala voltar.

Custo observado nos 12,5 s do trecho (a fala e o número): cerca de 1 h de quadro-chave do mundo, 20 min de poses com a atriz já desenhada e 1 h 10 de animação. É o que dimensiona a lista.

## DEPENDÊNCIAS
- acao: fornece o que faz uma ação e uma reação se lerem no corpo.
- sincronia: fornece a causa de cada mudança, e como o tempo do respiro e do número se conta e se pede.
- humor (skill `diretor-criativo`, `escrita/humor`): fornece o valor, a verdade, o alvo e o peso que toda graça respeita, e o que o texto faz por ela.

## REFERÊNCIAS
- elenco: consulte para saber quem da trupe encena as partes de um mecanismo.
- texto: consulte quando o número pedir um balão.

## LIMITES
- Como a pose se desenha é de `personagem`; como as poses se sucedem, de `acao`.
- O som do número (a música à frente, os acentos, a voz inventada) é da skill `diretor-de-som`: a cena não toca som.

## EXEMPLO
> NARRAÇÃO: "Só que o corpo cobra o sono que faltou, como quem cobra uma dívida."
> Por dentro: a Vigília segura a alavanca que mantém aberta a janela do olho. Cada gota que cai no reservatório é mais um tempo acordado, e dá um tranco na alavanca; o Contador anota cada um. Ela finca o pé e mete o ombro a cada tranco; na quarta gota o reservatório transborda e a alavanca vence: a janela fecha, ela cai sentada, olha a alavanca e adormece encostada. O intento dela se frustra onde a explicação mora: a pressão do sono se acumula.
> Enfeite: ela escorrega numa poça ao lado do reservatório. Tem graça, e sai sem a explicação perder nada.
