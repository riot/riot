// we will re-enable the broken browsers once saucelabs will fix all the timeout issues
module.exports = {
  browsers: {
    /*
    slIphone5: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '8.1'
    },
    */
/*    slIphone6: {
      base: 'SauceLabs',
      device: 'iPhone 6',
      platform: 'OS X 10.10',
      os: 'ios',
      version: '9.2'
    },
    slIpad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      platform: 'OS X 10.10',
      deviceName: 'iPad 2',
      version: '9.2'
    },*/
    slSafari7: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9'
    },
    /*
    slSafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10'
    },
    */
  /*  slSafari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },*/
    slIE9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9'
    },
    slIE10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10'
    },
    slIE11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
/*    slEdge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: '20.10240'
    },*/
    slChrome: {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    slFirefox: {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    slAndroid4: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.0'
    },
    slAndroid5: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1'
    }
  }
}
