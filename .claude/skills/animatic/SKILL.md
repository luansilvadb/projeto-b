---
name: animatic
description: Monta o animatic de um vídeo, isto é, cada cena do roteiro como um quadro composto e legível, tocando com a narração, para a segunda aprovação do usuário antes de animar. Use sempre que a narração de um vídeo estiver pronta e for hora de criar as cenas, quando o usuário pedir para ver como o vídeo vai ficar, pedir storyboard, layout ou composição das cenas, ou quando for preciso criar a pasta e a composição de um vídeo novo.
---

# Animatic de um vídeo

Quarta etapa, depois de `narration`. O animatic é o vídeo inteiro com cada cena já composta (o que aparece, onde, com que texto) tocando sobre a narração, mas ainda sem acabamento de movimento. Ele existe para o usuário julgar ritmo, clareza e composição antes de se gastar tempo animando. Termina na **segunda aprovação do usuário**.

Antes de escrever qualquer cena, leia a skill `remotion-best-practices` e, dentro dela, as regras de marcação (`remotion-markup`). Elas descrevem as APIs atuais do Remotion.

## Estrutura de um vídeo

Use `src/videos/demo/` como modelo. O nome da pasta (o "slug") é também o id da composição e o argumento dos comandos.

```
src/videos/<vídeo>/
  research.md       pesquisa (skill research)
  script.json       roteiro aprovado (skill script)
  index.tsx         liga cada "id" de cena ao componente e exporta a composição
  scenes/           um arquivo por cena
```

1. Crie um componente por cena em `scenes/`. Ele recebe `scene` (os tempos da cena) e ocupa o quadro inteiro.
2. Em `index.tsx`, mapeie cada `id` do roteiro para o componente e exporte o componente do vídeo e o `calculateMetadata`, como o demo faz.
3. Registre a composição em `src/Root.tsx`, com o `id` igual ao nome da pasta.

A duração de cada cena vem da narração: não escreva durações fixas. Use `scene.durationInFrames` e, para sincronizar algo com a fala, `cueFrame(scene, "palavra")`. Se a palavra não existir na narração da cena, o render falha de propósito: é sinal de que roteiro e cena divergiram.

## Compor as cenas

Siga o campo `visual` de cada cena. A direção de arte do canal mora no código e é o que dá unidade ao vídeo:

- **Cores, texto, formas e ritmo**: sempre de `src/design/tokens.ts`. Não escreva cor ou tamanho de fonte solto numa cena. Se faltar um valor, acrescente-o aos tokens. A composição `identity-sheet`, na pasta `design` do Studio, mostra tudo o que os tokens oferecem.
- **Primitivos** em `src/components/`: `Backdrop` (fundo), `Camera` e `Layer` (parallax; `Layer light` para halos), `StarField`, `Glow`, `Grain`, `Place` (posiciona pelo centro), `Label` (texto solto ou, com `tag`, etiqueta), `Appear` (entrada padrão), `SvgLayer` (SVG em pixels do quadro).
- **Etiquetas**: o texto que nomeia ou qualifica algo na cena vai em etiqueta (`<Label tag={palette.accent.base}>`); números de destaque ficam soltos. A cor da etiqueta é o tom `base` ou `light` de uma rampa da paleta, escolhido pelo assunto, e `accent` é o padrão.
- **Desenhos** em `src/art/`: `Sun`, `Earth`, `LightPulse`. Um desenho novo que pode servir a outro vídeo nasce ali, feito de formas simples e cores da paleta. O que só serve a uma cena fica no arquivo da cena.

Pense em vídeo, não em página: decida o que o espectador deve notar primeiro em cada cena e construa o quadro em torno disso. Mantenha texto importante dentro da margem `shape.safeArea` e nos tamanhos de `typography.size`. Texto de tela reforça a narração com o número ou o termo; não repete a frase.

No animatic, entradas simples pela deixa da narração (`Appear`) já bastam. Movimento elaborado fica para a skill `animation`.

## Conferir antes de mostrar

```bash
pnpm lint                 # tipos e regras do Remotion
pnpm stills <vídeo>       # um quadro de cada cena em out/stills/<vídeo>/
```

Abra cada imagem gerada e olhe com olho crítico, como espectador: algo se sobrepõe? O texto está legível e dentro da margem? A cena comunica a ideia sem a narração? O quadro está vazio ou poluído? Corrija e repita. Para ver um momento específico, passe os quadros: `pnpm stills <vídeo> 30 120`.

O `pnpm stills` monta o vídeo sem áudio (um defeito do Remotion impede renderizar quadros avulsos com áudio); isso não afeta as imagens.

## Segunda aprovação

Renderize o animatic e entregue o arquivo:

```bash
pnpm render <vídeo>       # out/<vídeo>.mp4
```

Mostre ao usuário os quadros das cenas e o caminho do MP4, e diga o que ainda não está ali (movimento, trilha). Para ele assistir e navegar pelo vídeo ao vivo, `pnpm dev` abre o Remotion Studio.

Peça a aprovação explicitamente. Ajustes de composição são baratos agora e caros depois de animar.
