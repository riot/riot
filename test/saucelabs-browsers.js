module.exports = {
  browsers: {
    slIpadLatest: {
      base: 'SauceLabs',
      browserName: 'safari',
      deviceName: 'iPad',
      version: 'latest',
      platform: 'iOS'
    },
    slIpadOld: {
      base: 'SauceLabs',
      browserName: 'safari',
      deviceName: 'iPad',
      version: 'latest-1',
      platform: 'iOS'
    },
    slIphoneLatest: {
      base: 'SauceLabs',
      browserName: 'safari',
      deviceName: 'iPhone',
      version: 'latest',
      platform: 'iOS'
    },
    slIphoneOld: {
      base: 'SauceLabs',
      browserName: 'safari',
      deviceName: 'iPhone',
      version: 'latest-1',
      platform: 'iOS'
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
