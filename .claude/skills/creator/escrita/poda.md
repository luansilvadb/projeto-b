## PERGUNTA
O que cortar de um documento já escrito, e com que teste?

## RESPOSTA

Passe o documento por quatro testes, frase a frase; a poda termina quando toda frase passou nos quatro.

**Fonte única da verdade.** Cada sentido mora em um lugar autoritativo, para que mudar o comportamento seja uma edição em um ponto só. A **duplicação** (o mesmo sentido em mais de um lugar) custa manutenção e tokens e infla a proeminência do sentido na escada além do seu degrau real. É o inverso acidental da palavra-guia, que repete um token de propósito e nunca o sentido.

**Cache do ambiente.** O ambiente também é fonte da verdade (os scripts do `package.json`, os arquivos de configuração, o desenho das pastas, a saída de `--help`), e o documento que o repete é um **cache**: a cópia de uma consulta, que só paga a própria carga quando a consulta é cara. Guarde o que o agente não acha olhando: a convenção não escrita, o motivo de uma escolha, a armadilha que nenhuma configuração confessa. Deixe as consultas de um arquivo ou de um comando para o ambiente, onde elas não envelhecem.

**Relevância.** A linha ainda pesa sobre o que o documento faz? Ela perde relevância por nunca ter pesado sobre a tarefa (mera exposição, ou um ramo que deveria estar divulgado) ou por envelhecer quando o comportamento ou o mundo que descreve muda. Sem disciplina de poda, o destino padrão é o **sedimento**: camadas velhas que se assentam porque acrescentar parece seguro e remover parece arriscado, até ser preciso perfurá-las para achar o que ainda está vivo.

**No-op.** A instrução que o modelo já cumpre por padrão paga carga para dizer nada. O teste (ela muda o comportamento em relação ao padrão?) é relativo ao modelo, e não ao leitor: duas pessoas que discordam sobre um no-op discordam sobre o padrão, e resolvem rodando o documento, não debatendo. Quando a frase falha, apague a frase inteira em vez de aparar palavras. O mesmo teste avalia palavras-guia: a palavra fraca demais para vencer o padrão (*seja minucioso*, quando o agente já é mais ou menos minucioso) é um no-op, e o conserto é uma palavra mais forte (*implacável*), e não outra técnica.

**Inventário.** A prova de que a poda cortou redação e deixou o comportamento: antes de editar, liste cada regra, número e exemplo que muda o que o agente faz; depois, confira um a um onde cada item mora. O item ausente só passa quando o ambiente o guarda.

## DEPENDÊNCIAS
- hierarquia: a escada e o ramo divulgado, para onde vai a linha que não pesa sobre todos os ramos.
- palavras-guia: a palavra-guia, que o teste de no-op também avalia.

## LIMITES
- A poda corta redação, nunca comportamento: a regra que muda o que o agente faz permanece, ainda que reescrita.
