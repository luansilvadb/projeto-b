## PERGUNTA
O que cada número diz sobre a procura de um termo, e qual não vale?

## RESPOSTA

São três medidas, de fontes diferentes. As duas primeiras o agente levanta sozinho; a terceira só o usuário tem.

**1. Oferta: quem já responde o termo.** Dos doze a quinze primeiros resultados da busca do YouTube, leia título, views, canal, inscritos do canal, idade do vídeo e formato (animação, alguém falando para a câmera, corte de podcast, short). Ela responde a quatro perguntas:

- **Quanto o assunto rende** depois que o vídeo existe: as views máximas e a faixa em que a maioria cai.
- **Que público o termo junta.** Os títulos mostram a intenção de quem busca; é aqui que o `nicho` pega conselho e o termo de dois públicos. Os resultados de fora do nicho saem da conta.
- **Se há brecha no formato.** Só gente falando para a câmera, ou já existe animação boa respondendo?
- **Se a primeira página é só de canal grande.**

**2. Ponto fora da curva.** Um vídeo com muito mais views do que o canal dele tem de inscritos: o assunto puxou sozinho, sem depender da audiência. É o sinal mais útil para um canal pequeno. Idade pesa: 470 mil views em oito meses num canal de 10 mil inscritos diz mais do que 1 milhão em nove anos.

O meio atual, sem chave nem navegador (provado em 2026-10-10: as views máximas lidas assim bateram com as do painel do vidIQ): a página de busca traz os dados num JSON embutido, e a página do canal traz os inscritos.

```powershell
$h = @{ 'User-Agent'='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'; 'Accept-Language'='pt-BR' }
function Yt($url) { $c = (Invoke-WebRequest $url -Headers $h).Content; [regex]::Match($c, 'var ytInitialData = (\{.*?\});</script>', 'Singleline').Groups[1].Value }
$d = Yt "https://www.youtube.com/results?search_query=$([uri]::EscapeDataString($termo))&hl=pt-BR&gl=BR" | ConvertFrom-Json -Depth 100
$videos = $d.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer | Where-Object { $_ }
# de cada um: title.runs[0].text, viewCountText.simpleText, ownerText.runs[0].text, publishedTimeText.simpleText, lengthText.simpleText
# inscritos: na página de ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl, o primeiro texto que termina em "inscritos"
```

Os inscritos vêm escritos de vários jeitos ("430", "12,1 mil", "6,29 mi", "8,98 milhões") e às vezes não vêm: confira a unidade antes de dividir views por inscritos, e desconfie de uma razão de milhares.

A estrutura da página muda sem aviso. Se a leitura falhar, diga isso e peça a oferta ao usuário, pelas views máximas e médias do painel; não estime.

**3. Volume e competição: o painel do usuário (vidIQ).** O pedido leva no máximo cinco termos, já filtrados, e diz três coisas:

- **Um termo por busca.** Vários termos colados viram uma frase que ninguém digita, e o painel mede essa frase.
- **O que devolver:** volume, competição, views máximas e médias, e "In Title" (em quantos dos primeiros resultados o termo está no título; baixo com volume razoável é procura sem vídeo com esse nome).
- **O que ignorar:** a média de assinantes. Deu 282 milhões numa busca e 73 milhões em outra; campo com valor implausível sai da comparação de todos os candidatos, e o descarte é dito.

**Versão curta quando a oferta discorda** (decisão do usuário em 2026-10-10). Termo com o menor nível de volume e oferta também fraca sai direto: as duas medidas concordam ("por que a lua não cai na terra", com a maioria dos vídeos abaixo de 240 mil views). Com o menor volume e oferta forte, a frase provavelmente não é a que as pessoas digitam, e o termo é medido de novo encurtado ("o que aconteceria se os humanos sumissem da terra", com 1,3 mi de média, vira "e se os humanos sumissem"). Volume mínimo também na forma curta é assunto sem procura na busca.

**Os níveis do painel são estimativa de terceiro.** Servem para comparar candidatos entre si no mesmo dia, nunca como número absoluto. Toda medição é anotada com a data.

## LIMITES
- Sugestão de autocompletar não é volume, e volume não é views: um não substitui o outro na tabela.
- Como as medidas se comparam e qual pesa mais é de `escolha`.

## EXEMPLO
> "o que acontece com o corpo após a morte" (2026-10-10). Oferta: máxima de 15,5 mi (Você Sabia?, há 8 anos), a maioria entre 100 mil e 4 mi; quatro dos quinze são espíritas ou de pregação e saem da conta; quase tudo é gente falando ou lista narrada. Painel: volume médio, competição média, In Title 2/16.
