const fs = require('fs');
const path = require('path');
const flag = fs.readFileSync(path.resolve(__dirname, './challenge/flag.txt'), 'utf8');

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

module.exports = {
  name: 'codebox admin bot',
  urlRegex: /^https:\/\/codebox\.mc\.ax\/\?code=.*$/,
  timeout: 10000,
  handler: async (url, ctx) => {
    const page = await ctx.newPage();
    await page.goto('https://codebox.mc.ax', { timeout: 3000, waitUntil: 'domcontentloaded' });
    await page.evaluate(flag => {
        localStorage.setItem('flag', flag);
    }, flag);
    await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' });
    await sleep(3000);
  }
}
