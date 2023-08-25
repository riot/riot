module.exports = {
  browsers: {
    sl_ios_safari: {
      base: 'SauceLabs',
      deviceName: 'iPhone Simulator',
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
    },
    // Firefox seems to be no longer working on saucelabs https://github.com/karma-runner/karma-sauce-launcher/issues/275
    /*slFirefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
    },*/
  },
}
