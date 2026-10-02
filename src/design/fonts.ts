import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { typography } from "./tokens";

// Arquivo local, para o render não depender de rede. A fonte é variável:
// um único arquivo cobre todos os pesos. O loadFont segura o render até carregar.
loadFont({
  family: typography.family,
  url: staticFile("fonts/inter-latin-wght-normal.woff2"),
  weight: "100 900",
});
