---
name: animatic
description: Monta o animatic de um vídeo, isto é, cada plano do roteiro como um quadro desenhado e composto, tocando com a narração, para a segunda aprovação do usuário antes de animar. Use sempre que a narração de um vídeo estiver pronta e for hora de criar as cenas, quando o usuário pedir para ver como o vídeo vai ficar, pedir storyboard, layout, desenho ou composição das cenas, ou quando for preciso criar a pasta e a composição de um vídeo novo.
---

# Animatic de um vídeo

Quarta etapa, depois de `narration`. O animatic é o vídeo inteiro com cada plano já desenhado e composto (o que aparece, onde, com que texto) tocando sobre a narração, mas ainda sem acabamento de movimento. Ele existe para o usuário julgar ritmo, clareza e imagem antes de se gastar tempo animando. Termina na **segunda aprovação do usuário**.

Antes de escrever qualquer cena:

- leia a skill `remotion-best-practices` e, dentro dela, as regras de marcação (`remotion-markup`), que descrevem as APIs atuais do Remotion;
- injete o workflow `diretor-de-arte` (`.claude/commands/diretor-de-arte/diretor-de-arte.md`) nas etapas 3 a 5: desenho, quadro e revisão. É ele que diz como construir cada desenho, compor cada quadro e julgar o resultado.

## Estrutura de um vídeo

Use `src/videos/demo/` como modelo. O nome da pasta (o "slug") é também o id da composição e o argumento dos comandos.

```
src/videos/<vídeo>/
  research.md       pesquisa (skill research)
  art.md            ficha visual: elenco, paletas e a forma das analogias (workflow diretor-de-arte)
  script.json       roteiro aprovado, com os planos de cada cena (skill script)
  index.tsx         liga cada "id" de cena ao componente e exporta a composição
  scenes/           um arquivo por cena
```

1. Crie um componente por cena em `scenes/`. Ele recebe `scene` (os tempos da cena) e ocupa o quadro inteiro.
2. Em `index.tsx`, mapeie cada `id` do roteiro para o componente e exporte o componente do vídeo e o `calculateMetadata`, como o demo faz.
3. Registre a composição em `src/Root.tsx`, com o `id` igual ao nome da pasta.

A duração de cada cena vem da narração: não escreva durações fixas. Use `scene.durationInFrames` e, para sincronizar algo com a fala, `cueFrame(scene, "palavra")`. Se a palavra não existir na narração da cena, o render falha de propósito: é sinal de que roteiro e cena divergiram.

## Compor as cenas

Siga os planos de cada cena (`shots` em `script.json`). Cada plano é uma composição própria: enquadramento, lugar e paleta. A imagem troca na deixa do plano (`cueFrame(scene, "<cue>")`), e não só no fim da cena. Um plano não é a composição anterior com uma etiqueta a mais.

A direção de arte mora na ficha visual do vídeo e no código, e é o que dá unidade ao vídeo:

- **Elenco e paletas**: os de `art.md`. O nome em `palette` de cada plano é uma paleta de lá. Todo personagem bate com a folha de modelo aprovada.
- **Cores**: as do vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual; `src/videos/why-we-sleep/palette.ts` é o modelo. Não escreva cor solta numa cena nem num desenho: os desenhos de `src/art/` recebem as cores por parâmetro.
- **Texto, formas e ritmo**: de `src/design/tokens.ts`. Não escreva tamanho de fonte solto numa cena. Se faltar um valor, acrescente-o aos tokens.
- **Primitivos** em `src/components/`: `Camera`, `Layer` e `framing` (um cenário só, enquadrado de perto ou de longe em cada plano; `Layer light` para halos), `Place` (posiciona pelo centro ou, com `anchor="bottom"`, pelos pés), `Label` (texto solto ou, com `tag`, etiqueta), `Appear` (entrada padrão), `SvgLayer` (SVG em pixels do quadro), `Grain`, `Drifters`, `Glow`, `StarField`, `Backdrop`.
- **Planos**: cada cena recebe `shots`, o trecho de cada plano do roteiro, e põe cada um dentro de um `<Shot>` (`src/video/Shot.tsx`). Dentro do plano, `useCurrentFrame()` conta a partir do começo dele.
- **Etiquetas**: o texto que nomeia ou qualifica algo na cena vai em etiqueta (`<Label tag={...}>`), presa ao que nomeia; números de destaque ficam presos ao que medem. Quanto texto cabe e onde ele fica vem da unidade `texto` do `diretor-de-arte`.
- **Desenhos** em `src/art/`: `Cassiopea`, `Fish`, `Person`, `Storefront`, `Stopwatch`, `Silhouette`, e `taperPath` para tudo que é tubo que afina. Um desenho novo que pode servir a outro vídeo nasce ali, construído conforme as unidades `forma`, `personagem` e `cenario`. O que só serve a um vídeo fica em `parts/`, na pasta dele. Todo desenho é julgado pela imagem renderizada, nunca pelo código: renderize, abra, corrija.

Desfoque grande pesa no render (veja o comentário de `Glow`). Prefira degradê; use desfoque só na moldura de primeiro plano e na distância, em camadas que não mudam de quadro para quadro.

Mantenha texto importante dentro da margem `shape.safeArea` e nos tamanhos de `typography.size`.

No animatic, entradas simples pela deixa da narração (`Appear`) já bastam. Movimento elaborado fica para a skill `animation`.

## Conferir antes de mostrar

```bash
pnpm lint                        # tipos e regras do Remotion
pnpm stills <vídeo>              # um quadro de cada plano em out/stills/<vídeo>/
pnpm render <vídeo>              # out/<vídeo>.mp4
pnpm critique <vídeo> animatic   # medidas do render contra os vídeos de referência
```

Abra cada imagem gerada e faça as oito passadas da unidade `critica` do `diretor-de-arte`, começando pela encenação: sem som e sem etiqueta, o plano diz o que a oração afirma? Registre cada problema com plano, critério e classificação, corrija e repita. Para ver um momento específico, passe os quadros: `pnpm stills <vídeo> 30 120`.

O `pnpm critique` compara o render com a faixa de 12 vídeos de referência. Com `animatic`, só reprovam as medidas que já valem com os quadros parados: área com desenho, cores por quadro, trocas da cor dominante e peso da cor mais comum. Medida fora da faixa é problema bloqueante. Medida dentro da faixa não aprova nada: ela não enxerga desenho ruim nem encenação fraca.

O `pnpm stills` monta o vídeo sem áudio (um defeito do Remotion impede renderizar quadros avulsos com áudio); isso não afeta as imagens.

## Segunda aprovação

Entregue ao usuário:

- os quadros de todos os planos, em ordem, e o caminho do MP4;
- a tabela de medidas do `pnpm critique`;
- os problemas que ficaram em aberto na crítica;
- o que ainda não está ali (movimento, trilha) e o que só ele pode julgar (gosto e identidade).

Para ele assistir e navegar pelo vídeo ao vivo, `pnpm dev` abre o Remotion Studio.

Peça a aprovação explicitamente. Ajustes de desenho e composição são baratos agora e caros depois de animar.
