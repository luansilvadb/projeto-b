---
name: cenario
description: Define os tipos de fundo do estilo, quando usar cada um e como construir profundidade e luz em camadas.
---

## PERGUNTA
Como construir o fundo e a profundidade?

## RESPOSTA

**O que a referência faz.** O fundo é liso em 61% do tempo, cenário construído em 33% e padrão em 5%. Nenhum dos três é vazio: a área do quadro com desenho é de 48% nos planos de fundo liso, 72% nos de cenário e 81% nos de padrão. No vídeo inteiro, fica entre 40% e 68%.

**Três tipos de fundo:**

| Tipo | Serve para | Construção |
|---|---|---|
| Liso | explicar: dado, esquema, personagem isolado, piada rápida | degradê e um apoio |
| Cenário | situar: abertura de bloco, lugar citado na fala, vida do protagonista | três a cinco camadas |
| Padrão | dizer "muitos": células, leitos, multidão | o mesmo elemento repetido enchendo o quadro |

**Fundo liso nunca é uma cor só.** É um degradê de duas ou três paradas com pelo menos um apoio: vinheta nos cantos, manchas grandes e suaves do mesmo matiz, um chão sugerido por uma faixa mais escura, partículas discretas ou raios saindo do centro para dar ênfase. O assunto recebe sombra de contato no mundo e halo por dentro.

**Cenário em camadas**, do fundo para a frente:

1. **Céu ou fundo**: degradê, com a fonte de luz marcada por um brilho.
2. **Distância**: silhuetas grandes e simples, perto da cor do fundo, com pouca saturação e pouco contraste.
3. **Plano médio**: onde está o assunto. Contraste e saturação plenos.
4. **Chão**: dois ou três tons, com ondulação e sombras de contato.
5. **Moldura de primeiro plano**: formas escuras e desfocadas, cortadas pela borda do quadro, em um ou dois cantos.

**Profundidade.** Cada camada se separa das outras por mais de um destes sinais:

- **sobreposição**: o que está na frente cobre parte do que está atrás;
- **tamanho**: o mesmo objeto, menor com a distância;
- **valor e saturação**: quanto mais longe, mais perto da cor do fundo;
- **nitidez**: o assunto é nítido; a moldura e a distância, desfocadas;
- **detalhe**: só o plano médio tem padrão e textura.

**Luz.** Uma fonte por cenário, de posição definida. Dela saem o brilho no céu, feixes diagonais translúcidos, a borda de luz nos objetos do lado dela e a direção de todas as sombras.

**Objetos de ambiente.** De três a sete coisas dizem onde se está (uma janela, uma planta, uma placa), em dois ou três tons e com menos contraste que o assunto.

**Projeção.** Uma por cenário: frontal ou de perfil na maior parte; isométrica para "mundo de esquema", com os objetos pousados num piso; vista de cima e de baixo para cima como variação.

**Padrão.** O elemento se repete com variação pequena de tamanho, giro e tom, e um deles é diferente: é o foco.

**Custo.** Desfoque pesa no render. Use cor e degradê para suavizar; guarde o desfoque para a moldura e a distância, em camadas que não mudam de quadro para quadro.

**Reuso.** Cenário que volta é uma peça só, com parâmetros para a hora do dia e o modo de cor.

**Procedimento:**

1. Leia nos planos qual tipo de fundo cada um pede: situar pede cenário, explicar pede liso, "muitos" pede padrão.
2. Para o cenário, defina a fonte de luz e monte as camadas na ordem.
3. Confira a profundidade: cada camada se separa da vizinha por dois sinais ou mais.
4. Para o fundo liso, escolha o degradê do modo e um apoio.
5. Renderize o fundo sozinho e depois com o assunto. O assunto continua sendo a coisa de maior contraste?
6. Se menos de 40% do quadro tem desenho, aumente o assunto antes de enfeitar o fundo.

## DEPENDÊNCIAS
- cor: fornece o degradê e as cores de cada modo.
- forma: fornece o método de construção dos objetos de ambiente.

## LIMITES
- Tamanho e posição do assunto pertencem a `composicao`.
- O movimento de câmera entre as camadas não é decidido aqui; as camadas só precisam estar separadas para permiti-lo.
- Nenhum cenário da referência é reproduzido.

## EXEMPLO
> Lagoa rasa, de dia, para a abertura.
> Céu: degradê de água, de ciano claro em cima a azul médio embaixo, com o brilho do sol no alto. Distância: recife em silhuetas claras e desfocadas; raízes de mangue descendo pelas laterais. Plano médio: a água-viva e o peixe. Chão: areia em três tons, ondulações e pedras, sombra de contato sob o sino. Moldura: capim-marinho escuro e desfocado nos cantos de baixo. Luz: feixes diagonais vindos do alto, à esquerda; borda clara no lado esquerdo do sino.
