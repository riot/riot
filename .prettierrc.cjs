module.exports = {
  ...require('@riotjs/prettier-config'),
  overrides: [
    {
      files: ['*.riot'],
      options: {
        parser: 'html',
      },
    },
  ],
}
