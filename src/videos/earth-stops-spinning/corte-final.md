# Corte final: earth-stops-spinning

Notas do corte final deste vídeo, movidas do acréscimo que a delegação anterior fez em `.agents/skills/diretor-producao/etapas/corte-final.md` (revertido). Não mudam critério da skill: o alvo continua -14 LUFS (faixa de -15 a -13) e pico verdadeiro de até -1 dBTP, e a duração do arquivo continua a bater com a soma das cenas da narração.

Este documento não registra escuta, aceite nem conclusão do corte: o que só o usuário julga (voz, música, ritmo, efeito no instante que se percebe) segue como dúvida de ouvido.

## Desvios do fluxo original

- **Pico com o `loudnorm` de um passo.** No comando do passo 3 (`loudnorm=I=-14:TP=-1.5:LRA=11`), o `loudnorm` dinâmico passou do `TP` pedido. Com `TP=-1.5` e com `TP=-2.5`, a medição deu -0,8 dBTP nas duas, acima do limite de -1 dBTP. Tratamento usado: ganho e limitador sobre o `.mp4`, e medir de novo.

  ```bash
  ffmpeg -i out/earth-stops-spinning/earth-stops-spinning.final.mp4 -c:v copy -af volume=<dB>,alimiter=limit=0.708:level=disabled -ar 48000 -c:a aac -b:a 256k <saída>.mp4
  ffmpeg -hide_banner -nostats -i <saída>.mp4 -vn -af loudnorm=print_format=summary -f null -
  ```

  `<dB>` é o ganho negativo que leva o pico medido para até -1 dBTP; `limit=0.708` equivale a -3 dBFS de teto linear do limitador.
- **Duração.** Além da duração do arquivo, a conferência foi feita em quadros (`nb_frames` e `-count_packets` do vídeo, contra a soma dos quadros da narração) e do áudio contra a imagem. A duração do contêiner pode somar o preenchimento do AAC e passar da imagem em dezenas de milissegundos sem deslocar nada.

## O que as verificações não provam

- **Escuta.** Loudness, pico, `silencedetect`, as séries do `pnpm critique som` e uma transcrição do áudio provam duração, nível, truncamento e presença de fala. Não dizem se a voz soa certa, se a música cansa nem se o efeito cai no instante que se percebe.
- **Quadros consecutivos.** Tiras e folhas de contato mostram a ordem e o conteúdo dos planos, não o ritmo; movimento, aceleração e o intervalo entre acontecimentos pedem o vídeo rodando, e a leitura em quadros tem a resolução do intervalo amostrado.
## Recomposição de 2026-10-11 (narração de 700,87 s)

Evidência medida nesta rodada. Nada disto é escuta: voz, música e efeitos continuam dúvida de ouvido do usuário; a auditoria independente do arquivo novo e os metadados vêm depois.

- **Cena corrigida.** `after-the-dust`, plano 2: a terra seca e as setas passaram a correr de "sai" a 0,5 s depois de "polos" (antes, tudo estava no lugar em 25,3 s e a imagem ficava parada até 27,9 s). Registro em `art.md` e `score.md`; render por `pnpm scene earth-stops-spinning after-the-dust`, 837 quadros; crítica independente (`critico-de-movimento`) sem trecho parado e sem defeito novo.
- **Atualidade das 29 cenas.** Os mtimes dos arquivos não serviram de prova (vários arquivos de narração têm data no futuro em relação ao relógio da máquina). As 29 cenas foram renderizadas de novo com `pnpm scene earth-stops-spinning <as 29>` (cerca de 17 min) e comparadas com as cópias de antes (`out/rascunho/cenas-antes/`) pelo `framemd5` do vídeo: 18 diferentes e 11 idênticas (`out/rascunho/comparacao.txt`). Diferentes (renders que estavam desatualizados): `one-turn`, `how-fast`, `feel-nothing`, `the-rule`, `you-too`, `not-to-space`, `wind`, `sea-moves`, `two-oceans`, `new-map`, `year-long-day`, `the-moon-case`, `why-not-stop` (309 para 308 quadros), `another-planet` (406 para 407), `corals` (767 para 768), `never` (1012 para 1011), `still-spinning` e `only-clue`. Idênticas: `switch-off`, `by-latitude`, `the-pole`, `the-bulge`, `water-piled`, `water-leaves`, `map-limit`, `not-the-moon`, `the-moon-brake`, `subscribe` e a própria `after-the-dust`. O render é determinístico (a `after-the-dust` renderizada duas vezes deu o mesmo vídeo), então a diferença é conteúdo antigo, e não ruído. Depois disso as 29 têm o número de quadros do manifesto: o `pnpm join` passou.
- **Trilha.** `music.json` e `music-2.wav` foram gerados de novo e entrou `music-3.wav` (ver `sound.md`): a parte B de 437 s só cobria até cerca de 689 s, e o encerramento novo pede 451 s dela, acima do limite de 440 s por faixa. A trilha ganhou uma terceira parte (`music.parts`, em `script.json`, a partir de `the-moon-case`) com a mesma descrição, bpm e tom. A parte A foi mantida (md5 igual ao de antes). Para gerar só B e C sem refazer a A, o `music.json` foi preparado com uma entrada provisória para a parte 3 antes de `pnpm music ... 1 2`; o `pnpm music ... 1 3` o reescreveu com os valores medidos.
- **Comandos e saídas.**
  - `pnpm check-script earth-stops-spinning`: saída 0.
  - `pnpm lint`: saída 0 (eslint e tsc).
  - `pnpm test`: saída 0 (vitest: 28 arquivos, 247 testes; pytest: 12 e 6).
  - `pnpm music earth-stops-spinning 1 2` e `pnpm music earth-stops-spinning 1 3`: saída 0.
  - `pnpm sound earth-stops-spinning out/earth-stops-spinning/earth-stops-spinning.som.mp3`: 21.026 quadros, 700,87 s.
  - `pnpm join earth-stops-spinning`: saída 0, `out/earth-stops-spinning/earth-stops-spinning.mp4` (675.513.324 bytes).
  - `pnpm critique out/earth-stops-spinning/earth-stops-spinning.som.mp3 som`: três medidas fora da faixa (música sob a fala 16,0 dB; efeitos 2,0 por minuto; pico do efeito 15,2 dB), escolhas já registradas em `sound.md`.
