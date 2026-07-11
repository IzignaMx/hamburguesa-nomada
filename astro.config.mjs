import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://nomada.izignamx.com",
  output: "static",
  build: {
    format: "directory"
  }
});
