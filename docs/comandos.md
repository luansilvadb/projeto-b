# Comandos

`<vídeo>` é o nome da pasta em `src/videos/`, que é também o id da composição no Remotion e o primeiro argumento de todo script.

```bash
pnpm dev                      # Remotion Studio
pnpm lint                     # eslint src scripts && tsc
pnpm test                     # vitest + pytest de tools/narration e de tools/music

pnpm vitest run src/narration/script.test.ts        # um arquivo de teste
pnpm vitest run -t "nome do teste"                  # um teste pelo nome
uv run --project tools/narration pytest tools/narration/test_pitch.py -q   # um teste Python
uv run --project tools/sound pytest tools/music -q   # os de tools/music rodam no ambiente de tools/sound

pnpm check-script <vídeo>     # valida script.json
pnpm narrate <vídeo>          # gera a narração (frases já geradas vêm do cache)
pnpm voice <vídeo>            # estúdio de voz: escolher tomadas de ouvido
pnpm stills <vídeo> [quadros] # PNGs em out/<vídeo>/stills/; sem quadros, um por plano
pnpm critique <vídeo|arquivo> [animatic|som]   # mede o render (ou o som dele) contra a faixa dos vídeos de referência
pnpm music <vídeo> [semente]  # trilha
pnpm scene <vídeo> <id> [id...]   # renderiza só essas cenas, em out/<vídeo>/cenas/<id>.mp4
pnpm join <vídeo>             # o vídeo inteiro, das cenas já renderizadas e do som: out/<vídeo>/<vídeo>.mp4
pnpm render <vídeo> out/<vídeo>/<vídeo>.mp4   # o vídeo inteiro de uma vez, em cerca de meia hora
pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3   # só o som (voz, trilha e efeitos), em minutos
```

Também existem `pnpm eval:voice` (compara a configuração da voz com variações dela em 16 frases fixas) e `pnpm sfx "<busca>"` / `pnpm sfx <id>` (lista e baixa efeitos CC0 do Freesound).

## O que cada comando pressupõe

- `pnpm critique <vídeo>` lê `out/<vídeo>/<vídeo>.mp4`, então pede um `pnpm join` (ou um `pnpm render`) antes; com `animatic`, as medidas de movimento ainda não valem. Medida fora da faixa não é erro do comando: ele só falha quando não consegue medir. Com `som`, separa o áudio em voz, música e efeitos na GPU e guarda a separação em `som/<nome>/`, ao lado do arquivo medido: apague a pasta para medir de novo um arquivo que mudou.
- `pnpm sound` tem configuração própria (`remotion.sound.config.ts`), porque a de `remotion.config.ts` fixa o h264 e recusa uma saída em mp3.
- `pnpm render` não dá o arquivo de entrega: `out/<vídeo>/<vídeo>.final.mp4` sai do ffmpeg com `loudnorm`, no passo a passo de `.agents/skills/diretor-producao/etapas/corte-final.md`, que também dá o `out/<vídeo>/<vídeo>.jam.mp4` quando o evento do briefing pede outra especificação.
- O Vitest só inclui `src/**/*.test.ts` e `scripts/**/*.test.ts`; sem isso rodaria os testes das ferramentas clonadas em `vendor/`.
- `pnpm setup:tools` baixa cerca de 20 GB de modelos; `pnpm narrate`, `pnpm music` e `pnpm render` usam a GPU e levam minutos. `pnpm sfx` é o único comando que depende de serviço externo (`FREESOUND_API_KEY` no `.env`).

## Validação

- Código mudou desde a última validação: rode `pnpm lint` e `pnpm test`.
- Artefato de vídeo mudou: use o comando que o confere, na tabela de trabalhos do `README.md` (por exemplo `pnpm check-script` para o roteiro).
- Comportamento mudou: os testes e a documentação dele (README, `docs/`, `etapas/`) mudam junto.
- O `tsc` roda com `noUnusedLocals`: uma variável ou um import sem uso derruba o `pnpm lint`.

## Dependências

- As versões de `remotion` e `@remotion/*` são fixas e iguais; atualize só com `pnpm run upgrade`. Exceções em `minimumReleaseAgeExclude` de `pnpm-workspace.yaml` eventualmente geradas pelo upgrade devem se limitar às versões necessárias; remova as entradas obsoletas.
- O Dependabot ignora o Remotion por isso, e separa `torch` e `torchaudio` num PR à parte, porque mudam a voz gerada e pedem teste na GPU.
