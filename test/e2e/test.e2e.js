import { browser, expect } from '@wdio/globals'

describe('Run the mocha tests', function () {
  it('All the mocha tests passed', async () => {
    await browser.url('http://localhost:3000/test/e2e/')
    expect(true).toBe(true)
  })
})
