## PERGUNTA
Que ações da imagem ganham som, quantas, e a que volume?

## RESPOSTA

**Princípio.** O efeito é o som de uma **ação** que o espectador está vendo. É ele que cola o som à imagem: a música acompanha o capítulo, o efeito acompanha o gesto.

**O que a referência faz.** Um efeito audível a cada 7 s: 8,4 por minuto (de 4,4 a 12,3), com o pico 13 dB abaixo da voz (de 11,5 a 14,7). Mais de nove em cada dez tocam por cima da fala. Os cortes secos não levam efeito mais do que o acaso (10% contra 7,5%): o som marca o que acontece dentro do plano, não a troca de plano.

**O que deu errado quando não foi assim.** Com a regra "só quando importa", um vídeo de 9 minutos marcou 12 efeitos (1,3 por minuto) e colocou 5. A imagem se mexia em silêncio, e a música ficou sozinha com a tarefa de ligar som e vídeo.

**O que ganha som**, do mais ao menos obrigatório:

| Ação | Exemplo | Nível |
|---|---|---|
| Impacto | o carimbo bate, o bicho desaba, a moeda cai | `forte` ou `normal` |
| Ação de objeto ou de corpo com força | a porta desce, a plataforma é puxada, o disco gira, o jato sai | `normal` |
| Mudança de estado do cenário | a noite varre o quadro, a luz acende, a água sobe | `leve` |
| Entrada grande | uma manada entra, a estante cresce do chão | `leve` |
| Estouro de ênfase com onomatopeia na tela | "SNIP", "PLOFT", "TRIIIM" | `normal` |
| Gesto pequeno que a fala nomeia | o visto se desenha, a etiqueta carimba, o olho abre | `leve` |

**O que não ganha som:** texto que entra na tela, câmera que se move, pausa viva (respirar, piscar, capim), e qualquer coisa que não esteja na partitura da animação.

**Dose.** Mire de 4 a 8 por minuto. Num plano de 5 s, no máximo dois. Num trecho de silêncio de música ou de nível `recuo` por um fato pesado, nenhum: o trecho é quieto por inteiro.

**Os níveis.** Quantos dB o pico do efeito fica abaixo da voz (`SFX_LEVELS`, em `src/audio/sfx.ts`): `forte` 9, normal 13, `leve` 17. O normal é o da referência; `forte` é para o impacto que a cena inteira prepara, uma ou duas vezes por vídeo.

**O instante.** O efeito toca na ação, não na palavra: use a mesma deixa que a partitura dá ao movimento e desloque pelo tempo que a ação leva para acontecer (a moeda cai 1 s depois de ser jogada). Som adiantado em relação à imagem parece erro; atrasado em até dois quadros passa.

**Procedimento:**

1. Percorra a partitura plano a plano e marque toda ação das cinco primeiras linhas da tabela.
2. Dê a cada uma o uso (o som, pelo que acontece: "porta de enrolar desce") e o nível.
3. Conte por minuto, capítulo a capítulo. Abaixo de 4, volte à partitura e marque os gestos pequenos; acima de 12, corte os de nível `leve` que caem em cima de outro.
4. Tire os que caem em trecho quieto.
5. Liste os usos que o catálogo ainda não tem (`escolha`).

## DEPENDÊNCIAS
- diretor-de-arte/tempo/sincronia: fornece a partitura, com a deixa e a duração de cada ação.
- silencio, niveis: fornecem os trechos quietos.

## LIMITES
- Nenhum efeito sem ação na partitura. Se a imagem não tem o que soar, o pedido volta à skill `diretor-de-arte`.
- Nenhum som cômico (mola, buzina, assobio de queda) fora de um momento que o roteiro escreveu como humor.

## EXEMPLO
> `awake-record`, plano 4: a moeda sobe girando e cai (0,9 s). Efeito `coinDrop`, normal, 1 s depois do começo do plano.
> `skip-a-night`, plano 2: o dia varre da direita. Efeito `whoosh`, `leve`, no começo do plano.
> `rats-result`: nenhum; o plano fica quieto.
