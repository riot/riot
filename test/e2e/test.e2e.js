import { browser, expect } from '@wdio/globals'

describe('Run the mocha tests', function () {
  it('All the mocha tests passed', async () => {
    await browser.url('http://localhost:3000/test/e2e/')
    await browser.waitUntil(async () =>
      browser.execute(() => typeof window.testFailures === 'number'),
    )
    const testFailures = await browser.execute(() => window.testFailures)

    expect(testFailures).toBe(0)
  })
})
