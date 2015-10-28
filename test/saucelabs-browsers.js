module.exports = {
  browsers: {
/*
    they do not work on saucelabs
    Maybe one day we will switch to another testing platform
    or we will just wait that saucelabs fixes the issue
    sliphone: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'iOS',
      version: '9.1',
      group: 0
    },
    slipad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      platform: 'iOS',
      version: '9.1',
      group: 0
    },
*/
    slsafari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11',
      group: 0
    },
    slsafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10',
      group: 0
    },
    slsafari7: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9',
      group: 0
    },
    slIE9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
      group: 1
    },
    slIE10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10',
      group: 1
    },
    slIE11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11',
      group: 1
    },
    slEdge: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: '20.10240',
      group: 2
    },
    slandroid5: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1',
      group: 2
    },
    slchrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      group: 2
    },
    slfirefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      group: 3
    },
    slandroid4: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.0',
      group: 3
    }
  }
}