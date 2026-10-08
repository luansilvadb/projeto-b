# Proposal

## Why

Ao ver o `why-we-sleep` depois da primeira poda do roteiro, o usuário disse o que quer do som: os efeitos sonoros são o que envolve e completa a narração, e precisam "falar com o que está passando", em sincronia com a imagem; a música pode atrapalhar e deve ficar bem baixa. Hoje o vídeo faz o contrário: a música fica a 13 dB da voz e carrega sozinha a ligação entre som e imagem, e há nove efeitos em nove minutos, feitos com quatro sons. O exemplo dele é a água-viva: ela leva três jatos de água para não dormir, e só o primeiro tem som.

Ele também julgou a música de ouvido: o primeiro leito (do começo até `so-far`) é "péssimo", e o segundo (de `but-what` ao fim), gerado na poda, "ficou bom".

## What Changes

- **Efeito por acontecimento, no instante dele.** Cada ação da imagem que tem consequência física ganha um som que começa no quadro em que ela acontece. Ação que se repete, som que se repete: os três jatos da água-viva, e os outros casos que o inventário achar.
- **Inventário das ações** sobre a partitura final (`score.md`), cena a cena: o que acontece, em que instante, que uso de som pede. Substitui a lista de pendentes de `sound.md`, que hoje tem dez ações esperando som.
- **Sons novos no catálogo.** Os usos que faltam (carimbo, jato de água, papel dobrado, despertador, tesoura, queda de corpo, queda em colchão, pouso na areia, caixa pousando, e os que o inventário acrescentar) são buscados com `pnpm sfx` e escolhidos de ouvido pelo usuário, uma vez cada, como o catálogo pede.
- **Música bem baixa.** A trilha passa a ficar, sob a fala, pelo menos 17 dB abaixo da voz no vídeo inteiro, e mais baixa se o ouvido do usuário pedir. A vinheta continua com a música em primeiro plano, e o silêncio de música na resposta de `so-far` continua.
- **O primeiro leito é gerado de novo**, com a identidade do segundo, que o usuário aprovou, e sem os cinco momentos refeitos por cima dele.
- **Conferência de sincronia por imagem**: para cada efeito, o quadro em que ele começa é extraído do render e conferido contra a ação.

Fora do escopo:

- O texto e a narração: são da mudança `poda-dos-ecos-why-we-sleep`. Esta mudança começa depois de a segunda rodada dela estar aceita, porque todo instante de som depende do tempo final da fala e da partitura final.
- Mudar a animação para caber um som. Se uma ação não tem instante claro na imagem, o pedido volta à direção de arte.
- A voz e o arquivo final com `loudnorm`.
- Efeito em corte, em texto que só entra na tela e em movimento de câmera, que a unidade `efeitos/dose` deixa sem som por padrão.

### Decisões do usuário em jogo

- A música a 13 dB da voz veio do estudo da referência e substituiu a trilha antiga, que ficava a 18. O usuário agora pede a música bem baixa: a decisão é dele e contraria a medida da referência de propósito.
- O mapa de som com cinco momentos na primeira parte foi o piloto de 2026-10-06, que nunca teve o aceite dele; sai.
- A dose de efeitos (ralo, médio ou cheio) era decisão pendente dele em `sound.md`. O pedido desta mudança a responde: os efeitos acompanham o que acontece na tela.

## Capabilities

### New Capabilities

- `effect-sync`: os efeitos sonoros de um vídeo pertencem a acontecimentos da imagem, começam no instante deles e se repetem quando eles se repetem.
- `music-presence`: a música de um vídeo fica abaixo da fala e dos efeitos o bastante para não disputar com eles, e tem uma identidade só do começo ao fim.

### Modified Capabilities

Nenhuma.

## Impact

- Som (skill `diretor-de-som`): `src/videos/why-we-sleep/sound.md` (arco, mapa, efeitos) e os campos `music` e `sfx` de `script.json`.
- Operação (skill `producao`): `pnpm sfx` (usa a chave do Freesound, que está no `.env`), `pnpm music why-we-sleep <semente> 1`, `pnpm sound`, `pnpm join`, `pnpm critique why-we-sleep som`.
- Código: `src/audio/sfx.ts` ganha uma linha por som novo do catálogo. `src/audio/ducking.ts` só muda se o usuário pedir a música abaixo de 17 dB: aí a calibração dos níveis da trilha muda, com o teste e a unidade `mixagem/niveis` junto.
- Arquivos fora do git: `public/sfx/freesound/` (os sons novos) e `public/videos/why-we-sleep/music.wav`.
- Tempo de máquina: cerca de cinco minutos de GPU por tentativa do primeiro leito, com quase toda a memória; os renders do som levam minutos.
- Ouvido do usuário: uma sessão para escolher os sons novos, uma para o nível e o leito, e a escuta do conjunto.
