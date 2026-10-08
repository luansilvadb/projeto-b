# Tasks

## 1. Rosto e referência visual

- [x] 1.1 Refinar o rosto detalhado em `src/art/Person.tsx` a partir de `reference.png`: preservar a escala dos olhos e das pupilas, já correspondente à referência, e acrescentar pálpebras suaves, sobrancelhas expressivas, nariz discreto e sorriso acolhedor, com bochechas sem rubor decorativo permanente e sombra sob a franja preservada. Conferir um recorte renderizado do estado sonolento ao lado da referência, mantendo cabeça, cabelo, topete, corpo e identidade das cores; preservar o conteúdo local já alterado.
- [x] 1.2 Ampliar `PersonSheet.tsx` e a duração da composição `pessoa` em `Root.tsx` para mostrar os oito estados faciais, o olhar e a piscada, conservando as poses e a silhueta existentes. Renderizar e abrir os quadros em `out/rascunho/melhorar-rosto-personagem/`; conferir leitura em close e em escala de cena, sem vazamentos de pupila, perda de expressão ou colisões com a franja.
- [x] 1.3 Atualizar `src/videos/why-we-sleep/art.md` com a referência escolhida, o rosto refinado e o alcance desta decisão sobre a restrição do piloto anterior. Conferir que o texto continua preservando as decisões de corpo, elenco e paletas e aponta para a referência desta mudança.

## 2. Olhar e marcas sobre o rosto

- [x] 2.1 Acrescentar direção opcional do olhar ao desenho compartilhado e passar a ele o destino hoje usado por `Gaze` em `Gardner.tsx`, removendo a reconstrução redundante dos olhos. Conferir na folha e em um trecho renderizado de `awake-record` que o destino do olhar é legível e que a piscada usa os mesmos olhos; sem direção explícita, preservar o olhar de cada expressão. Atualizar os comentários que descrevem essa integração.
- [x] 2.2 Remover `TiredEyes` e os parâmetros usados apenas para desenhar sombras sob os olhos em todas as aparições da pessoa e de Gardner. Conferir quadros de `gardner-hours`, `biggest-mistake` e `sleep-debt`: nenhuma cena mantém essas sombras; irritação não mostra boca duplicada, a cor nas bochechas aparece apenas nos estados definidos e não encobre nariz ou olhos, e óculos continuam alinhados. Preservar o cansaço nas pálpebras e na postura, além das cores de estado e dos tempos existentes.
- [x] 2.3 Conferir a mudança de sono na mesa do café e a figura deitada em `gardner-sleeps` em trechos renderizados, corrigindo apenas integrações afetadas em `CoffeeTable.tsx` ou `Bed.tsx` se necessário. Verificar que rosto e marcas seguem inclinação, escala e recuperação; registrar na ficha visual a solução final das marcas quando mudar sua aparência.

## 3. Conferência integrada

- [x] 3.1 Executar `pnpm lint` e `pnpm test` e registrar o resultado, distinguindo eventuais falhas preexistentes das introduzidas pela mudança. Usar a folha e os renders para julgar aparência, sem criar testes que apenas espelham coordenadas do SVG. **Resultado:** lint aprovado; 242 testes passaram (224 Vitest, 12 de narração e 6 de música), sem falhas.
- [x] 3.2 Renderizar as cenas afetadas com `pnpm scene why-we-sleep third-of-life awake-record gardner-hours gardner-sleeps biggest-mistake sleep-debt unknown-cause tonight`. Abrir quadros em escala real e assistir aos trechos de piscada, olhar e mudança de estado; conferir a referência positiva, identidade da pessoa e de Gardner, nariz, ausência de rubor permanente e de sombras sob os olhos, sombra na testa preservada para o personagem principal e removida para o pesquisador grisalho, cor de estado, boca, óculos, figurantes simplificados e continuidade das ações.
- [x] 3.3 Revisar o diff desta mudança e apresentar os recortes e caminhos dos trechos conferidos. Verificar que a ficha e a folha correspondem ao rosto em uso, que roteiro e tempos não mudaram e que não há versão alternativa de desenho nem perda das edições locais anteriores.
