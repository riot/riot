module.exports = {
  browsers: {
    slPhone: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '12.0',
    },
    slIpad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      version: '12.0',
    },
    slAndroid: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '10.0',
    },
    slSafari12: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.13'
    },
    slEdge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10'
    },
    slChrome: {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    slFirefox: {
      base: 'SauceLabs',
      browserName: 'firefox'
    }
  }
}
