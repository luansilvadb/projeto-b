# Animatic de um vídeo

Depende de dois artefatos: os `shots` do trecho em `script.json`, e a narração gravada (skill `producao`), porque a composição só monta com o manifesto dela e é dele que saem os tempos de cada plano. Um quadro que não precisa do tempo da fala (um estudo, uma prova de personagem) cabe antes da voz, como em `decupagem.md`. Faltando a narração, diga que ela falta: gerá-la é da skill `producao`.

O animatic é a forma barata de saber se a imagem conta a explicação: cada plano desenhado e composto (o que aparece, onde, com que texto) tocando sobre a narração, sem acabamento de movimento. Ele responde, antes de se gastar tempo animando: o assunto se acha? personagem, cenário, texto e dado convivem? a escala funciona no tamanho final? parece acontecimento ou slide? a identidade aguenta ser repetida? O acabamento é só o que essas perguntas pedem. Uma cena ou um trecho termina quando a dúvida visual dele está resolvida.

O caminho é construir, olhar, aprender e expandir: primeiro o menor trecho que responde à maior dúvida, e só depois o resto do vídeo.

Antes de escrever qualquer cena, leia a skill `remotion-best-practices` e, dentro dela, as regras de marcação (`remotion-markup`), que descrevem as APIs atuais do Remotion.

## Estrutura de um vídeo

Use `src/videos/why-we-sleep/` como modelo.

```
src/videos/<vídeo>/
  research.md       pesquisa (skill diretor-criativo)
  art.md            ficha visual: elenco, paletas e a forma das analogias (passo Conceito visual)
  script.json       roteiro, com os planos de cada cena (skill diretor-criativo)
  script.md         registro da direção criativa: decisões do texto, sem narração (skill diretor-criativo)
  score.md          partitura da animação (etapas/animacao.md)
  palette.ts        as cores do vídeo
  index.tsx         liga cada "id" de cena ao componente e exporta a composição
  scenes/           um arquivo por cena
  parts/            desenhos e cálculos que só servem a este vídeo
```

1. Crie um componente por cena em `scenes/`. Ele recebe `scene` (os tempos da cena) e ocupa o quadro inteiro.
2. Em `index.tsx`, mapeie cada `id` do roteiro para o componente e exporte o componente do vídeo e o `calculateMetadata`, como o modelo faz. A composição recusa uma cena sem componente: enquanto o vídeo não está inteiro, as cenas que faltam levam um componente vazio.
3. Registre a composição em `src/Root.tsx`, com o `id` igual ao nome da pasta.

A duração de cada cena vem da narração: não escreva durações fixas. Use `scene.durationInFrames` e, para sincronizar algo com a fala, `cueFrame(scene, "palavra")`. Se a palavra não existir na narração da cena, o render falha de propósito: é sinal de que roteiro e cena divergiram.

## Começar pelo trecho de maior risco

Quando há uma dúvida visual que pesa, comece por um trecho que atravessa tudo de uma vez: a narração, o personagem ou o assunto, o cenário, a composição, o texto, a paleta e, se for o caso, o dado ou a analogia. O que se quer saber é se o conjunto funciona. Personagem, cenário e texto testados cada um por si só se encontram no plano 30.

- **Escolha pelo risco, não pela ordem**: a primeira aparição do protagonista, a analogia condutora, se houver, o dado principal, o ambiente mais difícil, a cena que define o registro, o trecho que já deu dúvida na decupagem. Se o gancho cobre isso, é ele.
- **Do menor tamanho que contém a dúvida inteira**: um plano, dois ou três, uma cena curta.
- **Renderize cedo.** Com esse trecho de pé, renderize e abra, antes de existirem os outros personagens, cenários e cenas.
- **Conserte ali antes de multiplicar.** Leia o trecho por `critica-quadro`, com as lentes que a dúvida chama, e acione o `critico-de-quadro` sobre ele.

Sem dúvida desse tamanho (um vídeo com elenco, lugar e linguagem já provados), não há trecho de prova: componha.

## Expandir

Depois que o trecho funciona, veja o que nele vale repetir (o personagem, a construção, o cenário, a paleta, o jeito de mostrar a analogia, um padrão de texto) e só então invista em generalizar. O reuso é consequência de uma solução provada, não condição para achá-la.

