const fs = require('fs');
const path = require('path');
const token = fs.readFileSync(path.resolve(__dirname, './admin.txt'), 'utf8');

const sleep = (t) => new Promise((r) => setTimeout(r, t))

module.exports = {
    name: 'gift admin bot',
    timeout: 10000,
    handler: async (url, ctx) => {
        const page = await ctx.newPage()
        await page.goto('https://gift.mc.ax/login/', {
            timeout: 3000,
            waitUntil: 'domcontentloaded'
        })
        await page.evaluate(async (token) => {
            await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    name: crypto.randomUUID(),
                    admin: token.trim(),
                }),
            })
        }, token)

        await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' })
        await sleep(3000)
    },
}
