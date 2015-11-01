module.exports = {
  browsers: {
    sliphone: {
      base: 'SauceLabs',
      browserName: 'iphone',
      deviceName: 'iPhone 6 Plus',
      platform: 'iOS',
      version: '9.1',
      group: 0
    },
    slipad: {
      base: 'SauceLabs',
      browserName: 'ipad',
      platform: 'iOS',
      deviceName: 'iPad 2',
      version: '9.1',
      group: 0
    },

    slsafari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11',
      group: 1
    },
    slsafari8: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10',
      group: 1
    },
    slsafari7: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9',
      group: 2
    },
    slIE9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
      group: 2
    },
    slIE10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10',
      group: 3
    },
    slIE11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11',
      group: 3
    },
    slEdge: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: '20.10240',
      group: 4
    },
    slandroid5: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1',
      group: 4
    },
    slchrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      group: 5
    },
    slfirefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      group: 5
    },
    slandroid4: {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.0',
      group: 6
    }
  }
}