- **A atenção vai para a novidade.** A cena que repete personagem, lugar, paleta e linguagem já provados sai depressa. A que traz um registro, uma analogia, um protagonista, um tipo de dado ou uma virada de paleta novos é renderizada e olhada cedo, como o primeiro trecho.
- **Em volume, quem desenha e compõe é o subagente `ilustrador`**, um disparo por cena ou por desenho. Passe a pasta do vídeo, o que fazer e a lista dos arquivos que ele pode tocar; a pasta, o `index.tsx`, a paleta e o registro em `src/Root.tsx` são criados por você. Paralelize quando as listas não se cruzam, uma cena não depende da decisão da outra e a direção já passou por um render: disparar dezenas de cenas sobre uma hipótese multiplica o erro dela.
- **Uma solução boa num plano não é copiada para trinta cenas de imediato.** Primeiro ela funciona no plano, no tamanho final, e faz sentido como padrão.
- **O que sai melhor que o previsto fica.** A composição diferente da decupada que preserva o foco e o sentido é adotada, e o plano em `script.json` e a ficha acompanham. O que muda sentido ou identidade vai ao usuário (`entrevista-imagem`); o que pede outra frase, ao `diretor-criativo`. A decupagem entregou uma hipótese para construir: revê-la aqui é parte do trabalho.
- **Pare um plano quando ele responde à pergunta dele.** Não se continua porque ainda há detalhe possível ou porque a referência tem mais textura.
- **Movimento não salva quadro fraco.** No animatic, entradas simples pela deixa da narração (`Appear`) bastam; atuação, câmera, efeito e transição final são de `etapas/animacao.md`. O plano que não se sustenta parado tem defeito de quadro ou de encenação, e é ali que se conserta.

**Silhueta antes da pintura** (`forma`): faça primeiro, numa cor só e na pose da cena, para figura viva, criatura complexa, pose decisiva ou desenho que já falhou; pinte quando estiver legível e acione `critico-de-quadro` se houver dúvida. Moeda, fundo e forma abstrata não precisam desse teste.

**Folha de modelo** (`personagem`, uma composição na pasta `design` do `src/Root.tsx`). É feita para o personagem que volta, depois de ele funcionar num plano de verdade, com os estados que o roteiro usa; pose, expressão ou vista novas entram quando uma cena as pede. Figurante e personagem de uma aparição só não têm folha.

## Onde mora cada coisa

A decisão mora na ficha visual (`art.md`: quem é cada figura, o que cada cor significa), e a implementação de agora, no código. O código melhora mantendo a decisão.

Siga os planos de cada cena (`shots` em `script.json`). Cada plano é uma composição própria: enquadramento, lugar e paleta. A imagem troca na deixa do plano (`cueFrame(scene, "<cue>")`), e não só no fim da cena. Um plano não é a composição anterior com uma etiqueta a mais.

- **Elenco e paletas**: os de `art.md`. O nome em `palette` de cada plano é uma paleta de lá. Todo personagem bate com a ficha dele e, quando existe, com a folha de modelo.
- **Cores**: as do vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual; `src/videos/why-we-sleep/palette.ts` é o modelo. Não escreva cor solta numa cena nem num desenho: os desenhos de `src/art/` recebem as cores por parâmetro.
- **Texto, formas e ritmo**: de `src/design/tokens.ts`. Não escreva tamanho de fonte solto numa cena. Um token novo é para um valor que se repete e tem nome; o que só uma cena usa fica nela.
- **Primitivos** em `src/components/`: câmera e camadas, posicionamento, etiqueta, entrada padrão, fundos e partículas. Liste a pasta antes de criar um, e crie quando houver o segundo uso de verdade.
- **Planos**: cada cena recebe `shots`, o trecho de cada plano do roteiro, e põe cada um dentro de um `<Shot>` (`src/video/Shot.tsx`). Dentro do plano, `useCurrentFrame()` conta a partir do começo dele.
- **Etiquetas**: o texto que nomeia ou qualifica algo na cena vai em etiqueta (`<Label tag={...}>`), presa ao que nomeia; números de destaque ficam presos ao que medem. Quanto texto cabe e onde ele fica vem da unidade `texto`.
- **Desenhos**: nascem em `parts/`, na pasta do vídeo, construídos conforme as unidades `forma`, `personagem` e `cenario`. Sobem para `src/art/` quando fica claro que servem a outro vídeo; liste a pasta antes de desenhar, porque o desenho pode já existir. Na dúvida, local: subir depois é barato.

