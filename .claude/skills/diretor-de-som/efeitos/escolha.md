## PERGUNTA
Que som serve a uma ação, e como ele entra no catálogo?

## RESPOSTA

**Princípio.** O som é escolhido pelo **uso**: o que acontece na imagem, e não o nome do arquivo. O mesmo uso soa igual em todo vídeo do canal, e é isso que faz os efeitos serem uma voz do canal, e não uma colagem.

**O catálogo.** Cada entrada tem o nome do uso (`shutterDown`, e não o id do arquivo), o arquivo e o pico de volume dele, que a mixagem usa para pôr todo efeito à mesma distância da voz. Antes de buscar, confira se um uso do catálogo já serve.

**Um som serve quando:**

- é curto: o corpo do som cabe na duração da ação (uma batida, até 0,5 s; uma porta que desce, até 1,5 s);
- começa no ataque, sem silêncio nem ruído antes;
- é seco: sem a sala, sem eco longo, sem música ou voz ao fundo;
- é do tamanho da coisa desenhada: o vetor é limpo e leve, e um som realista e pesado demais briga com ele;
- não se anuncia como gerado por IA.

**Um som por família.** Varreduras do roteiro, vistos que se desenham, etiquetas que estouram: cada família tem um som só, repetido. Variar o som de uma mesma ação a cada vez soa como acaso.

**Quem ouve.** O agente descarta pelo nome, pela duração e pela nota e leva ao usuário de dois a quatro candidatos por uso, com o link de cada um: só ele ouve qual soa como a ação. É o ouvido que seleciona o arquivo, e não uma aprovação (`entrevista-som`).

**Procedimento:**

1. Para cada uso que falta, escreva a busca em inglês pelo que acontece ("metal shutter rolling down", "small coin drop wood").
2. Liste os candidatos e descarte os que falham nos critérios acima.
3. Leve ao usuário os que sobram, agrupados por uso.
4. Baixe os escolhidos e acrescente-os ao catálogo, com o nome do uso e o pico medido.

Pronto quando: todo uso do mapa tem um som no catálogo, que o usuário ouviu como a ação.

## DEPENDÊNCIAS
- dose: fornece a lista dos usos e o nível de cada um.

## LIMITES
- Só domínio público (CC0): o canal não deve crédito a ninguém por efeito.
- O volume não se ajusta no arquivo nem na cena: o nível vem do mapa e o pico, do catálogo.

## EXEMPLO
> Uso: "o carimbo bate no quadro-negro" (`stamp`). Busca: "rubber stamp hit". Candidatos levados ao usuário: três, de 0,2 a 0,4 s, secos. Descartados: um com 2 s de sala, um com papel sendo folheado antes.
