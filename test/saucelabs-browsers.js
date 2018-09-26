// we will re-enable the broken browsers once saucelabs will fix all the timeout issues
module.exports = {
  browsers: {
    slIpad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      version: '10.3'
    },
    slIphone6: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '10.3'
    },
    slSafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10'
    },
    slSafari10: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },
    slSafari11: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.13'
    },
    slIE9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9'
    },
    slIE10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10'
    },
    slIE11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '11'
    },
    slEdge14: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      version: '14',
      platform: 'Windows 10'
    },
    slEdge15: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      version: '15',
      platform: 'Windows 10'
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
    },
    slAndroid5: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1'
    },
    slAndroid4: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.4'
    }
  }
}
