# Proposal

## Why

O `why-we-sleep` alterna desenhos de dois momentos do projeto: o piloto do polimento (2026-10-06) redesenhou a elefanta, a pessoa e a savana atrás de uma chave `finish`, e a adoção parou no meio. No render de 2026-10-07 a mesma pessoa aparece com duas construções e a mesma savana com dois acabamentos, o que lê como inconsistência e contraria a regra do repositório de que um ajuste é feito no lugar, sem versão ao lado atrás de uma chave.

Esta é a primeira de duas mudanças pedidas pelo usuário ("mais bonito e consistente, estilo Kurzgesagt"). Ela fecha a régua única de desenho; a segunda, separada, dá lugar em camadas às cenas hoje em fundo liso e depende desta.

## What Changes

- **Elefanta**: todas as cenas já usam o desenho do piloto. Sai o desenho antigo e a chave `finish` de `src/art/Elephant.tsx`; as cores `elephant` e `elephantNight` dão lugar às do acabamento.
- **Pessoa**: o desenho do piloto (tronco em feijão, pescoço, quadril, sapato em cunha) passa a ser o único. Adoção nas cenas e peças que ainda usam o antigo: `third-of-life`, `two-hours`, `unknown-cause`, `stockroom`, `stockroom-night`, `stockroom-solid`, `memory-test`, `memory-result`, e as peças `Gardner`, `Chalkboard`, `CoffeeTable`, `ShopInside` e `TankShot`. Cada pose (apontar, carregar caixa, sentar à mesa, oscilar) é conferida em render, porque os braços foram desenhados sobre o tronco antigo.
- **Savana**: uma implementação só. Hoje as cenas do antílope importam `RichSavannaBackdrop` de `src/studies/savanna-reference/` e as das elefantas usam `parts/Savanna.tsx`. O cenário em camadas sai de `studies/` e passa a servir as duas.
- **Chave `finish`**: some do código (`Person`, `Elephant`, `Antelope`, `Savanna`, `Bed`, `Herd`, `Prey`, `Timeline` e as cenas que a passam).
- **Registro**: `art.md` passa a descrever a pessoa e a elefanta do piloto como as do vídeo, e o trecho "a adoção nas cenas, não" sai.

Fora do escopo: cenários novos para o laboratório, a bancada dos ratos, o quarto de Gardner, a sala de 1924 e o quarto de "você" (segunda mudança); luz por lugar no elenco; roteiro, narração, partitura e som.

### Decisão em aberto, do usuário

- **A savana das elefantas de dia.** Levar as elefantas à savana em camadas muda a cara do modo `savana-dia` aprovado em 2026-10-03 (céu pêssego-dourado, chão ocre). Falta verificar se a savana em camadas tem versão de dia; a decisão é tomada diante de um quadro renderizado, e até lá a `savana-dia` aprovada vale.

## Capabilities

### New Capabilities

- `shared-drawings`: cada personagem e cada cenário que volta num vídeo tem uma construção única, compartilhada por todas as cenas, sem variante de acabamento selecionável por cena.

### Modified Capabilities

Nenhuma: o projeto ainda não tem specs.

## Impact

- Código: `src/art/Elephant.tsx`, `src/art/Person.tsx`, `src/art/Antelope.tsx`, `src/studies/savanna-reference/`, `src/videos/why-we-sleep/palette.ts`, as peças de `parts/` e as cenas de `scenes/` listadas acima, e as folhas de modelo (`ElephantSheet`, `PersonSheet`, `AntelopeSheet`) e `SunsetPilot`, que hoje comparam as duas versões.
- Testes: `src/art/Elephant.test.ts` e o que mais cobrir o desenho antigo.
- Documentação: `src/videos/why-we-sleep/art.md`.
- Render: todas as cenas tocadas pedem `pnpm scene` de novo, e o vídeo, `pnpm join`. Narração, trilha e tempos não mudam.
- Dono: skill `diretor-de-arte`; a conferência de cada pose é por imagem renderizada, não pelo código.
