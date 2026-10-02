import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Sem isto o Vitest também rodaria os testes das ferramentas em vendor/.
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
