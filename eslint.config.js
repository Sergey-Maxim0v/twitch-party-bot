import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        plugins: {
            '@stylistic': stylistic
        },
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/indent': ['error', 2],
            '@stylistic/quotes': ['error', 'single'],

            'no-restricted-syntax': [
                'warn',
                {
                    selector: "CallExpression[callee.object.name='console'][callee.property.name='log']",
                    message: 'Использование console.log запрещено. Используйте console.info, console.warn, console.error для логирования.',
                },
            ],
        },
    },
])
