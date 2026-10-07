## PERGUNTA
Com que medidas e passadas julgar o som de um render?

## RESPOSTA

**Quando aplicar.** Sobre o som do vídeo inteiro, depois de gerado e mixado, antes de levá-lo ao usuário; e de novo, só nos trechos alterados, depois de cada conserto.

**Postura.** A crítica não ouve. Ela mede, confere o som contra o mapa e aponta onde o ouvido do usuário precisa ir. As medidas e as passadas (passos 1 a 3 do procedimento) são de quem não escreveu o mapa; decidir e refazer (passos 4 a 6), de quem dirige.

**Os instrumentos:**

1. **As medidas do vídeo** (`pnpm critique <vídeo> som`): o som é separado em voz, música e efeitos e cada camada é medida contra a faixa da referência.
2. **O mapa segundo a segundo**, gravado junto: a distância da música à voz em cada segundo, onde há fala, onde a música muda de seção, onde o volume vira, onde há efeito.
3. **O mapa de som** do vídeo (`sound.md`) e os campos `music` e `sfx` do roteiro, com os instantes da narração.

**Medidas.** As faixas são as de `CRITERIA`, em `src/critique/sound.ts`.

| Medida | Faixa | Fora da faixa quer dizer |
|---|---|---|
| Música abaixo da voz, sob a fala | 9 a 15 dB | acima: a música virou massa; abaixo: disputa com a fala |
| Do trecho mais presente ao mais recuado | até 9,6 dB | a música abre e abafa |
| Tempo sem música | até 2,4% | buracos: silêncios demais, ou faixas que morrem nas pontas |
| Viradas de volume por minuto | até 1,1 | o mesmo, visto no tempo |
| Variação de timbre ao longo do vídeo | até 0,32 oitava | possível quebra de identidade: achar a fronteira e levá-la ao ouvido |
| Efeitos que se ouvem, por minuto | 4,4 ou mais | sensor: pode haver acontecimentos sem consequência sonora (`dose`) |
| Pico do efeito abaixo da voz | 11,5 a 14,7 dB | sensor: pode haver efeitos que somem, ou que disputam com a voz (`dose`) |

O que as medidas não veem: a contagem de efeitos tem um piso de 2 por minuto, de música e voz que vazam na separação, e por isso localiza uma região, e não conta os efeitos que existem; a variação de timbre sobe quando um silêncio longo entra na conta e quando a música se transforma por um motivo, e pode ficar na faixa numa trilha que o ouvido acha desconexa; nenhuma delas distingue música boa de ruim.

**Passadas, nesta ordem.** Um problema de nível superior invalida o polimento dos níveis abaixo.

1. **Unidade**
   - A variação de timbre está na faixa? Se não, em que troca ou em que momento o centro do espectro salta?
   - Nessa fronteira, o mapa pede uma transformação, e as descrições dos dois lados guardam algum sinal em comum? A resposta diz o que perguntar ao ouvido, e não reprova: a fronteira vai ao roteiro de escuta (`leito`).
2. **Continuidade**
   - Cada trecho sem música do mapa segundo a segundo é um silêncio que o mapa de som pede?
   - A música está no corpo dos dois lados de cada troca de leito, ou morre antes e demora a chegar depois?
3. **O mapa cumprido**
   - Cada momento começa e termina na cena que o mapa diz? O trecho mostra nas medidas a mudança que o mapa tentou produzir (seção, densidade, timbre, volume)? A falta dela pode ser um momento que não se realizou, ou uma mudança sutil que a medida não vê: se a medida não basta, marque o instante para a escuta (`momentos`).
   - Há salto de volume de mais de 6 dB em alguma borda de momento?
   - Cada nível que não é `leito` aparece na distância à voz daquele trecho?
4. **Nível**
   - Onde a distância sai da referência ou muda muito? Nesses trechos, a fala continua fácil e a música continua fazendo o trabalho dela? A medida localiza a escuta e não reprova sozinha: as faixas de nível são sensores, e `recuo` fica fora dos 9 a 15 dB por projeto (`niveis`). Investigue; se a gravidade depender da percepção e a dúvida pesar, marque o instante para o roteiro de escuta.
5. **Efeitos** (`dose`)
   - A densidade está muito distante da referência, ou concentrada numa região? Isso corresponde ao que acontece na imagem, ou sugere acontecimentos sem consequência sonora, ou efeitos acumulados sem dono? A contagem é sensor, com piso falso de 2 por minuto: não há piso, teto nem cota por capítulo ou por plano, e nenhum efeito é pedido para subir o número.
   - Cada efeito do roteiro aparece no mapa segundo a segundo, no instante do acontecimento dele? Algum contradiz uma quietude deliberada, ou acrescenta atividade sem função? Silêncio de música e `recuo` não bastam para chamar um trecho de quieto.
   - Há acontecimento na partitura da animação cuja percepção perde peso, materialidade ou causalidade sem efeito? Impacto é pista, e não obrigação.
   - O pico de algum efeito sugere que ele some ou disputa com a voz? `forte` e `leve` ficam fora dos 11,5 a 14,7 dB por projeto, e a quantidade de `forte` não reprova.
6. **Causa**
   - Cada momento, silêncio e mudança de nível tem o porquê escrito no mapa de som, e o porquê é um trabalho que se percebe no vídeo (narração, imagem, ritmo, estrutura)?

**Classificação:**

- **Bloqueante**: o usuário ouve a trilha como músicas desconexas, sem que a ruptura seja deliberada (a medida aponta a fronteira, e quem diz é o ouvido); há buraco que o mapa não pede; a música cobre a fala.
- **Relevante**: medida fora da faixa sem decisão registrada, salvo as de nível e as de efeitos, que são sensores e pedem investigação; momento ou nível que não aparece no som, nem na medida nem na escuta; salto numa borda; efeito sem dono, fora do instante do acontecimento ou que muda a leitura da imagem; região em que os acontecimentos perdem materialidade por falta de efeito.
- **Polimento**: o resto.

**Procedimento:**

1. Tire as medidas e leia o mapa segundo a segundo.
2. Faça as passadas, na ordem, com o mapa de som ao lado.
3. Para cada problema: o instante, a medida que o mostra, o critério violado, a classificação.
4. Conserte os bloqueantes e os relevantes: outra semente só para a faixa ou o momento em causa; outra descrição se duas sementes falharem.
5. Meça de novo.
6. Monte o roteiro de escuta (`entrevista-som`) com os instantes que sobraram e os que só o ouvido julga.

## DEPENDÊNCIAS
- leito, descricao, momentos, niveis, silencio, dose: fornecem os critérios das passadas.
- entrevista-som: fornece o formato do roteiro de escuta.

## LIMITES
- Medida na faixa não é som bom: é som sem os defeitos que a medida conhece.
- Uma medida fora da faixa por decisão do usuário (um segundo silêncio, uma trilha mais baixa) é registrada no aceite, e não consertada.

## EXEMPLO
> **Relevante, continuidade.** De 6:44 a 6:52 a música está ausente (8 s). O mapa pede silêncio de 6:39 a 6:50; os 2 s a mais são o leito B, que entra a −40 dB e leva 10 s para chegar ao corpo. Critério: a faixa está no corpo desde o primeiro segundo. Conserto: gerar o leito B de novo; o corte das pontas não achou o corpo.
