// we will re-enable the broken browsers once saucelabs will fix all the timeout issues
module.exports = {
  browsers: {
/*    slIphone6: {
      base: 'SauceLabs',
      device: 'iPhone 6',
      os: 'ios',
      os_version: '9.1'
    },*/
    slIphone5: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '8.1'
    },
/*    slIpad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      platform: 'iOS',
      deviceName: 'iPad 2',
      version: '9.1'
    },*/
/*    slSafari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },
    slSafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10'
    },*/
    slSafari7: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9'
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
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: '20.10240'
    },*/
    slAndroid5: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1'
    },
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
    }
  }
}
