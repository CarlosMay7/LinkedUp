import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      eqeqeq: ["error", "always"], 
      curly: ["error", "all"], 
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-duplicate-imports": "error",
      "prefer-const": "warn", 
      "no-var": "error", 

      "react/self-closing-comp": "warn",
      "react-hooks/rules-of-hooks": "error", 
      "react-hooks/exhaustive-deps": "warn", 
    }

  },
]);
