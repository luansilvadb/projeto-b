## PERGUNTA
Que produto é este, para onde vai e com que tempo e recursos, e o que disso precisa estar dito antes de qualquer direção trabalhar?

## RESPOSTA

**O briefing é dado de partida, e não estado.** Ele guarda o que o usuário pediu e o que o destino impõe, na seção `## Briefing` de `src/videos/<vídeo>/pauta.md`. As seis direções o leem; só o usuário o muda. Nada nele registra andamento, etapa, aceite ou tempo gasto: o que já existe se vê nos artefatos, e o tempo que resta se calcula do prazo e do relógio (`diretor-producao/etapas/plano.md`).

**Modo.** É a primeira linha, e decide que regras valem (decisão do usuário):

| Modo | Produto | Como começa | Regras próprias |
|---|---|---|---|
| `canal` | vídeo educativo de ciência do canal, para o YouTube | pela procura: `nicho`, `candidatos`, `medida`, `escolha` | as decisões do canal: nicho científico, trupe e personagens chibi, voz e chamada do canal, humor na imagem, piano de cinema mudo |
| `jam` | curta narrativo de ficção com narração em off, feito para um evento (Film Jam) | pela premissa: `premissa` | as do evento, como o usuário as forneceu; das decisões do canal só entra o que o usuário mandar trazer |

Sem briefing, o modo é `canal`: o fluxo dos vídeos do canal segue como sempre foi, e nenhum campo é exigido deles; o vídeo do canal que tem prazo ganha a seção só com os campos que o usuário deu (`escolha`). O modo `jam` existe quando o usuário o pede ou traz um evento; na dúvida entre os dois, pergunte antes de criar a pasta. Em cada skill, o que é decisão do canal está marcado como "do canal" na unidade; fora do modo `canal` isso é repertório, e não regra.

**Modo e destino são campos diferentes.** O modo diz que produto é e que regras de feitura valem; o destino diz para onde o arquivo vai e que pacote de saída se monta. O valor `jam` no campo "Destino" é o evento, e não o modo. Um não decide o outro: o curta do modo `jam` pode ir ao evento, ao YouTube ou aos dois, e acrescentar `youtube` ao destino dele não o torna vídeo do canal nem traz as regras do canal.

**Campos.** Só entram os que existem. Campo que o usuário não deu fica "não fornecido"; nunca é preenchido por suposição, por costume de outros eventos nem pelos valores de um briefing anterior.

```markdown
## Briefing

- Modo: <canal | jam>
- Destino: <jam | youtube | jam e youtube>
- Prazo: <data e hora da entrega, com o fuso>; <horas de trabalho disponíveis, se o usuário as deu>
- Duração: <alvo ou limite, e de quem vem: do usuário ou do evento>
- Recursos: <o que o filme pode usar: personagens, locações, quem narra, quantos leitos musicais, o que pode ser reaproveitado>
- Regras do evento: <tema, formato do arquivo, créditos, direitos e licenças, uso de IA, campos do envio: como o usuário as forneceu, com a fonte e a data; ou "não fornecido">
- Referências: <a obra e o que se tira dela>
```

- **Destino** decide o pacote de saída (`diretor-publicacao`) e o arquivo de entrega (`diretor-producao/etapas/corte-final.md`). Grave sempre um dos três valores canônicos: `jam`, `youtube` ou `jam e youtube`. Ao ler um briefing antigo, aceite "evento" como `jam`, e "os dois" como `jam e youtube`; ao reescrever o campo, troque pelo canônico. Continua selecionável até a entrega: mudar de `jam` para `jam e youtube` acrescenta um pacote, e não refaz o filme.
- **Prazo e duração** são dados. O prazo ajusta o nível de polimento (`plano`), e não dispensa requisito bloqueante.
- **Regras do evento** são transcritas, e não interpretadas: a regra ambígua ou ausente volta ao usuário como pergunta, com o que depende dela. Nenhuma direção deduz regulamento, prazo, licença ou permissão.
- **Narração em off é obrigatória no modo `jam`** (decisão do usuário): a composição só monta com a narração gravada, e o tempo de toda cena sai dela.

**O que nasce com o briefing.** A pasta `src/videos/<vídeo>/`, com nome curto em inglês, e `pauta.md` com o briefing e a escolha (o tema, por `escolha`, ou a premissa, por `premissa`). Pronto quando o modo e o destino estão ditos, o que o usuário forneceu está transcrito com a fonte e o que falta está marcado "não fornecido", com a pergunta feita quando outro trabalho depende da resposta.

## LIMITES
- O briefing não guarda o plano de tempo nem a frase de intenção: o plano é da `diretor-producao`, calculado na conversa, e a intenção fica em `script.md`, do `diretor-criativo` (`diretor-producao/equipe/protocolo.md`).
- Regra do evento que chega depois entra no briefing com a data, e vai dita a quem ela afeta; não se reescreve o que já foi feito sem dizer.
