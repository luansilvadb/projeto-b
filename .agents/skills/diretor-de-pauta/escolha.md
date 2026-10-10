## PERGUNTA
Qual tema ganha entre os candidatos medidos, e o que fica registrado?

## RESPOSTA

**Um corte fixo.** Sai o candidato com o menor nível de volume, depois de medida a versão curta quando a oferta dele é forte (`medida`). Nenhum outro número mínimo: a comparação é entre os candidatos, lado a lado.

**Ordem de peso (proposta, de 2026-10-10; vira regra quando um vídeo escolhido por ela for publicado e render, e sai se não render):**

1. **Views dos vídeos que já respondem o termo**, contados só os do nicho.
2. **Ponto fora da curva de canal pequeno.**
3. **Volume e competição do painel.**
4. **Brecha no formato.**
5. **Desempate:** encaixe na trupe por dentro e reaproveitamento de desenhos.

As views vêm antes da nota do painel porque a nota mede a busca, e as views, quanto o assunto rende: um candidato com cinco pontos a menos e quatro vezes mais views pode levar a recomendação, com a razão dita.

**Base, conferida antes de apresentar.** Para cada finalista, uma busca rápida responde a uma pergunta: a resposta central é estabelecida (revisão, livro-texto), ou é disputa? É conferência leve: não abre `research.md` nem registra fonte por afirmação, que é trabalho do `diretor-criativo`. O finalista de base disputada no centro sai pelo `nicho`.

**Finalistas.** De dois a quatro, numa tabela com termo, views (máxima e faixa), ponto fora da curva, volume, competição, formato dos resultados e base. Depois a recomendação, com o motivo em uma ou duas frases, e o recorte possível, se houver, marcado como não pesquisado. O usuário escolhe; nada é criado antes da resposta.

**Registro.** Com a escolha, crie `src/videos/<vídeo>/pauta.md`:

```markdown
# <tema>

- Termo buscado: <o termo que o título vai carregar>
- Escolhido em: <data>
- Motivo: <uma ou duas linhas; recorte possível, se anotado, marcado como não pesquisado>

## Medições

| Termo | Data | Volume | Competição | Views máx. | Views méd. | In Title | Fora da curva | Formato | Base |
|---|---|---|---|---|---|---|---|---|---|

## Finalistas que perderam

<a mesma tabela, com uma coluna a mais: por que perdeu; abaixo dela, em lista, os descartados antes da final, cada um com o motivo, para a próxima escolha não medi-los de novo à toa>

## Trocas

<vazio até um tema cair>
```

O nome da pasta é curto, em inglês, e diz o tema (`why-we-sleep`). Vídeo escolhido antes desta skill fica sem `pauta.md`: nenhum é escrito de trás para frente.

**Quando o tema cai.** Se o `diretor-criativo` relata que nenhum recorte honesto se sustenta no tema inteiro, apresente ao usuário o próximo finalista de `pauta.md`, já medido. Com o aceite dele: anote em "Trocas" o tema que caiu, a data e o motivo; passe o novo para o cabeçalho; renomeie a pasta. O `research.md` antigo vai junto só se servir ao tema novo. Um recorte que cai com o tema de pé não volta para cá.

## DEPENDÊNCIAS
- medida: fornece os números e diz quais não valem.
- nicho: reprova o finalista de base disputada no centro.

## LIMITES
- A troca de tema e a escolha entre finalistas são do usuário; o descarte pelo nicho e pelo corte de volume é do agente, com o motivo dito.
- A tabela não ganha coluna de nota composta: somar medidas de fontes diferentes esconde qual delas decidiu.
