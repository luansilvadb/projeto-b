# Design

## Context

Ver `proposal.md` — Why. Esta é a segunda varredura; a primeira (`poda-do-excesso`) já registrou a regra de que export, flag e prop sem consumidor saem. O que escapou então foi o helper `Sooner` (uma cópia literal e uma reescrita) e props opcionais que nenhuma chamada passa — o `tsc` roda com `noUnusedLocals` e barra o que é local, mas prop e export não usados não são erro de tipo. O design precisa decidir como consolidar o `Sooner` sem mudar quadro nenhum.

## Goals / Non-Goals

**Goals:**

- Aplicar os 7 cortes do proposal sem mudança de comportamento, com `pnpm lint` e `pnpm test` verdes.
- Deixar registrado por que cada corte é seguro, para o "antes" não voltar por engano.

**Non-Goals:**

- Reorganizar módulos, renomear APIs ou mover os helpers compartilhados de `scenes/` para `parts/`.
- Mexer em roteiro, arte, voz, trilha, efeitos, cenas renderizadas ou specs de comportamento.

## Decisions

**1. O `Sooner` compartilhado ganha os dois extras; as cópias locais saem.** O corpo neutro do compartilhado (`by` puro, sem `backdrop` nem `late`) já é idêntico ao das duas cópias, então os nove consumidores atuais não mudam de quadro; o branch "sem argumentos" do `enter` (que hoje só o fundo do `TimeToFixScene` usa) e o `late` da saída passam a valer só quando as props novas são passadas. Alternativa considerada: manter as duas versões locais; recusada, porque a única diferença são esses dois extras e a fórmula é a mesma — exatamente o caso do `shake` na poda anterior.

**2. Props mortas: apagar, não deixar "por via das dúvidas".** `Backdrop` fica só com o degradê padrão, `SlowPush` com `from = 1`, `Cast` sem `drift`, `Grain` com `0.14` e `Pop` com `POP_SECONDS`; os valores padrão passam para o corpo. Nenhuma chamada muda: quem não passava a prop recebia o padrão.

**3. Export sem consumidor externo: tirar só o `export`.** `Hasten`, `risenAt`, `AntelopeProps` e `MUSIC_LEVELS` continuam nos próprios arquivos (são usados lá dentro); o que sai é a superfície pública.

**4. A ordem dos cortes é por item, um commit cada.** Igual à poda anterior: cada sobra pode ser desfeita sozinha.

## Risks / Trade-offs

- [O `Sooner` compartilhado mudar os nove consumidores] → O corpo neutro é idêntico ao atual; a conferência inclui `pnpm scene why-we-sleep biggest-mistake time-to-fix` e uma cena que importa o de `MaybeBrainScene`.
- [Alguma cena futura querer a prop removida] → Volta como implementação nova quando existir o uso, não como prop morta agora.
- [Corte de conteúdo por engano] → Cada corte tem `git grep` limpo no proposal; nada de arte, roteiro ou som é tocado.

## Migration Plan

Não há migração: um commit por item, sem mudança de formato, mídia ou tempo de fala.
