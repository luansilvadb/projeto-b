---
name: animation
description: Anima as cenas já aprovadas de um vídeo: movimento sincronizado com a narração, câmera, parallax, detalhe procedural e efeitos sonoros, conferindo o resultado em quadros renderizados. Use sempre que o animatic estiver aprovado e for hora de dar vida às cenas, ou quando o usuário pedir para animar, melhorar o movimento, ajustar o tempo de uma entrada, adicionar efeito sonoro ou dar mais acabamento a uma cena.
---

# Animação das cenas

Quinta etapa, depois do animatic aprovado. Aqui cada cena ganha movimento e acabamento. A composição já foi aprovada: mude posição, tamanho ou conteúdo só se a animação pedir, e avise o usuário quando mudar.

Leia a skill `remotion-best-practices` (regras de `remotion-markup`) antes de escrever. O essencial: todo movimento sai de `useCurrentFrame()` com `interpolate()` e `Easing`; transições e animações de CSS não renderizam; prefira as propriedades `scale`, `translate` e `rotate` a `transform`.

Este projeto se afasta dessas regras em um ponto, de propósito: cores, tamanhos e curvas de movimento vêm dos tokens, e não de valores escritos em cada estilo. A unidade visual do canal vale mais que a edição pelo Studio.

## O que dá cara de acabamento

Boa parte da sensação de qualidade vem do movimento, e ele é barato em código:

- **Sincronia com a fala**: cada elemento entra na palavra que o anuncia. Use `cueFrame(scene, "palavra")`. Uma entrada alguns quadros antes da palavra costuma ler melhor que exatamente em cima.
- **Curvas, não linhas**: use `motion.enter` e `motion.smooth` dos tokens. Movimento linear só quando ele significa algo (velocidade constante, relógio).
- **Movimento secundário**: nada fica totalmente parado. Um brilho que respira, um planeta que gira devagar, estrelas que cintilam, uma câmera que se aproxima.
- **Profundidade**: `Camera` com `Layer` em profundidades diferentes dá parallax com uma linha por camada.
- **Detalhe procedural**: muitos elementos pequenos gerados por código (partículas, estrelas, células) enchem o quadro sem desenhar um por um. Use `random("semente")` do Remotion para o sorteio ser o mesmo em todo render; `Math.random()` daria um vídeo diferente a cada quadro.
- **Entradas escalonadas**: vários elementos entram em sequência, com `motion.seconds.stagger` entre um e outro, em vez de todos juntos. A composição `motion-sample`, na pasta `design` do Studio, mostra o ritmo.

Movimento que se repete em mais de uma cena vira um primitivo em `src/components/`, como o `Appear`. Lógica de cálculo que não seja trivial (trajetórias, distribuições, tempos) vai para uma função pura com teste, no padrão de `src/narration/` e `src/audio/ducking.ts`.

## Efeitos sonoros

```tsx
<Sfx name="<uso>" from={cueFrame(scene, "oito")} />
```

O catálogo fica em `src/audio/Sfx.tsx`, com cada efeito nomeado pelo uso, e começa vazio. Os arquivos ficam em `public/sfx/freesound/`. Texto que entra na tela não leva efeito; reserve o som para o que acontece na imagem, e só quando importa, porque efeito demais cansa.

Para um uso novo, busque no Freesound (só CC0, até 10 s):

```bash
pnpm sfx "<busca em inglês>"   # lista id, duração, nota e link de cada candidato
pnpm sfx <id>                  # baixa para public/sfx/freesound/<id>.ogg
```

Você não ouve os sons: descarte pelo nome, pela duração e pela nota, evite os que se anunciam como gerados por IA, mostre os links ao usuário e deixe que ele escolha ouvindo. Só então baixe e acrescente o arquivo ao catálogo, com um nome pelo uso. O comando precisa de `FREESOUND_API_KEY` no `.env`.

## Conferir

```bash
pnpm lint
pnpm test
pnpm stills <vídeo> <quadros>
```

Movimento não aparece num quadro só. Para cada cena, renderize quadros antes, durante e depois de cada entrada (os quadros das deixas vêm de `cueFrame`; some o `from` da cena para ter o quadro do vídeo) e abra as imagens. Procure: elemento que entra por cima de outro, texto cortado no meio do movimento, algo que sai do quadro, um instante em que a tela fica vazia.

Depois renderize o vídeo (`pnpm render <vídeo>`) e peça ao usuário para assistir, porque ritmo e suavidade só se julgam em movimento.

A próxima etapa é `music`, e depois `final-cut`.
