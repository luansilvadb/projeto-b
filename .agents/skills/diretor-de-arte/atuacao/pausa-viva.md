## PERGUNTA
Quando nada novo acontece, o que faz o quadro continuar parecendo intencional e coerente com o estado da cena?

## RESPOSTA

**Princípio.** A pausa sustenta o estado que a última ação deixou, até a próxima mudança. Ela funciona quando a falta de novidade parece escolha, e falha quando o quadro parece um arquivo congelado numa cena em que algo continuava. Ficar imóvel é uma das respostas certas. O teste: o que se vê parado está parado porque a cena é assim, ou porque ninguém animou?

**A pausa serve quando:**

- **A imobilidade, quando existe, diz alguma coisa**: choque, concentração, suspensão, tensão, solenidade, silêncio, escala. Nenhum movimento entra só para dois quadros não saírem iguais.
- **Só se move o que continuaria acontecendo naquele estado.** O movimento residual tem causa no corpo ou no meio: quem está vivo respira, a água-viva pulsa, a água ondula, a chama tremula, a esteira segue. Sem vento a árvore fica parada, e o laboratório não tem o que piscar. Não se distribui movimento por cobertura.
- **O movimento residual é o do estado.** Quem dorme respira devagar e fundo, quem está exausto ofega, quem prende o fôlego não respira. Ele pode ser grande (uma bandeira, a água do quadro inteiro) sem deixar de ser residual.
- **Ele não vira ação.** Nenhuma intenção, escolha ou reação nasce na pausa. O olhar fica onde a atenção do personagem está, e muda quando ela muda: pupila que passeia para animar faz um personagem inquieto sem motivo. O que diz algo novo é de `acao`.
- **Ele cede ao foco.** Em amplitude, contraste e frequência, o que se mexe na periferia fica abaixo do que o plano pede para acompanhar (`composicao`).
- **O que é independente não se move como cópia.** Três bichos respirando em uníssono viram um mecanismo. Movem-se juntos os que têm uma causa comum: a mesma onda, o mesmo impacto, uma marcha, uma máquina.
- **A partícula pertence ao meio ou ao fenômeno.** Ela existe na água e por dentro do corpo (plâncton, grãos no tecido). No ar do mundo (savana, rua, laboratório, fundo liso), cinza translúcido flutuando lê como sujeira: saiu no piloto da elefanta.
- **A luz varia quando a fonte é instável.** A chama e a lâmpada velha tremulam; a fonte estável não precisa pulsar para parecer acesa. Halo que respira em quem não emite luz lê como enfeite gerado (`forma`).

**O que o repositório fixa.** A variação (fase, intervalo, posição) é sorteada por semente fixa: cada quadro é renderizado sozinho, e sorteio livre faz o movimento tremer de um quadro para o outro. Os primitivos estão em `etapas/animacao`. Existir um primitivo não é motivo para usá-lo.

**Repertório.** Sinais que já serviram, para quando o estado os pede; as amplitudes e os períodos são o que a referência costuma usar, e situam sem reprovar:

| Quem | Sinal | Amplitude | Período | De onde vem |
|---|---|---|---|---|
| Pessoa em pé | respira: o tronco sobe e os ombros abrem; o peso troca de pé | 2% a 3% da altura | 3 a 5 s | referência |
| Pessoa | pisca: a pálpebra fecha e abre. Não cabe no olhar fixo, no choque nem no close muito curto | 4 quadros | a cada 2 a 5 s, sorteado | referência |
| Pessoa | um microajuste do olhar, sem trocar de alvo | poucos pixels | a cada 1,5 a 3 s | referência |
| Quem dorme | respira mais devagar e fundo; a cabeça pende um pouco mais a cada expiração; "z" que sobem e crescem. A pose e o lugar também dizem o sono | | 4 a 6 s | vídeo do sono |
| Quem espera | segura a intenção até a próxima mudança: imóvel, olhando, respirando, ou numa coisa pequena e lenta (o peso, a cabeça, a cauda) | | | referência: numa pausa de reação de 1,5 s, a figura respira e troca o peso de pé |
| Bicho que nada | o corpo ondula, as nadadeiras batem, o corpo sobe e desce | 3% a 6% da altura | 1,5 a 3 s | referência |
| Bicho que voa | as asas batem, ou o corpo plana com inclinação que varia | 4° a 8° | 1 a 2 s | referência |
| Água-viva | pulsa, cada braço com a própria fase | 5% a 10% | 2 a 6 s | vídeo do sono |
| Planta ou alga, onde há vento ou corrente | balança, cada folha com a própria fase | 5% a 10% | 2 a 6 s | referência |
| Ambiente com um processo em curso | o capim ao vento, a água que ondula, as estrelas que cintilam | 1 a 3 pixels | contínuo | referência |
| Partículas do meio | derivam atrás do assunto, opacas, um tom acima do fundo | 1 a 3 pixels | contínuo | referência; a restrição ao meio vem do piloto da elefanta |
| Fonte de luz instável | o halo respira; a chama ou a lâmpada tremula | 10% a 20% da opacidade | 1 a 4 s | referência |
| Superfície viva (proposta) | as faixas e manchas correm por dentro da silhueta, que fica parada; as bolhas da borda nascem, crescem e estouram, cada uma na sua fase | o espalhamento anda de 1% a 2% do diâmetro por segundo | contínuo | um vídeo de espaço |

**Medidas** (evidência: dizem onde esse estilo vive, e não são meta).

- Na referência, dos dez planos lidos que pareciam parados em três quadros, oito tinham de 5% a 10% do quadro em movimento o tempo todo, e o vídeo inteiro fica quase parado só 10% do tempo. Um plano pode ter zero e estar certo.
- No piloto do vídeo do sono, o usuário aceitou pausa viva em todo plano, sem dois quadros iguais em nenhum trecho, com a tela quase parada em 7% do tempo. É decisão daquele vídeo, em que quase todo o elenco é bicho vivo ou gente dormindo.

## DEPENDÊNCIAS
- sincronia: fornece o trecho sem novidade e a função dele.
- cenario: fornece os processos que existem no ambiente.
- composicao: fornece o foco a que o movimento residual cede.
- personagem: fornece a pose e a direção do olhar que a pausa sustenta.

## LIMITES
- O que a figura diz com o corpo pertence a `acao`: a pausa não acrescenta sentido.
- A câmera não é textura de pausa. Se ela se move, ou fica parada, é decisão de `movimento`.
- Rastro, estouro, aviso e raios pertencem a `efeitos`, e acompanham um acontecimento.
- A pausa não inventa vento, água, fumaça nem luz que o cenário não tem (`cenario`).

## EXEMPLO
> O peixe parado olhando a água-viva. Move-se o que continua: ele se mantém na água (o corpo sobe e desce 5 px em 3,1 s, a cauda bate 6° em 0,9 s), a pupila segue o anel que passa a cada 1 s, porque é para lá que ele olha, e a cada 3 s há uma piscada de 4 quadros. A água-viva pulsa no próprio ritmo, com os braços em fases diferentes; o plâncton deriva, porque estão na água.
> Imóvel, e certo assim: o pesquisador que acaba de ler o resultado fica parado, de olhos na prancheta, por um segundo. A parada é o espanto.
