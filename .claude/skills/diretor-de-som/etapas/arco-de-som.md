# Arco de som de um vídeo

Acontece dentro da etapa de roteiro, quando a skill `diretor-criativo` a aciona por haver um silêncio ou outra decisão de som que muda o tempo do vídeo e vale resolver antes da voz. O que sai daqui é a seção "Arco" de `src/videos/<vídeo>/sound.md` e os `holdMs` que o som pede ao roteiro. A **primeira aprovação**, pedida lá, não espera o arco: o que não foi escrito aqui é escrito antes da etapa `som`, que parte dele.

É a única etapa em que o som ainda pede um silêncio sem custo: a narração não foi gravada. Depois dela, cada `holdMs` novo desloca todos os quadros seguintes do vídeo.

## O que escrever

Unidades `leito` e `silencio`. Parta de `script.md` (os capítulos, a virada e a frase que responde ao gancho) e do texto de `script.json`. Em `sound.md`, na seção "Arco":

- os timbres de base, o andamento e o tom da trilha;
- quantos leitos, o caráter de cada um numa frase e a cena em que fica a troca;
- o silêncio de música, com a frase que ele cobre;
- os silêncios de fala: a cena, a duração e para quê.

`src/videos/why-we-sleep/sound.md` é o modelo.

Os momentos, os níveis e os efeitos ficam para a etapa `som`: dependem da duração real das cenas e da animação pronta.

## Os `holdMs`

Entregue à skill `diretor-criativo` a lista (cena, milissegundos, motivo). Quem grava o campo em `script.json` é ela. O silêncio que preserva a experiência do vídeo é execução; vai ao usuário o que muda essa experiência, contraria uma duração-alvo registrada ou cria custo relevante (`conducao/entrevista`, na pasta dela).

Pronto quando: `sound.md` tem a seção "Arco" com os quatro itens, todo `holdMs` pedido está em `script.json` ou foi recusado, e o tempo sem música somado fica abaixo de 2,4% da duração estimada.
