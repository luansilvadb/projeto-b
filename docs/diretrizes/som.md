# Efeitos e música

Critérios para o som além da voz. O mapa de som de cada vídeo fica em `src/videos/<vídeo>/sound.md`; o procedimento, em `.agents/skills/diretor-de-som/` e `.agents/skills/diretor-producao/etapas/efeitos-sonoros.md`.

## Efeitos sincronizados com a imagem

- **No instante do acontecimento.** O efeito começa no quadro em que a ação se dá: o contato, no contato; o movimento, no começo do movimento. Nunca antes, e com atraso de no máximo dois quadros. Conferência: extraia do render o quadro em que o efeito começa e o anterior; a ação está começando ou acabou de começar nele, e não tinha começado dois quadros antes. Se a fala muda de tempo, o efeito segue o quadro da ação, não a palavra (a moeda de `awake-record` soa quando bate).
- **Ação que se repete, som que se repete.** Cada repetição tem o som dela, do mesmo uso, no instante dela: os três jatos da água-viva em `jellyfish-debt` são três sons; o carimbo de `sleep-debt` e o de `biggest-mistake` usam o mesmo som do catálogo.
- **Acontecimento físico tem consequência sonora.** Toda ação da partitura com consequência física que se percebe (impacto, objeto ou corpo agindo com força, mudança de estado do cenário, onomatopeia na tela) tem um efeito, ou o motivo de ficar sem som registrado no mapa de som. Uma onomatopeia ("PSSST", "SNIP", "PLOFT", "TRIIIM") soa no quadro em que aparece. Nenhum efeito fica sem dono: cada um aponta para uma ação que a imagem mostra, e nenhum marca corte, texto que só entra ou movimento de câmera.
- **Som com o tamanho da ação.** O usuário ouve o som como a ação que ele acompanha antes de entrar no catálogo. Um uso sem som aprovado fica pendente no mapa, sem efeito, e nunca é coberto por um som de outro acontecimento (o jato de água não usa a queda na água do catálogo).

## Música

- **Bem abaixo da fala.** A mixagem aplica pelo menos 17 dB de distância entre os volumes medidos da trilha e da voz, em todo o vídeo, inclusive desde o primeiro quadro; a distância final é a que o usuário aceitar de ouvido e pode ser maior. O piso de 17 dB é decisão explícita do usuário (2026-10-08), que preservou a música atual. As medidas de `pnpm critique <vídeo> som` são sensores, não substituem aplicar o nível nem ouvir: uma leitura abaixo de 14 dB num trecho é investigada contra o nível aplicado, a janela de três segundos e os silêncios de fala autorizados; dúvida de presença que reste vai ao ouvido do usuário, e erro de aplicação é corrigido.
- **Efeito acima da música.** Um efeito de nível normal soa mais perto da voz do que a música que toca por baixo dele.
- **Uma identidade só.** As partes geradas da trilha soam como a mesma música: mesmo caráter, timbres e tom, e a variação de timbre do vídeo inteiro mede dentro da faixa de um vídeo só. Uma parte recusada de ouvido é gerada de novo com a identidade da parte aceita (no `why-we-sleep`, o primeiro leito até `so-far` reconhece a música aprovada de `but-what` ao fim).
- **Onde aparece e onde some.** A música vai ao primeiro plano só nos silêncios de fala de dois segundos ou mais que o roteiro pediu (a vinheta nos seis segundos depois da pergunta do gancho, voltando ao fundo quando a fala recomeça) e some nos trechos que o mapa de som marca como silêncio de música (não há música por baixo da resposta, em `so-far`).
