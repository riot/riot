const config = require('./rollup.config')
const babel = require('rollup-plugin-babel')

module.exports = {
  ...config,
  plugins: [
    ...config.plugins,
    babel({
      ignore: [/[/\\]core-js/, /@babel[/\\]runtime/],
      env: {
        test: {
          plugins: [
            [
              'istanbul',
              {
                exclude: [
                  '**/*.spec.js'
                ]
              }
            ]
          ]
        }
      },
      presets: [
        ['@babel/env',
          {
            useBuiltIns: 'usage',
            modules: false,
            targets: {
              'edge': 15
            }
          }]]
    })
  ]
}