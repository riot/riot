/* eslint-disable */
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
/* eslint-enable */
import riot from 'rollup-plugin-riot'

export default {
  input: './test/e2e/index.js',
  plugins: [nodeResolve(), commonjs(), riot()],
  external: ['chai', 'sinon'],
  treeshake: false,
  output: {
    globals: { chai: 'chai', sinon: 'sinon' },
    file: './test/e2e/test.bundle.js',
    format: 'es',
    sourcemap: 'inline',
  },
}
