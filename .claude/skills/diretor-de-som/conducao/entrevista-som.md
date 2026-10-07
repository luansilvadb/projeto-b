## PERGUNTA
Que decisões de som vão ao usuário, e como chegam a quem ouve?

## RESPOSTA

**Separar medida de escuta.** Medida é o que as ferramentas dizem: o nível, o tempo sem música, a variação de timbre, quantos efeitos por minuto. Escuta é o que só o ouvido diz: se o clima é o da cena, se o tema emociona, se uma costura se nota, se um som combina com o desenho. O agente resolve sozinho o que é medida e execução; ao usuário chegam as escolhas e tudo que é escuta.

**Escuta espera o som.** O que só o ouvido julga não é aprovado no papel antes de haver o que ouvir: antes da voz, nenhuma decisão desta lista é pedida por rotina (`etapas/arco-de-som.md`).

**Decisões que sempre vão ao usuário:**

1. os timbres de base, o andamento e o tom da trilha do vídeo;
2. o caráter de cada leito, numa frase, e onde fica a troca;
3. cada momento: o trecho, o que a música faz ali e por quê;
4. cada silêncio de música, com a frase que ele cobre;
5. o silêncio de fala (`holdMs`) quando duas durações válidas fazem vídeos diferentes: mudam o ritmo, o peso ou o tom, contrariam uma duração registrada ou criam custo relevante (1 s ou 6 s num fim que vira contemplativo);
6. a dose de efeitos (ralo, médio ou cheio, dentro da faixa) e os usos de nível `forte`;
7. o som de cada uso novo do catálogo, entre os candidatos;
8. mudança em qualquer som já aceito.

**O que o agente resolve sozinho:** o `holdMs` que preserva a experiência (900 ms ou 1,2 s para uma consequência assentar), dentro do limite do runtime; a redação das descrições depois de o caráter estar aprovado; as mudanças de nível dentro da dose; o instante de cada efeito, pela partitura; as sementes a tentar; toda correção apontada pela crítica que não mexa em decisão aprovada.

**O mapa antes do som.** O mapa de som é aprovado no papel, antes de qualquer geração: uma tabela com o trecho, o que a música faz, o nível e os efeitos. Gerar para depois perguntar gasta minutos de GPU numa direção que o usuário ainda não escolheu.

**Roteiro de escuta.** Todo som vai ao usuário com um roteiro: o arquivo, e uma lista de instantes, cada um com uma pergunta de sim ou não. O usuário não precisa ouvir 9 minutos procurando defeito; ouve os instantes e responde.

- Um instante por momento, na entrada e na saída: "a música muda sem tranco?"
- Um por troca de leito e por silêncio.
- Um por nível que não é `leito`: "dá para entender a fala sem esforço?" ou "a música some demais?"
- Um por uso novo de efeito: "o som é do tamanho da coisa?"
- Os trechos que a crítica acusou, com a medida ao lado.
- Uma pergunta para o vídeo inteiro: "parece uma música feita para este vídeo?"

**Alternativas.** Quando uma decisão é de ouvido, as alternativas chegam como arquivos do mesmo trecho, nomeados A e B, com a diferença dita em uma frase. Duas sementes da mesma descrição são a mesma ideia; duas descrições são duas ideias. Uma pausa é julgada no trecho do texto ou no animatic, nunca em dois números de milissegundos; se só o som real mostra a diferença, a decisão espera por ele.

**Nesta unidade**, a entrevista da skill `grilling` ganha: a ordem das dependências é o leito antes dos momentos, os momentos antes dos níveis, a música antes dos efeitos; o nível de cada alternativa é a frase do mapa ou o arquivo de som, nunca "uma música mais tensa"; o registro é no mapa de som.

## LIMITES
- Não afirmar que um som está bom: dizer o que foi medido e o que falta ouvir.
- Não pedir o aceite sem o roteiro de escuta.

## EXEMPLO
> Roteiro de escuta de `out/why-we-sleep/why-we-sleep.som.mp3`:
> 0:36 — o tema se abre na pergunta: a música cresce, ou só fica mais alta?
> 4:28 — entra o laboratório: a mudança tem tranco?
> 5:02 a 5:27 — a morte dos ratos, em `recuo`: a música pesa, ou some?
> 6:39 a 6:50 — a resposta, sem música, e o leito B entrando: o silêncio pesa?
> Vídeo inteiro — parece uma música feita para este vídeo?
