# Plano de tempo e recursos

Entra quando o briefing (`diretor-de-pauta/briefing.md`) traz prazo ou horas de trabalho, ou quando o usuário pergunta se dá tempo. Sem prazo não há plano a fazer: o trabalho anda por risco, como sempre.

O plano é uma conta, e não um estado. Ele é dito na conversa e refeito do zero quando for preciso, a partir de três coisas que já existem: o prazo do briefing, o relógio e os artefatos como estão agora. Não é gravado em arquivo, não marca etapa concluída e não cria aceite: quem volta ao projeto relê o briefing, olha o que existe e recalcula.

## 1. O que não se negocia

Antes de dividir o tempo, liste os requisitos bloqueantes do briefing e do destino: a duração máxima, o formato do arquivo, o crédito exigido, os direitos e as licenças, a narração em off no modo `jam`. Cada um diz de que artefato depende e quem é o dono. Dois se conferem na primeira hora, porque descobertos tarde custam o filme:

- **Formato.** O projeto renderiza em 1920×1080 a 30 fps (`src/format.ts`). O que o `ffmpeg` converte sem mudar a imagem (contêiner, codec, taxa, volume, resolução menor na mesma proporção) é da montagem. Outra proporção ou outra taxa de quadros é mudança de código e de toda composição: diga isso ao usuário antes de qualquer cena ser desenhada.
- **Direitos.** A voz gerada tem a restrição de uso não comercial que a nota local do projeto (`README.md`) registra (CC-BY-NC): é aviso, e a licença oficial, com sua aplicação aos pesos e à saída, está a conferir na fonte oficial vigente, com fonte e data registradas antes do uso (`narracao.md`); a trilha é gerada e os efeitos vêm do catálogo. Se o briefing traz regra sobre IA, licença ou autoria, o `diretor-publicacao` confere o inventário contra ela antes de a voz ser gerada (`diretor-publicacao/submissao/pacote-de-evento.md`); se o briefing não a traz, a pergunta vai ao usuário.

Regra que o briefing não fornece não é suposta: fica como pergunta aberta, com o que depende dela.

## 2. O que custa

Os custos medidos neste repositório são ordens de grandeza, e mudam com a máquina: refaça a conta com o tempo que o próprio primeiro trabalho levou.

| Trabalho | Custo |
|---|---|
| `pnpm narrate` | minutos de GPU; depois, cada frase que muda regera só ela |
| conferência da voz no `pnpm voice` | cerca de dez minutos do usuário por vídeo, e 30 s por rodada de frase regerada |
| `pnpm music` | de quatro a cinco minutos por leito, de três a quatro por momento |
| `pnpm scene` | segundos por cena |
| `pnpm render` | depende da GPU e do processador; a taxa do primeiro render, em quadros por segundo, dá o tempo do resto (ela muda com a máquina, e a conta sai da taxa do próprio primeiro render) |
| `pnpm sfx` | depende da internet e do ouvido do usuário para cada som novo |

`pnpm setup:tools` baixa cerca de 20 GB: as ferramentas já precisam estar instaladas quando o relógio começa. O recurso mais escasso é a atenção do usuário, e não a GPU: voz, música e conjunto só ele julga. Junte o que pede ouvido ou decisão dele em poucas paradas, com hora combinada, em vez de interrompê-lo a cada geração.

## 3. Os marcos

Conte de trás para a frente, a partir do prazo, e diga cada marco como um horário:

1. **Envio**: o prazo, menos a margem. O upload e o formulário são do usuário e levam o tempo dele.
2. **Congelamento**: daqui em diante só entra conserto de bloqueante. Montagem, verificações e pacote cabem depois dele.
3. **Filme inteiro montável**: todas as cenas existem, no nível em que estiverem.
4. **Voz conferida**: fixa o tempo de tudo que vem em cima dela.
5. **Texto pronto para a voz**: com `shots` em toda cena, que o `pnpm narrate` exige.
6. **Premissa e intenção decididas** pelo usuário.

Como ponto de partida (**proposta**: ainda não foi usada num jam): margem e entrega, um quinto do tempo; premissa, texto e voz, um quarto; imagem, quase a metade; o som corre ao lado da imagem depois da voz. O pacote de publicação é escrito em paralelo, assim que o roteiro existe. As proporções cedem ao filme: um curta sem personagem novo pede menos desenho, e um que depende de uma atuação pede mais.

**Um filme válido cedo.** Assim que há voz, monte o filme inteiro no nível que houver (os quadros do animatic com a voz e, se já existe, o leito) e confira-o contra os requisitos do destino. Desse ponto em diante existe sempre um arquivo que poderia ser enviado, e cada melhora o sobrescreve no mesmo endereço.

## 4. O nível de polimento

O tempo que resta decide até onde o acabamento vai. Os requisitos bloqueantes valem nos três níveis.

| Nível | Texto e voz | Imagem | Som |
|---|---|---|---|
| essencial | a história se entende de primeira; a fala está inteira e certa | toda cena legível, com a composição final e o movimento mínimo: entradas e cortes | um leito, sem momentos; efeito só onde o sentido depende dele |
| acabado | o mesmo, com o relevante corrigido | atuação e câmera nas viradas; o resto simples | níveis ajustados nas viradas; os efeitos principais |
| polido | o padrão do modo `canal` | o padrão do modo `canal` | o padrão do modo `canal` |

O nível é execução, e quem o escolhe é o agente, dizendo qual é e por quê. Ele vale para o filme inteiro: uma cena polida ao lado de três inacabadas quebra a unidade mais do que quatro cenas simples. O limite de rodadas de cada nível está em `equipe/protocolo.md`.

## 5. A contingência

O corte é combinado antes de o tempo faltar, do que menos custa à frase de intenção para o que mais custa:

1. o polimento de movimento fora das viradas;
2. os efeitos que não carregam sentido;
3. os momentos da trilha, ficando o leito;
4. planos fundidos dentro de uma cena, sem mudar o que ela diz;
5. uma cena inteira.

Os quatro primeiros são do dono do artefato, ditos na conversa. O quinto muda o texto e a voz: volta ao `diretor-criativo`, e ao usuário quando muda o que o filme diz. Marco estourado desce um nível ou aciona o próximo corte, na hora; não se empurra o marco seguinte para preservar o acabamento.

Para as falhas de ferramenta:

- **A voz não sai ou sai errada.** Outras tomadas e o diagnóstico de `narracao-diagnostico.md`; a frase que não cede volta ao `diretor-criativo` para reescrita. Não há outra ferramenta de voz instalada: o que não se resolve é dito ao usuário, sem instalar nem improvisar outra.
- **A trilha não serve.** Outra semente; depois, um leito mais simples. O vídeo renderiza sem música: entregar assim é saída válida, dita ao usuário.
- **O render falha.** `pnpm scene` na cena que falhou e `pnpm join`, em vez do render inteiro.
- **Sem internet.** Só o `pnpm sfx` depende dela: valem os efeitos do catálogo.

## Entrega do plano

Diga na conversa: os requisitos bloqueantes com o dono de cada um, os marcos como horários, o nível de polimento com o motivo, a ordem de corte, e o que vai precisar do usuário e quando (decisões, escuta, envio). Quando um marco passa, diga o que mudou e o que saiu.

Pronto quando o usuário sabe o que será entregue no prazo, o que pode sair e em que horas ele será chamado, e nenhuma regra do destino ficou suposta.
