# Proposal

## Why

O usuário quer melhorar o rosto da pessoa do `why-we-sleep` tomando a imagem enviada como referência do resultado desejado. O desenho atual tem olhos menores em relação à cabeça, sobrancelhas retas e nenhum nariz; o objetivo é aproximar sua expressão e seu acabamento da referência, mantendo o personagem reconhecível e capaz de atuar.

## What Changes

- Refinar o rosto compartilhado: olhos grandes com pupila escura e brilho, pálpebras suaves, sobrancelhas expressivas, nariz discreto e boca pequena, sem rubor decorativo permanente nas bochechas; manter a sombra sob a franja no personagem principal e removê-la no pesquisador grisalho.
- Remover as sombras sob os olhos de todas as aparições da pessoa e de Gardner; comunicar o cansaço pelas pálpebras e pela postura.
- Usar o rosto sonolento da imagem como referência positiva; adaptar essa construção aos outros estados já usados no vídeo, sem impor sono às cenas de curiosidade, espanto ou leitura.
- Manter cabeça, cabelo, topete, corpo, paletas e ações existentes. A roupa framboesa e o cabelo castanho da referência não recolorem a pessoa de azul.
- Fazer olhar direcionado, piscadas, marcas de estado e óculos acompanharem o novo rosto, sem um desenho alternativo por cena.
- Atualizar a ficha visual e a folha de modelo e conferir o resultado em cenas reais e em movimento.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `shared-drawings`: acrescentar o compromisso visual do rosto da pessoa baseado na referência e sua continuidade entre expressões e sobreposições.

## Impact

- Desenho: `src/art/Person.tsx`, `src/videos/why-we-sleep/parts/Gardner.tsx` e o retrato em `src/videos/why-we-sleep/parts/SyllableList.tsx`.
- Conferência e documentação: `src/videos/why-we-sleep/PersonSheet.tsx` e `art.md`; `palette.ts` apenas se for necessário ajustar os tons faciais dentro dos papéis existentes.
- Consumidores a conferir: `parts/Bed.tsx`, `parts/CoffeeTable.tsx`, cenas da pessoa, de Gardner e figurantes com óculos ou rosto simplificado.
- Referência de planejamento: `reference.png`, cópia da imagem enviada, junto desta proposta.
- Sem novas dependências, mudança de roteiro, narração, trilha ou duração. Preservar as alterações locais que já existem nos arquivos afetados.
