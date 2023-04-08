const fs = require('fs');
const path = require('path');
const flag = fs.readFileSync(path.resolve(__dirname, './flag.txt'), 'utf8');

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

module.exports = {
  name: 'jnotes admin bot',
  urlRegex: /^https?:\/\/.*\//,
  timeout: 10000,
  handler: async (url, ctx) => {
    const page = await ctx.newPage();
    await page.goto('https://jnotes.mc.ax', { timeout: 3000, waitUntil: 'domcontentloaded' });
    await page.setCookie({
      name: "FLAG",
      value: flag,
      domain: "jnotes.mc.ax",
      path: "/",
      secure: true,
      httpOnly: true
    });

    await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' });
    await sleep(3000);
  }
}
