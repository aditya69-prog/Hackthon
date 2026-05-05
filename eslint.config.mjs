import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  {
    plugins: {
      react
    }
  },

  {
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }
];