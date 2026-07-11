import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import oxlint from "eslint-plugin-oxlint";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
  oxlint.configs["flat/recommended"],
  prettier,
  globalIgnores(["dist/", ".wrangler/"]),
);
