# Design

## Context

Ver `proposal.md` — Why. O corte é de código e configuração, sem comportamento novo; o que o design precisa decidir é o que fazer quando não há consumidor (apagar ou reusar), como garantir que o corte não esconde uma regressão e o que fica fora. O `tsc` roda com `noUnusedLocals`, então variável e import sem uso já não passam no lint: o que escapa são exports, flags, configs e dependências.

## Goals / Non-Goals

**Goals:**

- Aplicar os 12 cortes do proposal sem mudança de comportamento, com `pnpm lint` e `pnpm test` verdes.
- Deixar registrado por que cada corte é seguro, para o "antes" não voltar por engano.

**Non-Goals:**

- Mexer em roteiro, arte, voz, trilha, efeitos, cenas renderizadas ou specs de comportamento.
- Reorganizar módulos, renomear APIs ou trocar dependências por outras.

## Decisions

**1. Sem consumidor: apagar; com equivalente no repositório: reusar.** Os itens 1, 2, 3, 6, 8 e 11 saem sem substituto (grep no repositório inteiro, incluindo testes, não acha consumidor). Os itens 5, 7, 9 e 12 trocam por `timing.shake`, `timing.drop`, `pitch.semitones_between` e `clamp01` já existentes — mesmas fórmulas, então nenhum quadro muda. Alternativa considerada: manter o código "por via das dúvidas"; recusada, porque é exatamente o que a auditoria mostrou que engana quem lê.

**2. O teste de contraste continua guardando a paleta.** O item 4 não apaga o teste: `luminance`/`contrastRatio` passam para dentro de `contrast.test.ts`, que é o único consumidor. Alternativa considerada: apagar os dois; recusada, porque as asserções de leitura do texto (WCAG) são a prova de que a paleta funciona.

**3. `@types/web` sai com prova, não por suspeita.** O design fixa a verificação: `tsc --noEmit --types node,react` precisa passar antes de mexer no `package.json` (já passou na auditoria); depois de tirar a dependência, `pnpm install` e `pnpm lint` de novo. Se o `tsc` sem o override quebrar, a dependência volta e o item sai do escopo. Alternativa considerada: deixar; recusada, porque ninguém a referencia.

**4. `prettier` sai, com premissa registrada.** Nenhum script, plugin do ESLint ou config do repositório o invoca; o `.prettierrc` sozinho é do editor, que traz a própria versão. Premissa: ninguém formata pelo binário do projeto. Reverter é readicionar a devDependency.

**5. A ordem dos cortes é por arquivo, não pela numeração do proposal.** Um commit por item da lista, na ordem da auditoria, para cada corte poder ser desfeito sozinho; os itens 10 e 11 (dependências) ficam no mesmo commit do `package.json`.

## Risks / Trade-offs

- [O `tsc` global aceitar o `@types/web` por outra dependência] → A prova é o `--types` explícito; se `pnpm lint` passar depois de remover e reinstalar, está resolvido.
- [Alguém no futuro querer varredura de novo no `Shot`] → `score.md` diz que as varreduras saíram; se voltarem, voltam como implementação nova, não como prop morta.
- [O `prettier` fazer falta para quem usa o editor] → Reverter é readicionar a devDependency; a premissa fica no commit.
- [Corte de conteúdo por engano] → A conferência inclui `pnpm scene why-we-sleep` de uma cena com `Herd` e uma com `ShopFront`, comparando quadro a quadro com o render atual.
