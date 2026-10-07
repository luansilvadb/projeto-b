# Estudo da savana de referência

Reconstrução em SVG do quadro fornecido pelo usuário, separada do vídeo narrado. A composição `savanna-reference` preserva o desenho fixo; `savanna-reference-animation` demonstra a animação por 8 segundos, em 1920 × 1080 a 30 fps.

O movimento é calculado pelo quadro do Remotion: câmera de 1× a 1,075× na profundidade do assunto, vento com fases diferentes em cada folha, nuvens em deriva e pequenas flexões das árvores. O antílope respira com os cascos fixos, pisca, ergue a cabeça entre 1,5 e 2,65 s, mantém a atenção até 5,8 s e retorna à pose inicial até 7,1 s. A orelha acompanha o gesto, e a cauda dá um movimento curto a partir de 3,9 s.

O quadro inicial da animação corresponde ao desenho fixo. Este estudo é visual e não tem áudio, narração nem transição entre planos.

```powershell
pnpm exec remotion still savanna-reference out/studies/savanna-reference/frame.png --image-format=png
pnpm exec remotion render savanna-reference-animation out/studies/savanna-reference/animation.mp4 --codec=h264
```

No Studio, ambas as composições estão na pasta `design`. As cores ficam em `palette.ts`; as peças, os pontos de giro e os movimentos estão em `SavannaReference.tsx`.

## Segunda referência: acabamento e profundidade

As composições `savanna-rich-reference` e `savanna-rich-animation` reconstroem a segunda imagem enviada pelo usuário. Mantêm a versão anterior disponível para comparação e acrescentam bancos de nuvens em massas sobrepostas, copas recortadas pela luz do sol, árvores distantes, terreno em faixas irregulares, vegetação de primeiro plano e sombras compridas. O antílope possui um novo desenho, com proporções mais esbeltas e partes articuladas.

A animação dura 8 segundos a 30 fps. A câmera avança até 6,5% na profundidade do personagem, os planos distantes acompanham em proporções menores, o vento flexiona a vegetação e o antílope respira, pisca, movimenta a orelha e ergue a cabeça. Os cascos permanecem plantados, e o primeiro quadro é igual ao desenho fixo. Não há áudio neste estudo.

```powershell
pnpm exec remotion still savanna-rich-reference out/studies/savanna-reference/frame-v2.png --image-format=png
pnpm exec remotion render savanna-rich-animation out/studies/savanna-reference/animation-v2.mp4 --codec=h264
```

`richPalette.ts` guarda as cores; `RichScenery.tsx`, as peças do cenário; `RichAntelope.tsx`, o personagem; e `RichSavannaReference.tsx`, a composição em camadas. Nenhuma das duas referências raster é embutida no render.

## Versão noturna

`savanna-night-reference` e `savanna-night-animation` usam o mesmo desenho e as mesmas articulações com a luz da terceira referência: lua cheia com crateras e halo, céu estrelado, nuvens violetas, contornos iluminados em azul e sombras frias. O antílope conserva o pelo quente. `nightPalette.ts` guarda as cores e `NightSky.tsx` desenha lua e estrelas; `RichTheme.tsx` fornece o horário às peças compartilhadas. A constelação é fixa, com cintilação suave calculada pelo quadro, e a animação mantém 8 segundos a 30 fps.

## Consistência do elenco

Por pedido do usuário em 2026-10-06, a geometria do antílope passou a ter uma única fonte em `src/art/AntelopeDrawing.tsx`. `src/art/Antelope.tsx` adapta a escala e as poses do roteiro (andar, deitar, cochilar e olhar para trás); `RichAntelope.tsx` fornece apenas os gestos dos estudos. A primeira savana também usa esse modelo. O modo `finish` já não seleciona outra anatomia.

`RichSavannaBackdrop` fornece o mesmo cenário aos planos narrados de `why-we-sleep`, sem embutir o antílope de demonstração. As camadas seguem a câmera e o relógio do roteiro. Entardecer e noite diferem na luz; os enquadramentos, as deixas e os estados do personagem continuam vindo das cenas.

```powershell
pnpm exec remotion still savanna-night-reference out/studies/savanna-reference/frame-night.png --image-format=png
pnpm exec remotion render savanna-night-animation out/studies/savanna-reference/animation-night.mp4 --codec=h264
```
