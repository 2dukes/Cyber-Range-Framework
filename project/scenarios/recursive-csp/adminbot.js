const fs = require('fs');
const path = require('path');
const flag = fs.readFileSync(path.resolve(__dirname, './flag.txt'), 'utf8');

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

module.exports = {
  name: 'recursive-csp admin bot',
  urlRegex: /^https:\/\/recursive-csp\.mc\.ax\//,
  timeout: 10000,
  handler: async (url, ctx) => {
    const page = await ctx.newPage();
    await page.goto('https://recursive-csp.mc.ax', { timeout: 3000, waitUntil: 'domcontentloaded' });
    await page.evaluate(flag => {
        document.cookie = `flag=${flag}`;
    }, flag);
    await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' });
    await sleep(3000);
  }
}
