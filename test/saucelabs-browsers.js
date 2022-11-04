module.exports = {
  browsers: {
    sl_ios_safari: {
      base: 'SauceLabs',
      deviceName: 'iPhone 11 Simulator',
      platformVersion: '13.4',
      platformName: 'iOS',
      browserName: 'Safari',
      appiumVersion: '1.17.1',
      deviceOrientation: 'portrait'
    },
    slEdge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 11'
    },
    slChrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 11'
    }
    // Firefox seems to be no longer working on saucelabs https://github.com/mochajs/mocha/pull/4933
    /*slFirefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 11'
    }*/
  }
}
