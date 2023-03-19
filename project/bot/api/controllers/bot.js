const challenge = require("./adminbot");
const puppeteer = require('puppeteer');

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const launchRequest = async (url) => {
    const browser = await puppeteer.launch({
        headless: false,
        pipe: true,
        // dumpio: true,
        args: ['--js-flags=--jitless', '--no-sandbox'],
    });
    const ctx = await browser.createIncognitoBrowserContext();
    await Promise.race([
        challenge.handler(url, ctx),
        sleep(challenge.timeout),
    ]);
    await browser.close();
};

const fetchURL = async (req, res, _) => {
    const url = decodeURIComponent(req.query.url);
    console.log(url);

    try {
        launchRequest(url);
        return res.status(200).json({
            status: true,
        });
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    fetchURL
};