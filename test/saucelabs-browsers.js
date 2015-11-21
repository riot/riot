// we will re-enable the broken browsers once saucelabs will fix all the timeout issues
module.exports = {
  browsers: {
  /*sliphone: {
      base: 'SauceLabs',
      browserName: 'iphone',
      deviceName: 'iPhone 6 Plus',
      platform: 'iOS',
      version: '9.1'
    },
    slipad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      platform: 'iOS',
      deviceName: 'iPad 2',
      version: '9.1'
    },*/

/*    slsafari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },
    slsafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10'
    },
    slsafari7: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9'
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
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: '20.10240'
    },*/
    slandroid5: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1'
    },
    slchrome: {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    slfirefox: {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    slandroid4: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.0'
    }
  }
}
