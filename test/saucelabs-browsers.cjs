module.exports = {
  browsers: {
    sl_ios_safari: {
      base: 'SauceLabs',
      deviceName: 'iPhone',
      platformVersion: '14.5',
      platformName: 'iOS',
      browserName: 'Safari',
      deviceOrientation: 'portrait',
    },
    slEdge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 11',
    },
    slChrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Linux',
    },
    // Firefox seems to be no longer working on saucelabs https://github.com/mochajs/mocha/pull/4933
    slFirefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Linux',
    },
  },
}
