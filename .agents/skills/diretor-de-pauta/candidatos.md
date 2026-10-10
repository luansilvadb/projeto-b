## PERGUNTA
De onde saem os temas a medir?

## RESPOSTA

**Candidato é um termo que o público digita, e não um recorte que o agente escreveu.** "O café não te dá energia, ele esconde a conta" é recorte: ninguém busca isso, e a medição dá zero mesmo com o assunto procurado. O candidato é "por que o café tira o sono", guardado nas palavras em que apareceu. Uma ideia que só existe como recorte procura primeiro o termo que o público usa para o mesmo assunto; sem termo, não é candidata.

**Fontes, nesta ordem:**

1. **Finalistas anteriores.** As tabelas de quem perdeu nos `src/videos/*/pauta.md`. Entram com as medições antigas e a data delas à vista; mede-se de novo só o que for a finalista outra vez.
2. **Autocompletar do YouTube em pt-BR**, a partir de frases-semente de curiosidade: "por que a gente", "por que sentimos", "por que o", "o que acontece se", "o que acontece com o corpo", "o que acontece quando", "e se a terra", "como os animais", "como funciona o". As sugestões são o que as pessoas digitam; não dizem o volume. Uma sugestão boa vira semente da rodada seguinte ("porque a gente sonha" leva a "por que sonhamos").
3. **Material cortado.** A linha "Elementos … Saíram" dos `script.md` e os `research.md` de outros vídeos guardam assuntos já pesquisados que não entraram. Cada um ainda precisa do termo que o público digita.

O meio atual do autocompletar é o endpoint de sugestões, sem chave:

```powershell
Invoke-RestMethod "https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=pt-BR&gl=BR&q=$([uri]::EscapeDataString('por que a gente '))"
```

O segundo item da resposta é a lista. O endpoint não é documentado: se parar de responder, o usuário digita as sementes na busca do YouTube e cola as sugestões.

**Varie as sementes entre áreas.** O nicho é ciência de qualquer área; uma rodada só com sementes de corpo devolve só corpo. As sugestões vêm sujas (música, jogo, finanças, política): o `nicho` limpa.

## DEPENDÊNCIAS
- nicho: decide quais sugestões viram candidatos.

## EXEMPLO
> Semente "por que sentimos " → "por que sentimos cócegas", "porque sentimos medo", "por que sentimos câimbra" (candidatos); "porque sentimos ciúmes" (fora: a resposta central é mais psicologia disputada que mecanismo estabelecido).