Desfoque: a regra e o porquê estão em `cenario` (Custo).

Mantenha texto importante dentro da margem `shape.safeArea` e nos tamanhos de `typography.size`.

## Ver e conferir

```bash
pnpm lint                        # tipos e regras do Remotion
pnpm stills <vídeo> 30 120       # os quadros pedidos, em out/<vídeo>/stills/
pnpm stills <vídeo>              # um quadro de cada plano
pnpm scene <vídeo> <id> [id...]  # só essas cenas, em out/<vídeo>/cenas/<id>.mp4
pnpm render <vídeo> out/<vídeo>/<vídeo>.mp4
pnpm critique <vídeo> animatic   # medidas do render contra os vídeos de referência
```

O render responde a uma pergunta, e tem o tamanho dela: mudou um cenário em dois planos, renderize e olhe esses dois; testou uma família visual, o trecho dela; o vídeo inteiro e as medidas ficam para a revisão do conjunto. Corrigir o braço de um personagem não pede medida de paleta.

Todo quadro que serve de base a uma decisão foi aberto e visto, e nenhum lote grande é produzido em cima de um resultado que ninguém olhou.

O subagente `critico-de-quadro`, que não desenhou nada, entra onde a cegueira de quem fez custa caro: depois do primeiro trecho, quando chega uma família visual nova, diante de uma dúvida que não cede, antes de uma decisão que vai ao usuário e na revisão do animatic inteiro. O ajuste pequeno que você mesmo viu e sabe consertar é feito e conferido por você. Passe a ele o nome da pasta do vídeo, o caminho dos quadros e, na revisão do conjunto, a tabela do `pnpm critique`. Ele julga; quem decide e redesenha é você: refaça os bloqueantes, e os relevantes salvo custo desproporcional; o conserto que muda uma decisão tomada (quem a figura é, o que uma cor significa, a relação que a analogia afirma, o assunto de um plano) vai antes ao usuário, e o que só refina o desenho, não (`entrevista-imagem`); quando o refino muda o desenho de um personagem, atualize a ficha e a folha de modelo. Renderize de novo só os quadros mexidos, confira o defeito que motivou a mudança e acione o subagente de novo só com os planos alterados. Se uma rodada não resolver nenhum defeito, pare e relate o que ficou em aberto.

O conjunto está pronto para ir ao usuário quando: o vídeo inteiro tem imagem, não se conhece defeito que impeça o entendimento, a identidade e as relações que importam estão coerentes de ponta a ponta, as decisões que eram do usuário foram tomadas, e o que resta é refino que não redefine a imagem. Não se exige acabamento final, folha de tudo, medida dentro da faixa nem polimento zerado.

## O conjunto diante do usuário

Só quando o trabalho é o animatic inteiro: o ajuste de uma cena não passa por aqui. Deixe disponível o material inteiro: os quadros de todos os planos, em ordem, o caminho do MP4 e, para ele assistir e navegar ao vivo, o `pnpm dev`, que abre o Remotion Studio.

Chame a atenção dele só para o que pede olhar:

- o que é novo ou foi decidido no caminho (um personagem, uma analogia, uma mudança em relação à decupagem);
- os defeitos que ficaram em aberto na crítica, cada um com a evidência dele;
- as medidas fora da faixa que levantaram dúvida;
- o que ainda não está ali (movimento, trilha) e o que só ele pode julgar (gosto e identidade).

O que cabe a ele é dizer se a imagem conta a história certa, se a identidade e os compromissos estão certos e se os quadros importantes funcionam. O que ele decidir entra em `art.md`, como compromisso, e em nenhum outro registro. A resposta não congela posição, enquadramento fino nem a execução do movimento: o refino que preserva a intenção continua (`entrevista-imagem`, `entrevista-movimento`). Mudar a imagem é barato antes de animar e caro depois; é custo, e não proibição.
