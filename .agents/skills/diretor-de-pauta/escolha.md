## PERGUNTA
Qual tema ganha entre os candidatos medidos, e o que fica registrado?

## RESPOSTA

Vale no modo `canal`. No modo `jam`, a escolha e o registro são de `premissa`; daqui só se usa "Quando o tema cai".

**Um corte, uma vez, antes do ranking.** Sai o candidato com o menor nível de volume entre os medidos, depois de medida a versão curta quando a oferta dele é forte (`medida`). O corte é aplicado uma única vez: sem novo limiar, sem descarte de grupo, sem repetir até sobrar um número. Se a medição não permitir apontar um único candidato de menor volume (empate, ou dado faltando), explicite a incerteza e não elimine por suposição. Nenhum outro número mínimo: a comparação é entre os candidatos, lado a lado.

**Ordem de peso sobre os remanescentes (proposta; vira regra quando um vídeo escolhido por ela for publicado e render, e sai se não render):**

1. **Views dos vídeos que já respondem o termo**, contados só os do nicho.
2. **Ponto fora da curva de canal pequeno.**
3. **Volume e competição do painel**: a mesma medição do corte, útil agora para comparar os restantes.
4. **Brecha no formato.**
5. **Desempate:** encaixe na trupe por dentro e reaproveitamento de desenhos.

As views vêm antes da nota do painel porque a nota mede a busca, e as views, quanto o assunto rende: entre os remanescentes, um candidato com cinco pontos a menos e quatro vezes mais views pode levar a recomendação, com a razão dita. Essa comparação não desfaz o corte.

**Base, conferida antes de apresentar.** Para cada finalista, uma busca rápida responde a uma pergunta: a resposta central é estabelecida (revisão, livro-texto), ou é disputa? É conferência leve: não abre `research.md` nem registra fonte por afirmação, que é trabalho do `diretor-criativo`. O finalista de base disputada no centro sai pelo `nicho`.

**Finalistas.** De dois a quatro, numa tabela com termo, views (máxima e faixa), ponto fora da curva, volume, competição, formato dos resultados e base. Depois a recomendação, com o motivo em uma ou duas frases, e o recorte possível, se houver, marcado como não pesquisado. O usuário escolhe; nada é criado antes da resposta, salvo delegação explícita (abaixo). O mínimo de dois não é aprovação extra: não afrouxa o nicho nem o corte, e um candidato reprovado não entra na tabela para completar a conta.

**Delegação.** Quando o usuário delega a escolha ("escolhe o tema", "você decide"), o agente escolhe o finalista recomendado sem nova confirmação. O registro leva a escolha por delegação, o motivo, a data e a frase em que o usuário delegou; as medições e os finalistas que perderam continuam no registro, como em qualquer escolha.

**Um sobrevivente, nenhum.** Com um único finalista, diga que há um só sobrevivente, sem inventar candidatos nem afrouxar o nicho ou o corte. Com delegação, ele pode ser escolhido se for válido e suficiente, e o registro anota a limitação (um só finalista, sem alternativa medida). Sem delegação, recomende nova rodada de sementes quando for viável; quando não for, leve o finalista único ao usuário como decisão real, com o motivo e a limitação. Com nenhum sobrevivente, nenhum reprovado é escolhido (`SKILL.md`, "Parada").

**Registro.** Com a escolha, crie `src/videos/<vídeo>/pauta.md`:

```markdown
# <tema>

- Termo buscado: <o termo que o título vai carregar>
- Quem busca espera: <o que a pessoa quer encontrar ao digitar o termo, com a evidência; ou "não levantado">
- Escolhido em: <data>
- Escolhido por: <o usuário | delegação do usuário: a frase em que ele delegou, e a data>
- Motivo: <uma ou duas linhas; recorte possível, se anotado, marcado como não pesquisado; com um só sobrevivente, a limitação dita>

## Briefing

<opcional: só quando o vídeo do canal tem prazo ou outro dado de partida; os campos de `briefing` que o usuário deu, com `Modo: canal`. Sem eles, a seção não existe>

## Medições

| Termo | Data | Volume | Competição | Views máx. | Views méd. | In Title | Fora da curva | Formato | Base |
|---|---|---|---|---|---|---|---|---|---|

## Finalistas que perderam

<a mesma tabela, com uma coluna a mais: por que perdeu; abaixo dela, em lista, os descartados antes da final, cada um com o motivo, para a próxima escolha não medi-los de novo à toa>

## Trocas

<vazio até um tema cair>
```

**Quem busca espera.** É a expectativa que a oferta mostrou (`medida`: os títulos e o formato dos resultados que já respondem o termo dizem o que a pessoa foi procurar), em uma linha e com a evidência ao lado: "a consequência física, passo a passo; doze dos quinze títulos são 'o que acontece se'". Quando os resultados não mostram uma expectativa clara, ou se dividem entre duas, a linha diz isso ou fica "não levantado": intenção não é deduzida do termo nem inventada para preencher o campo. A linha segue com o tema para o `diretor-criativo`, que a usa como evidência ao formular a promessa (`conceito/angulo`, na pasta dele); ela não escolhe o recorte.

O nome da pasta é curto, em inglês, e diz o tema (`why-we-sleep`). Vídeo escolhido antes desta skill fica sem `pauta.md`: nenhum é escrito de trás para frente.

**Quando o tema cai.** Se o `diretor-criativo` relata que nenhum recorte honesto se sustenta no tema inteiro, apresente ao usuário o próximo finalista de `pauta.md`, já medido. Com o aceite dele: anote em "Trocas" o tema que caiu, a data e o motivo; passe o novo para o cabeçalho; renomeie a pasta. O `research.md` antigo vai junto só se servir ao tema novo. Um recorte que cai com o tema de pé não volta para cá.

## DEPENDÊNCIAS
- medida: fornece os números e diz quais não valem.
- nicho: reprova o finalista de base disputada no centro.

## LIMITES
- A troca de tema e a escolha entre finalistas são do usuário, salvo delegação explícita dele (ver "Delegação"); o descarte pelo nicho e pelo corte de volume é do agente, com o motivo dito.
- A tabela não ganha coluna de nota composta: somar medidas de fontes diferentes esconde qual delas decidiu.
