## PERGUNTA
O que faz a trilha soar como a música de um vídeo só, e em quantas partes ela é gerada?

## RESPOSTA

**Princípio.** O **leito** é a identidade musical contínua do vídeo: a música pode mudar, e até ser gerada em mais de um arquivo, sem que quem assiste sinta que entrou outra trilha sem motivo. Continuidade é percebida, e não declarada pelos parâmetros: timbre, andamento e tom preveem, e o som gerado confirma.

**A música do canal** (decisão do usuário em 2026-10-09, ouvindo duas versões do mesmo trecho). É o piano de cinema mudo, no vídeo inteiro: ao fundo sob a fala, e à frente nos números mudos (`silencio`), em que é ele que conduz a cena. A escolha foi feita num trecho de 12 s: como ele se sustenta sob minutos de fala é a primeira dúvida de identidade do próximo vídeo, levada ao ouvido cedo (`entrevista-som`): sob a fala, o piano acompanha ou cansa? Soa como cinema mudo, ou como desenho para criança? Os exemplos desta skill com piano de feltro, sintetizador e cordas são do vídeo do sono, anterior à decisão.

**Parte e identidade.** Uma **parte** é um arquivo: a primeira geração e cada item de `music.parts`. É primeiro uma segmentação técnica, e só vira mudança que se ouve quando o vídeo pede. Um vídeo pode ter uma parte e uma identidade, várias partes e uma identidade ou, quando o produto pede mesmo, uma ruptura deliberada.

**O que deu errado uma vez.** Um vídeo de 9 minutos com dez faixas, uma por capítulo, e o usuário ouviu "qualquer música ambiente posta para preencher espaço". O defeito não eram os dez arquivos nem os capítulos: cada trecho soava como uma música independente, e o vídeo perdeu a identidade e a sensação de trilha composta para ele. É a **playlist**, e ela é o defeito que esta unidade evita.

**O teste**, em cada fronteira em que a música muda: parece que a música se desenvolveu, ou que alguém trocou a faixa?

- **Desenvolveu**: passa, por mais que tenha mudado. Densidade, registro, pulso, instrumentação, harmonia e energia podem mudar bastante, e a mudança pode ser notada: "a mesma trilha abriu", "escureceu".
- **Trocou a faixa**: a ruptura é parte deliberada da experiência (um colapso, uma revelação, uma passagem radical de contexto)? Se é, vale pelo que realiza. Se não é, é playlist, e é consertada.

A identidade sobrevive por várias pistas (a família de timbres, o tipo de pulso, a densidade, o espaço da produção, o gesto, o andamento, a harmonia, o modo de tocar, a própria transição), sem que alguma seja obrigatória nem que haja uma conta de quantas. Melodia repetida não está entre as disponíveis: gerações independentes do ACE-Step não repetem um tema (`momentos` guarda o teste).

O agente não ouve. Quando a unidade é uma dúvida que pesa, gere o trecho em volta da fronteira e leve-o ao usuário com a pergunta do teste (`entrevista-som`); se a ruptura era intencional, a pergunta é se ela realiza a transformação que o vídeo pede. O número de partes, o andamento e o tom não são perguntados.

**Quantas partes.** O limite é da ferramenta: o `pnpm music` recusa a parte cuja duração planejada passa de 440 s (7 minutos e 20 s), os 480 s que o ACE-Step gera nesta máquina menos a sobra cortada das pontas. A duração planejada inclui o cruzamento com a parte seguinte ou a cauda do fim do vídeo: quem diz se a divisão cabe é o comando.

- Se o vídeo cabe numa parte, comece com uma parte.
- Não cabe: quantas o limite exigir, duas, três ou mais.
- **Poucas, por padrão.** Cada parte a mais é outra geração, outra costura e outra chance de o timbre derivar.
- **Uma parte que a duração não exige paga a costura.** O que ela permite que um momento dentro da parte atual não realiza? "Mudou o capítulo, o lugar, o assunto" costuma pedir um momento, ou nada. Uma transformação longa que o momento não alcança (não cabe nele, costura mal, não chega ao outro estado) faz da parte nova uma hipótese válida, provada no som. E o teste inverso: feita a mudança com um momento, o que se perde? Se nada que importe, fica o momento.

