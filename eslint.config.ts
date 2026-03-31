import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import oxlint from "eslint-plugin-oxlint";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  oxlint.configs["flat/recommended"],
  prettier,
  {
    ignores: ["dist/", ".wrangler/"],
  },
);
