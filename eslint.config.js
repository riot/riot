import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import riotEslintConfig from 'eslint-config-riot'

export default defineConfig([
  globalIgnores(['test/e2e/test.bundle.js']),
  importPlugin.flatConfigs.recommended,
  { extends: [riotEslintConfig] },
  {
    rules: {
      'fp/no-rest-parameters': 0,
      'fp/no-mutating-methods': 0,
      'jsdoc/no-undefined-types': 0,
    },
  },
])
