## IDIOMA
- Responda em português do Brasil (pt-BR).

## PROJETO
- Vídeos educativos de ciência em motion graphics feitos em código (Remotion), produzidos em etapas com três aprovações do usuário.
- Leia o `README.md` antes de tocar em vídeo, etapa ou convenção: ele guarda a tabela das etapas (skill, comando, aprovação), o mapa das pastas e as convenções.

## CICLO
- Entender -> Construir -> Verificar -> Corrigir -> Entender. Vale para qualquer entrega; Construir, só para código.

## 1. ENTENDER
- Conteste antes de obedecer: abra a tarefa nomeando o que o usuário não pediu e precisa saber (premissa falsa, risco oculto, caminho melhor).
    - Muda o que será construído, ou é difícil de desfazer -> pare e pergunte; o usuário decide.
    - Nos outros casos -> declare a suposição e siga.
- Parta do que existe: antes de criar, procure o primitivo, o padrão ou o arquivo que já resolve, e use-o.
    - O padrão é a falha, ou o pedido diverge dele -> nomeie a divergência e ofereça os dois caminhos (mudar o padrão ou ajustar o pedido) antes de construir.
- Pronto quando: toda premissa e toda suposição foi dita e nenhuma decisão do usuário está pendente.

## 2. CONSTRUIR
- Escopo estrito: mude só o que a tarefa pede; a dívida técnica vista no caminho vai listada na entrega, para o usuário decidir.
- Simplicidade: padrões diretos e comprovados; o mínimo de arquivos, linhas e partes móveis; construa para a restrição de hoje.
- Completude: correção, tratamento de erro e casos de borda ficam inteiros, mesmo quando custam linhas.
- Comentários: explique o porquê (regra de negócio, trade-off não óbvio, workaround); o quê fica a cargo do código.

## 3. VERIFICAR
- Prove comportamento determinístico com testes; julgue o resto contra critério medível (medidas, quadros renderizados e lidos).
    - Código mudou -> `pnpm lint` e `pnpm test`.
    - Etapa de vídeo mudou -> o comando dela na tabela do `README.md`.
- Itere contra o resultado medido.
- Comportamento mudou -> os testes e a documentação dele mudam junto.
- Pronto quando: a entrega cita cada comando rodado e o que ele retornou; o que ficou de fora aparece como "não verificado", com o motivo.
- Passou -> entregue; falha ou reclamação -> Corrigir.

## 4. CORRIGIR
- Diagnostique antes de consertar: diga a causa, depois o conserto -> Verificar.
- Realinhe: a mesma reclamação voltou depois de um conserto -> o entendimento divergiu; pare, nomeie a divergência e pergunte qual leitura vale -> Entender.
- Conserte na fonte: após aprovação explícita, conserte o que produziu a falha (template, skill, unidade) e acrescente, sem esperar pedido, a verificação que a teria pegado, restrita a ela; relate -> Verificar. A fonte consertada é o próximo padrão.