**Onde trocar.** Numa cena em que a costura possa desaparecer, a música já tenha motivo para mudar e a parte nova tenha espaço para entrar no corpo. O roteiro propõe, e o som decide: se a fronteira elegante no papel dá faixa morrendo cedo, entrada fria ou costura que chama atenção e outra cena costura melhor, a troca vai para a outra. Capítulo é estrutura do texto e não decide faixa: a música atravessa capítulos, muda no meio de um e troca onde não há capítulo nenhum.

**A costura** é mecânica (`src/audio/parts.ts`):

- sem `at`, a parte nova cruza com a anterior em 3 s, por baixo da fala;
- depois de um silêncio de música, entra de uma vez, sem cruzar;
- com `"at": "hold"`, entra no silêncio de fala do fim da cena;
- cada parte é gerada com sobra e tem as pontas cortadas, para estar no corpo dos dois lados.

São ferramentas: escondem a borda de volume, e não fazem de duas identidades uma música. Um silêncio que o vídeo já tem é bom lugar para a troca; nenhum silêncio é criado para ela (`silencio`). Defeito de costura é consertado sem pergunta: a parte anterior morre antes da troca, a seguinte demora a chegar ao corpo, há buraco, há salto de volume.

**O que já funcionou** contra a deriva, o caminho de menor risco conhecido, usado enquanto o vídeo não dá razão para mudar o mundo sonoro. É repertório: nenhuma destas técnicas prova unidade, e a falta de uma não reprova a trilha.

- Repetir os timbres de base nas descrições, com as mesmas palavras: três descrições de climas diferentes saíram a 0,21 oitava uma da outra com o trecho repetido, e a 0,64 sem ele (`descricao`).
- Andamento igual ou próximo entre as partes.
- O mesmo tom, ou o relativo.
- A troca numa fronteira estrutural do vídeo, depois de um silêncio.

Comece por uma identidade e pelo menor número de partes que a ferramenta permite, preserve explicitamente alguns sinais dela entre as gerações e só aumente a ruptura quando o vídeo ou o som mostrar que ela melhora a experiência.

**Sensores.** Na referência a música toca em 99,5% do tempo (de 97,6% a 100%), o timbre varia 0,23 oitava do começo ao fim (de 0,15 a 0,32, pelo centro do espectro em janelas de 30 s) e a música muda de seção a cada 20 s, mais ou menos (de 15 a 49 s): muda muito, dentro de uma identidade. O piloto das dez faixas mediu 0,61. A variação alta diz em que fronteira ouvir. Ela não sabe o que é playlist: sobe com um silêncio longo e com uma transformação legítima, e pode ficar na faixa numa trilha que o ouvido acha desconexa. Quando a medida e o ouvido discordam, vale o ouvido.

**Pronto quando:**

- o `pnpm music` aceita a divisão;
- nenhuma costura tem defeito que a medida acusa;
- cada mudança que se ouve faz trabalho no vídeo;
- onde a unidade era dúvida que pesa, o usuário ouviu a fronteira;
- nenhuma troca que não é ruptura deliberada soa como playlist.

## DEPENDÊNCIAS
- entrevista-som: como a dúvida de unidade chega ao ouvido do usuário, e o que é execução.

## LIMITES
- A vinheta e a chamada final não ganham parte própria só por serem vinheta ou chamada: são o leito em primeiro plano (`niveis`) enquanto ele realizar a intenção.

## EXEMPLO
> Vídeo de 9 min 32 s: uma parte não cabe, duas bastam.
> Hipótese: a troca depois do silêncio em que a resposta do vídeo é dita, aos 6:50. A música já muda ali (o tema curioso passa a resolvido e quente), e a parte nova entra sem cruzar.
> Sinais preservados entre as duas descrições: piano de feltro, sintetizador analógico quente, cordas; 96 bpm nas duas.
> A medida não acusa buraco nem salto na costura. Ao usuário, com o trecho de 6:30 a 7:20: "aqui a música se desenvolveu, ou começou outra?"
