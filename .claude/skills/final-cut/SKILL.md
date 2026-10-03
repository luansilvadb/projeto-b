---
name: final-cut
description: Fecha um vídeo para publicação: confere as pendências, renderiza, ajusta o volume ao padrão do YouTube, passa as verificações finais e leva o arquivo à terceira aprovação do usuário. Use sempre que o usuário pedir o corte final, o render final, exportar, finalizar ou publicar um vídeo, ou perguntar se um vídeo está pronto para ir ao ar.
---

# Corte final

Última etapa. O que sai daqui é o arquivo que vai para o YouTube, e a **terceira aprovação do usuário**. Publicar é sempre ação dele; esta skill termina na entrega do arquivo.

## 1. Pendências

Confira antes de renderizar: descobrir uma pendência depois de meia hora de render é meia hora perdida.

- **Aprovações**: o roteiro e o animatic foram aprovados pelo usuário? Se o roteiro mudou depois da aprovação, mostre o que mudou.
- **Narração**: rode `pnpm narrate <vídeo>`. Com tudo em cache ele só repete o resumo. Não pode haver aviso de **voz provisória**: sem `voice/reference.wav` o vídeo não sai. Se houver aviso de frases que diferem do roteiro ou com o fim cortado, o usuário precisa ter ouvido e aceitado cada uma.
- **Trilha**: existe `public/videos/<vídeo>/music.json`? Sem ele o vídeo renderiza sem música.
- **Fatos**: releia o roteiro contra `research.md`. Cada número na tela e na fala bate com a fonte?
- **Código**: `pnpm lint` e `pnpm test` passam.
- **Imagem**: `pnpm critique <vídeo>` com as sete medidas na faixa da referência, ou cada medida fora explicada e aceita pelo usuário na aprovação da animação.

Não contorne uma pendência; leve-a ao usuário.

## 2. Render

```bash
pnpm render <vídeo>          # out/<vídeo>.mp4, 1920×1080 a 30 fps
```

No PC em que o projeto foi montado (Ryzen 9 5900X) o render faz cerca de 10 quadros por segundo: um vídeo de 10 minutos leva por volta de meia hora.

## 3. Volume

A mixagem do projeto mantém a relação entre voz e trilha, mas o arquivo sai mais baixo que o padrão do YouTube (-14 LUFS). O YouTube abaixa vídeos altos e não levanta os baixos, então um vídeo baixo soa fraco ao lado dos outros. Normalize:

```bash
ffmpeg -i out/<vídeo>.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 256k out/<vídeo>.final.mp4
```

Meça o resultado:

```bash
ffmpeg -hide_banner -nostats -i out/<vídeo>.final.mp4 -vn -af loudnorm=print_format=summary -f null -
```

O alvo é `Input Integrated` entre -15 e -13 LUFS e `Input True Peak` de até -1 dBTP. A normalização em um passo pode ficar um pouco abaixo do alvo, principalmente em vídeos curtos; se ficar, repita o primeiro comando com `I` ajustado pela diferença (resultado de -15,5 pede `I=-12.5`).

## 4. Verificações no arquivo final

```bash
# Telas pretas de meio segundo ou mais, e silêncios de dois segundos ou mais. Nada na saída é o esperado.
ffmpeg -hide_banner -nostats -i out/<vídeo>.final.mp4 -vf blackdetect=d=0.5 -af silencedetect=noise=-50dB:d=2 -f null - 2>&1 | grep -E "black_start|silence_start"

# Folha de contato: um quadro a cada 10 segundos.
ffmpeg -y -i out/<vídeo>.final.mp4 -vf "fps=1/10,scale=480:-1,tile=6x10" -frames:v 1 out/<vídeo>.sheet.png

# As medidas de imagem e movimento do arquivo final, contra a referência.
pnpm critique out/<vídeo>.final.mp4
```

Abra a folha de contato e percorra o vídeo inteiro com os olhos: alguma cena vazia, repetida, com texto cortado ou fora do estilo? Confira também se a duração do arquivo bate com a soma das cenas da narração, e se as medidas do `critique` continuam as da animação aprovada.

Você não assiste nem ouve o vídeo. Diga isso ao usuário com clareza: as verificações acima pegam defeitos grosseiros, e o julgamento de ritmo, voz e música é dele.

## 5. Terceira aprovação

Entregue ao usuário:

- o caminho de `out/<vídeo>.final.mp4`, com duração e volume medidos;
- o que foi verificado e o que só ele pode verificar;
- a lista de fontes de `research.md`, pronta para a descrição do vídeo.

Lembre-o de três pontos na hora de publicar. A narração é uma voz sintética clonada, e o YouTube tem regras de divulgação de conteúdo sintético que mudam com frequência: ele deve conferir a regra vigente antes de marcar o vídeo. Os pesos do OmniVoice, que gera a narração, são de uso não comercial (CC-BY-NC): monetizar um vídeo narrado com ele foge da licença, e trocar de modelo depois não muda os vídeos já publicados. E conteúdo repetitivo, com cara de produção em massa, não monetiza: o que protege o canal são as três aprovações, a voz e a identidade visual próprias.

Peça a aprovação explicitamente. Com ela, o vídeo está fechado.
