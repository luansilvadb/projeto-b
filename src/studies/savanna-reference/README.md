# Estudo da savana de referência

Reconstrução em SVG do quadro fornecido pelo usuário, separada do vídeo narrado. A composição `savanna-reference` preserva o desenho fixo; `savanna-reference-animation` demonstra a animação por 8 segundos, em 1920 × 1080 a 30 fps.

O movimento é calculado pelo quadro do Remotion: câmera de 1× a 1,075× na profundidade do assunto, vento com fases diferentes em cada folha, nuvens em deriva e pequenas flexões das árvores. O antílope respira com os cascos fixos, pisca, ergue a cabeça entre 1,5 e 2,65 s, mantém a atenção até 5,8 s e retorna à pose inicial até 7,1 s. A orelha acompanha o gesto, e a cauda dá um movimento curto a partir de 3,9 s.

O quadro inicial da animação corresponde ao desenho fixo. Este estudo é visual e não tem áudio, narração nem transição entre planos.

```powershell
pnpm exec remotion still savanna-reference out/studies/savanna-reference/frame.png --image-format=png
pnpm exec remotion render savanna-reference-animation out/studies/savanna-reference/animation.mp4 --codec=h264
```

No Studio, ambas as composições estão na pasta `design`. As cores ficam em `palette.ts`, nesta pasta; as peças, os pontos de giro e os movimentos estão em `SavannaReference.tsx`.

## A savana do vídeo

A segunda referência (acabamento e profundidade) e a versão noturna deixaram de ser estudo: viraram o cenário do `why-we-sleep`, do antílope e das elefantas, e moram em `src/videos/why-we-sleep/parts/savanna/`, com as cores em `savanna`, no `palette.ts` do vídeo. As composições `savanna-rich-*`, `savanna-night-*` e `savana-luz` (a luz do dia à noite, um horário por quadro) continuam na pasta `design` do Studio, importadas de lá. O capim e o relógio deste primeiro estudo (`GrassTuft`, `TimeContext`) ainda servem àquele cenário.

O antílope dos dois é o de `src/art/AntelopeDrawing.tsx`, a fonte única da geometria dele desde 2026-10-06.
