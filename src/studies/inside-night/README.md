# Estudo "A noite, por dentro"

Uma tomada de 12,5 s, muda, fora de qualquer vídeo: a prova de como o canal mostra um mecanismo por dentro, com mundo, luz, câmera e um número mudo atuado. A composição `inside-night` tem 375 quadros, em 1920 × 1080 a 30 fps. A folha `vigilia` tem três: as oito poses do número pintadas, em silhueta e no tamanho do plano.

O que a imagem afirma: a pressão do sono se acumula no reservatório e empurra a alavanca para o lado de dormir; a Vigília a segura, e a alavanca, pelo cabo, segura aberta a pálpebra da janela do olho. O Contador marca cada gota nas lâmpadas do anel. A cada gota a alavanca dá um tranco e ela responde com mais corpo; na quarta, o reservatório transborda, a alavanca vence, a janela fecha, e ela cai sentada, tenta se levantar e adormece encostada. A fala a que o número responde ("Só que o corpo cobra o sono que faltou, como quem cobra uma dívida.") começaria em 3,4 s.

## O que o usuário aceitou em 2026-10-09

- **O mundo, a luz e a câmera.** O salão em índigo e roxo, a janela do olho com a luz fria, o reservatório com a quente, e a câmera que desce da janela e depois se aproxima.
- **A atriz.** A Vigília é um ovo chibi: cabeça e corpo num volume só, com o rosto nele, membros curtos e cascos claros, sem chifres ("esses chifres eu não quero, nos chibis de resto tá perfeito"). Antes dela foram recusados o ovo de membros de mangueira, que se mexia como boneco, e um corpo de cabeça grande sobre tronco fino ("quero algo mais voltado a chibi, o do ovo ficou mais próximo"). A trupe inteira é chibi e sem chifres.
- **A atuação pose a pose.** Cada extremo é uma pose inteira, desenhada e segurada o tempo de ser lida, e a passagem é curta ("Chegou: é esse o padrão"). Mover os parâmetros de um boneco sem pose desenhada foi o que a primeira versão fazia.

## Pendente

- **O sinal da inclinação do chão.** `floorAt` desce para a esquerda na tela e o grupo dela gira para o outro lado (`rotate(SLOPE)`, em `cast.tsx`): ela pisa de 8 a 13 px acima da passarela, e a sombra acompanha a linha dela. Trocar o sinal muda em 5,3° o ângulo da alavanca no espaço das poses, e as oito poses e as poses-chave da atuação foram desenhadas contra a haste: pede redesenhar, e por isso não foi feito.
- **O Contador ainda tem o corpo antigo**: tronco que inclina e achata, braço de mangueira e rosto que desliza, com a atuação em `timing.ts`.
- **A onda de luz clareia a queda.** Quando o reservatório transborda, a onda passa por cima dela entre a pose 5 e a 6 e lava o momento em que ela cai.

## Arquivos

- `InsideNight.tsx`: a composição, com as camadas e a câmera.
- `timing.ts`: a partitura em números (as gotas, os trancos, a alavanca, a câmera, o Contador).
- `acting.ts`: a atuação da Vigília, pose a pose, sobre as poses de `poses.ts`.
- `poses.ts`: as oito poses desenhadas, a alavanca no espaço das poses e `settle`, que põe na haste a mão presa.
- `base.tsx`, `scenery.tsx`, `cast.tsx`: a paleta e a geometria, o lugar, e os dois em cena.
- `VigiliaSheet.tsx`: a folha de modelo dela.

O desenho da Vigília mora em `src/art/Vigilia.tsx`: não sabe de alavanca e recebe as cores de `C.vigilia`, em `base.tsx`.

## Renderizar

```powershell
pnpm exec remotion render inside-night out/studies/inside-night/inside-night.mp4
pnpm exec remotion render vigilia out/studies/inside-night/vigilia --sequence --image-format=png
```

No Studio, as duas estão na pasta `design`. O estudo não tem áudio nem narração.
