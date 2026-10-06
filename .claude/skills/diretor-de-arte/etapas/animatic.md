# Animatic de um vídeo

Quarta etapa, depois da narração (skill `producao`). Antes de começar, confira em `src/videos/<vídeo>/approvals.md` que a 1ª aprovação está registrada e não foi reaberta; se não estiver, pergunte ao usuário. O animatic é o vídeo inteiro com cada plano já desenhado e composto (o que aparece, onde, com que texto) tocando sobre a narração, mas ainda sem acabamento de movimento. Ele existe para o usuário julgar ritmo, clareza e imagem antes de se gastar tempo animando. Termina na **segunda aprovação do usuário**.

Antes de escrever qualquer cena:

- leia a skill `remotion-best-practices` e, dentro dela, as regras de marcação (`remotion-markup`), que descrevem as APIs atuais do Remotion;
- leia as unidades do passo em curso (Desenho, depois Quadro, depois Revisão), pela ordem de injeção de `SKILL.md`; as do passo seguinte, só ao chegar nele. São elas que dizem como construir cada desenho, compor cada quadro e julgar o resultado.

## Estrutura de um vídeo

Use `src/videos/why-we-sleep/` como modelo: o `demo` é anterior à ficha visual e às cores por vídeo, e não tem `art.md`, `script.md` nem `palette.ts`. O nome da pasta (o "slug") é também o id da composição e o argumento dos comandos.

```
src/videos/<vídeo>/
  research.md       pesquisa (skill diretor-criativo)
  art.md            ficha visual: elenco, paletas e a forma das analogias (passo Conceito visual)
  script.json       roteiro aprovado, com os planos de cada cena (skill diretor-criativo)
  script.md         registro da direção criativa: decisões do texto, sem narração (skill diretor-criativo)
  approvals.md      as aprovações do usuário, uma linha cada
  score.md          partitura da animação (etapa animacao)
  palette.ts        as cores do vídeo
  index.tsx         liga cada "id" de cena ao componente e exporta a composição
  scenes/           um arquivo por cena
  parts/            desenhos e cálculos que só servem a este vídeo
```

1. Crie um componente por cena em `scenes/`. Ele recebe `scene` (os tempos da cena) e ocupa o quadro inteiro.
2. Em `index.tsx`, mapeie cada `id` do roteiro para o componente e exporte o componente do vídeo e o `calculateMetadata`, como o modelo faz.
3. Registre a composição em `src/Root.tsx`, com o `id` igual ao nome da pasta.

A duração de cada cena vem da narração: não escreva durações fixas. Use `scene.durationInFrames` e, para sincronizar algo com a fala, `cueFrame(scene, "palavra")`. Se a palavra não existir na narração da cena, o render falha de propósito: é sinal de que roteiro e cena divergiram.

## Compor as cenas

Quem desenha e compõe em volume é o subagente `ilustrador`: um disparo por desenho reutilizável (personagem, objeto, cenário) e, com os desenhos prontos, um por cena. Passe a pasta do vídeo, o que fazer e a lista dos arquivos que ele pode tocar; em paralelo, só com listas que não se cruzam. Primeiro crie você a pasta, o `index.tsx`, a paleta e o registro em `src/Root.tsx`, e deixe para si todo arquivo compartilhado. O que ele devolver como decisão vai ao usuário por você. As regras abaixo valem para ele e para o que você ajustar à mão.

Siga os planos de cada cena (`shots` em `script.json`). Cada plano é uma composição própria: enquadramento, lugar e paleta. A imagem troca na deixa do plano (`cueFrame(scene, "<cue>")`), e não só no fim da cena. Um plano não é a composição anterior com uma etiqueta a mais.

A direção de arte mora na ficha visual do vídeo e no código, e é o que dá unidade ao vídeo:

- **Elenco e paletas**: os de `art.md`. O nome em `palette` de cada plano é uma paleta de lá. Todo personagem bate com a folha de modelo aprovada.
- **Cores**: as do vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual; `src/videos/why-we-sleep/palette.ts` é o modelo. Não escreva cor solta numa cena nem num desenho: os desenhos de `src/art/` recebem as cores por parâmetro.
- **Texto, formas e ritmo**: de `src/design/tokens.ts`. Não escreva tamanho de fonte solto numa cena. Se faltar um valor, acrescente-o aos tokens.
- **Primitivos** em `src/components/`: câmera e camadas, posicionamento, etiqueta, entrada padrão, fundos e partículas. Liste a pasta antes de criar um.
- **Planos**: cada cena recebe `shots`, o trecho de cada plano do roteiro, e põe cada um dentro de um `<Shot>` (`src/video/Shot.tsx`). Dentro do plano, `useCurrentFrame()` conta a partir do começo dele.
- **Etiquetas**: o texto que nomeia ou qualifica algo na cena vai em etiqueta (`<Label tag={...}>`), presa ao que nomeia; números de destaque ficam presos ao que medem. Quanto texto cabe e onde ele fica vem da unidade `texto`.
- **Desenhos** em `src/art/`: liste a pasta antes de desenhar. Um desenho novo que pode servir a outro vídeo nasce ali, construído conforme as unidades `forma`, `personagem` e `cenario`. O que só serve a um vídeo fica em `parts/`, na pasta dele. Todo desenho é julgado pela imagem renderizada, nunca pelo código: renderize, abra, corrija.

Desfoque grande pesa no render (veja o comentário de `Glow`). Prefira degradê; use desfoque só na moldura de primeiro plano e na distância, em camadas que não mudam de quadro para quadro.

Mantenha texto importante dentro da margem `shape.safeArea` e nos tamanhos de `typography.size`.

No animatic, entradas simples pela deixa da narração (`Appear`) já bastam. Movimento elaborado fica para a etapa `animacao`.

## Conferir antes de mostrar

```bash
pnpm lint                        # tipos e regras do Remotion
pnpm stills <vídeo>              # um quadro de cada plano em out/stills/<vídeo>/
pnpm render <vídeo>              # out/<vídeo>.mp4
pnpm critique <vídeo> animatic   # medidas do render contra os vídeos de referência
```

Enquanto desenha, abra cada imagem gerada e corrija o que vir: nenhum quadro vai adiante sem ter sido aberto. Para ver um momento específico, passe os quadros: `pnpm stills <vídeo> 30 120`.

Com os quadros de todos os planos renderizados, acione o subagente `critico-de-quadro`, que não desenhou nada e faz as passadas da unidade `critica-quadro`, começando pela encenação: sem som e sem etiqueta, o plano diz o que a oração afirma? Passe o nome da pasta do vídeo, o caminho dos quadros e a tabela do `pnpm critique`. Ele julga; quem decide e redesenha é você, pelos passos 4 a 6 do procedimento de `critica-quadro`, acionando-o de novo só com os planos alterados.

Com `animatic`, o `pnpm critique` só reprova as medidas que já valem com os quadros parados (seção Medidas de `critica-quadro`).

## Segunda aprovação

Entregue ao usuário:

- os quadros de todos os planos, em ordem, e o caminho do MP4;
- a tabela de medidas do `pnpm critique`;
- os problemas que ficaram em aberto na crítica;
- o que ainda não está ali (movimento, trilha) e o que só ele pode julgar (gosto e identidade).

Para ele assistir e navegar pelo vídeo ao vivo, `pnpm dev` abre o Remotion Studio.

Peça a aprovação explicitamente e, com o "sim" dele, registre a 2ª aprovação em `approvals.md` (formato nas convenções do `README.md`). Ajustes de desenho e composição são baratos agora e caros depois de animar.
