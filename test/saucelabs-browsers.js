// we will re-enable the broken browsers once saucelabs will fix all the timeout issues
module.exports = {
  browsers: {
/*    slIphone5: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '8.4'
    },
    */
    slIphone6: {
      base: 'SauceLabs',
      browserName: 'iphone',
      version: '9.3'
    },
    slIpad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      version: '9.3'
    },
    slSafari7: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9'
    },
/*    slSafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10'
    },*/
 /*   slSafari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },*/
/*    slIE9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9'
    },*/
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
    slAndroid6: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '6.0'
    }
  }
}
