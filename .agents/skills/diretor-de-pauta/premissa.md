## PERGUNTA
Como um curta de ficção começa por uma premissa, sem depender de procura nem de busca?

## RESPOSTA

**No modo `jam`, o ponto de partida é uma premissa, e não um termo buscado.** `nicho`, `candidatos` e `medida` não entram: não há procura a medir, e o tema vem do evento ou do usuário. O que se leva ao usuário são premissas que cabem no briefing, e ele escolhe.

**Premissa** é a história em uma ou duas frases: quem, onde, o que essa pessoa quer ou teme, e o que muda. "Um farol desativado" é assunto. "Na noite em que o farol é desligado para sempre, o faroleiro acende uma lanterna na janela, e um barco responde" é premissa: tem alguém, um lugar, uma mudança e um fim possível.

**Os filtros**, que fazem aqui o papel do nicho. A premissa que reprova num deles sai sem consulta, com o motivo dito:

1. **Responde ao tema do briefing**, de um jeito que quem só viu o filme reconhece, sem letreiro que o explique.
2. **Cabe na duração do briefing.** A medida é o campo "Duração", e não um tamanho de costume: quanto menor ela é, menos a premissa sustenta, e a que pede mais tramas, personagens ou mundo a explicar do que essa duração comporta não cabe. Com a duração "não fornecido", o filtro não se aplica por suposição: pergunte ao usuário antes de filtrar, dizendo que a escolha das premissas depende da resposta, e registre-a no campo, com a data.
3. **Cabe nos recursos do briefing**: o número de personagens e de locações, a voz, a música e o que este repositório produz (motion graphics em 2D, desenhado em código).
4. **Tem uma imagem central**: uma metáfora ou uma situação que se desenha e que carrega a ideia sem a fala.
5. **Dá à narração algo que a imagem não mostra.** A voz em off é obrigatória no modo: a premissa em que o narrador só descreveria o que se vê não serve.
6. **Não depende de obra, marca nem pessoa real.** O que pedir direito de terceiro é dito como risco, para o `diretor-publicacao` conferir contra as regras fornecidas.

**Levantamento.** Escreva de cinco a oito premissas por entradas diferentes no tema (a literal, a metafórica, a invertida, a íntima, a cômica), passe cada uma pelos filtros e apresente de dois a quatro finalistas numa tabela: premissa, imagem central, por que cabe no briefing e o maior risco. Depois a recomendação, com o motivo em uma ou duas frases, e pare. Com prazo curto no briefing, a rodada é uma só: o finalista recusado não abre nova exploração, e o usuário escolhe entre os que restam ou dá a premissa dele.

**Procura, só a pedido.** Com `youtube` no destino, o termo buscado fica "não levantado": o `diretor-publicacao` trabalha sem ele. A medida de procura (`medida`) só é feita se o usuário a pedir, e nunca decide a premissa.

**Registro.** Com a escolha, `pauta.md` fica assim:

```markdown
# <título de trabalho>

## Briefing

<os campos de `briefing`>

## Premissa

- Premissa: <quem, onde, o que quer ou teme, o que muda>
- Tema: <como a premissa responde ao tema do briefing>
- Imagem central: <a metáfora ou a situação que se desenha>
- Escolhida em: <data>
- Motivo: <uma ou duas linhas>

## Premissas que perderam

<a tabela dos finalistas, com uma coluna a mais: por que perdeu>
```

Pronto quando o usuário escolheu e `pauta.md` existe. A premissa segue para o `diretor-criativo`, que a desenvolve em história e formula com o usuário a frase de intenção (`diretor-criativo/estrutura/narrativa.md`).

## DEPENDÊNCIAS
- briefing: fornece o tema, a duração, os recursos e as regras do evento que os filtros usam.

## LIMITES
- A premissa não é roteiro: enredo, narrador, estrutura e texto são do `diretor-criativo`. Um desfecho possível pode ser anotado como argumento a favor de uma premissa; ele não é decisão.
- A escolha entre finalistas é do usuário; o descarte pelos filtros é do agente, com o motivo dito.
- Quando a premissa cai na escrita (nenhuma história honesta cabe nela), o caminho é o de `escolha`, "Quando o tema cai": o próximo finalista, já filtrado, vai ao usuário.
