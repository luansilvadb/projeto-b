# Acervo

Depois que o usuário publicar o vídeo ou enviá-lo ao evento, guarde em `acervo/<vídeo>/` o que foi ao ar: `out/<vídeo>/<vídeo>.final.mp4`, o `.jam.mp4` quando foi ele o enviado, `public/videos/<vídeo>/` (narração e trilha), a thumbnail ou o cartaz final e um PNG de cada folha de modelo (`pnpm exec remotion still <folha> acervo/<vídeo>/<folha>.png`).

A pasta é escrita uma vez e nunca sobrescrita: preserva a cópia publicada mesmo que os arquivos de origem mudem. `publication.md` continua sendo o registro versionado do pacote de texto.

Com dois destinos, a cópia é feita no primeiro envio e o que o segundo acrescenta entra sem sobrescrever o que já está lá.

Pronto quando os arquivos publicados estão copiados para `acervo/<vídeo>/` e o usuário recebe o caminho dessa cópia.
