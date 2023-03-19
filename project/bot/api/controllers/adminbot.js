const fs = require('fs')
const path = require('path')
const flag = fs.readFileSync(path.resolve(__dirname, 'flag.txt'), 'utf8');

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

module.exports = {
  name: 'impossible-xss admin bot',
  // urlRegex: /^https:\/\/impossible-xss.mc.ax\//,
  timeout: 10000,
  handler: async (url, ctx) => {
    const page = await ctx.newPage();
    await page.goto('https://google.com', { timeout: 3000, waitUntil: 'domcontentloaded' });

    // you wish it was that easy
    await page.setCookie({
      "name": "FLAG",
      "value": flag,
      "domain": "impossible-xss.mc.ax",
      "path": "/",
      "httpOnly": true,
      "secure": true,
      "sameSite": "Strict"
    });
    await page.setJavaScriptEnabled(false);

    await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' });
    await sleep(3000);
  }
};
