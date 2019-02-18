const config = require('./rollup.config')
const babel = require('rollup-plugin-babel')

module.exports = {
  ...config,
  plugins: [
    ...config.plugins,
    babel({
      ignore: ['node_modules/**'],
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
      }
    })
  ]
}