- **Volume.** O passo 3 de um passo (`loudnorm=I=-14:TP=-1.5:LRA=11`) deu -14,1 LUFS e -0,1 dBTP, acima do limite, como na nota "Desvios do fluxo original". Tratamento já descrito acima, sobre a saída do passo 3: `-af volume=-0.3dB,alimiter=limit=0.8:level=disabled`. Medido no `.final.mp4`: -14,5 LUFS integrados, -1,5 dBTP, LRA 3,4 LU. (Com `volume=-0.5dB,alimiter=limit=0.84`: -14,7 LUFS e -1,4 dBTP.)
- **Arquivo.** `out/earth-stops-spinning/earth-stops-spinning.final.mp4`: 680.917.025 bytes, sha256 `ea8d58205a60b3c59c2d6340339e11c6ae89012110149ed0eb07c1ffe9e2c168`, 1920x1080 a 30 quadros por segundo, h264 e aac 48 kHz, 21.026 quadros e 700,867 s de vídeo (`-count_packets` também 21.026), 700,900 s de áudio (os 33 ms a mais são o preenchimento do AAC) e 700,909 s de contêiner. O arquivo anterior (686,03 s) ficou em `out/rascunho/final-antigo.mp4`.
- **Verificações no arquivo.** Decodificação inteira (`ffmpeg -i ... -f null -`): saída 0, sem linha de erro. `blackdetect=d=0.5` e `silencedetect=noise=-50dB:d=2`: nenhuma ocorrência. Média de áudio por segundo no fim: -16,4 dB em 690 s, -16,7 em 694 e 697 s, -19,0 em 699 s e -32,8 em 700 s (saída final).
- **Não feito aqui.** Checagem de fatos (só a frase final de `the-moon-brake` pede reteste científico na auditoria de fechamento), folha de contato percorrida, `pnpm critique` de imagem do arquivo novo e a escuta.

## Troca só da imagem, para a correção da faixa do chibi (2026-10-11)

Correção exclusivamente visual: `warm: none` em vigília e explorer (`palette.ts`) tira a faixa amarela que cortava a silhueta do chibi. Nada de som, narração, trilha ou roteiro mudou; o áudio não foi recodificado nem normalizado de novo.

- **Cenas.** 17 renderizadas de novo por `pnpm scene`: `one-turn`, `by-latitude`, `the-rule`, `you-too`, `the-pole`, `feel-nothing`, `how-fast`, `only-clue`, `still-spinning`, `water-piled`, `another-planet`, `not-to-space`, `switch-off`, `why-not-stop`, `wind`, `after-the-dust`, `subscribe`. `pnpm join` passou (saída 0): as 29 cenas batem com o manifesto, 21.026 quadros no total.
- **Montagem.** Imagem do `out/earth-stops-spinning/earth-stops-spinning.mp4` novo (saída do `pnpm join`) e o AAC do `.final.mp4` anterior, ambos por cópia: `ffmpeg -i <join>.mp4 -i <final-antigo>.mp4 -map 0:v:0 -map 1:a:0 -c copy -map_metadata 1 -movflags +faststart <saída>.mp4`. Sem `loudnorm`.
- **Áudio idêntico.** MD5 dos pacotes AAC copiados (`-c copy -f md5`) e do áudio decodificado, antes e depois: `4a29214362dc256ad340f7377a5f40a3` e `19584e44c213cc1de20d1fe2ebe2de0a`, nos dois. Mesmos `start_time` (vídeo 0,042667 s, áudio 0,000 s), duração do áudio (700,900 s), do contêiner (700,909 s) e 32.855 pacotes.
- **Arquivo.** `out/earth-stops-spinning/earth-stops-spinning.final.mp4`: 680.948.088 bytes, sha256 `6d8257630ee06dcb50f483eda8b7469092d62bab8d01298cf508b27e0927a0be`; 1920x1080 a 30 quadros por segundo, 21.026 quadros. O anterior (680.917.025 bytes, sha256 `ea8d5820...c168`) ficou em `out/earth-stops-spinning/backup-final-pre-faixa/`.
- **Verificação.** Decodificação inteira: saída 0, sem erro; `blackdetect=d=0.5`: nenhuma ocorrência, saída 0. Quadros 240 (8 s), 630 (21 s), 2385, 2914, 3638, 4577, 5230, 9350, 17395 e 20755 extraídos do arquivo final, em `out/rascunho/final-frames/` (`novo-*` e `antigo-*`): a faixa some no arquivo de entrega.
- **Não feito aqui.** Escuta, nem auditoria independente do arquivo final.
