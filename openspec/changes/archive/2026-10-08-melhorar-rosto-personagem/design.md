# Design

## Context

Ver `proposal.md` para a motivação e `specs/shared-drawings/spec.md` para o comportamento esperado. `reference.png` é a imagem escolhida pelo usuário, não um exemplo do defeito atual.

`Person.tsx` concentra a construção, as expressões e as piscadas. O rosto foi refinado com a referência; o rubor decorativo das bochechas foi removido, a sombra sob a franja foi mantida no personagem principal a pedido do usuário e as sombras sob os olhos foram retiradas de todas as aparições da pessoa e de Gardner. Para o pesquisador de cabelos grisalhos, a sombra sob a franja também foi removida conforme a revisão visual mais recente. O cansaço continua expresso pelas pálpebras e pela postura. `Gardner.tsx` usa o desenho compartilhado dos olhos e cobre a boca em `FaceMarks`; essa camada mantém a cor de bochecha somente quando um estado a pede. A folha `pessoa` mostra cinco poses, mas não todos os estados faciais.

O compromisso de outubro de 2026 em `art.md` conservava o rosto no piloto anterior para proteger essas integrações. O pedido atual autoriza refiná-lo; essa restrição precisa ser atualizada na ficha durante a implementação, conservando os demais compromissos. Há alterações locais em `Person.tsx`, `Gardner.tsx` e `CoffeeTable.tsx` que precisam ser preservadas.

## Goals / Non-Goals

**Goals:** usar a construção facial existente para aproximar o desenho da referência e manter uma só fonte do olho, inclusive quando o olhar se dirige a um objeto. Conferir a expressão no tamanho final e as integrações em movimento.

**Non-Goals:** substituir SVG por imagem raster, criar outro personagem ou uma opção de acabamento, redesenhar cabelo ou corpo, alterar os tempos de atuação ou transformar os figurantes de dois pontos em protagonistas detalhados.

## Decisions

### 1. Refinar o rosto no desenho em uso

Editar olhos, pálpebras, sobrancelhas e boca de `Person.tsx`, acrescentando um nariz pequeno com as cores de pele existentes. Manter a caixa da figura, a silhueta da cabeça, sua articulação, `facePose` e os pontos de inserção no corpo. Relações internas do rosto podem mudar para atingir a referência; os óculos acompanham essas relações. As sombras sob os olhos são removidas em todas as aparições da pessoa e de Gardner.

Alternativa descartada: uma variante para Gardner ou uma composição que depois substitua o rosto antigo. Isso duplicaria o desenho e contrariaria a construção única já especificada.

### 2. A referência governa o acabamento facial

Usar a imagem para orientar tamanho aparente dos olhos e pupilas, peso das sobrancelhas, suavidade das pálpebras e nariz. O usuário removeu o rubor decorativo permanente das bochechas, pediu para manter a sombra sob a franja no personagem principal e, depois, para removê-la no pesquisador de cabelos grisalhos. A paleta `sleepResearcher` usa o tom da pele nessa faixa para removê-la sem alterar o rosto compartilhado. As sombras sob os olhos saíram de todas as aparições da pessoa e de Gardner. Cores de estado continuam em `FaceMarks` quando a encenação de Gardner as pede. O estado sonolento conserva a intenção acolhedora acordada; boca e sobrancelhas dos outros estados continuam dizendo o que sua cena pede.

Manter curvas e preenchimentos simples. Ajustes sutis de suavidade facial são aceitáveis para atingir a referência, mesmo onde a orientação geral prefere chapado. Não aplicar acabamento ao corpo nem acrescentar halo, textura ou contorno decorativo. Os tons vêm de `PersonColors`; se necessário, ajustar apenas tons faciais em `palette.ts`, conservando os papéis e a identidade de cada paleta.

Alternativa descartada: copiar a pintura inteira da imagem, incluindo roupa, cabelo e fundo. Ela mudaria decisões que não fazem parte do pedido.

### 3. O olhar direcionado usa os olhos da pessoa

Acrescentar a `Person` uma entrada opcional para direção do olhar, nas mesmas unidades normalizadas já usadas pelo desenho. Sem ela, vale o olhar da expressão. Gardner passa seu destino de olhar ao desenho e deixa de usar `Gaze` para reconstruir o globo e a pálpebra. A mesma piscada cobre a pupila e seu brilho dentro do recorte do olho.

Remover `TiredEyes` e suas entradas de cena, para que nenhuma aparição da pessoa ou de Gardner desenhe sombras sob os olhos. Para `FaceMarks`, compartilhar apenas as medidas realmente necessárias da boca e das bochechas, ou corrigir a integração diretamente se ela não repetir cálculo variável. Não criar um sistema genérico de rig facial. Conservar cansaço nas pálpebras e na postura, além da irritação, da cor de estado e das deixas que os consumidores já passam.

Alternativa descartada: atualizar duas implementações de olhos. A próxima mudança de proporção voltaria a produzir divergência, inclusive durante a piscada.

### 4. Conferir o rosto, depois as integrações

Ampliar a composição `pessoa` existente para cobrir os oito estados e uma amostra de piscada/olhar, preservando a conferência de silhueta e poses. Usar quadros dessa composição em `out/rascunho/melhorar-rosto-personagem/`, incluindo close e escala de cena, e comparar o rosto sonolento com `reference.png`.

Conferir trechos de `third-of-life` (pessoa), `awake-record` (olhar), `gardner-hours` (sintomas, café e cansaço), `gardner-sleeps` (cama e recuperação) e `biggest-mistake` (óculos). Os renders usam `pnpm scene` e seus caminhos fixos. Abrir quadros e assistir aos trechos de piscada e mudança de estado. O desenho não é aprovado por testes de coordenadas ou por uma medida de semelhança automática.

Alternativa descartada: validar só um close estático. Ele não mostra o retorno de olhos antigos, o desalinhamento das marcas ou a perda de expressão no plano aberto.

## Risks / Trade-offs

- Olhos maiores podem encostar na franja ou nos óculos → limitar a mudança ao espaço facial disponível e conferir espanto e piscada.
- Mudança da boca pode fazer a máscara de irritação encobrir o nariz ou revelar a boca anterior → conferir `FaceMarks` após posicionar o nariz e corrigir sua área de cobertura.
- Suavidade que funciona no PNG pode desaparecer ou parecer borrada no vídeo → conferir os recortes também no MP4, na escala real.
- Rosto sonolento tomado como padrão pode apagar os outros estados → manter a intenção de cada expressão e conferir todas na folha.
- Alterações locais já existentes podem ser sobrescritas → trabalhar sobre o conteúdo presente e revisar apenas o diff desta mudança.

## Migration Plan

Aplicar o ajuste no lugar, retirar a reconstrução redundante dos olhos e atualizar a ficha e a folha. Não há migração de dados nem geração obrigatória de voz ou música. Rodar `pnpm lint`, `pnpm test` e a conferência visual dos trechos afetados. A reversão usa o diff específico desta mudança, preservando edições locais anteriores; não requer uma segunda versão do desenho.
