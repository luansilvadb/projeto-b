# Acervo

Depois que o usuário publicar o vídeo, guarde em `acervo/<vídeo>/` o que foi ao ar: `out/<vídeo>/<vídeo>.final.mp4`, `public/videos/<vídeo>/` (narração e trilha), a thumbnail final e um PNG de cada folha de modelo (`pnpm exec remotion still <folha> acervo/<vídeo>/<folha>.png`).

A pasta é escrita uma vez e nunca sobrescrita: preserva a cópia publicada mesmo que os arquivos de origem mudem. `publication.md` continua sendo o registro versionado do pacote de texto.

Pronto quando os arquivos publicados estão copiados para `acervo/<vídeo>/` e o usuário recebe o caminho dessa cópia.
