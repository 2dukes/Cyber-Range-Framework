const challenge = require("./adminbot");
const puppeteer = require('puppeteer');

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const launchRequest = async (url) => {
    const browser = await puppeteer.launch({
        headless: true,
        // pipe: true,
        args: [
            "--js-flags=--jitless",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox"
        ],
    });
    const ctx = await browser.createIncognitoBrowserContext();
    await Promise.race([
        challenge.handler(url, ctx),
        sleep(challenge.timeout),
    ]);
    await browser.close();
};

const fetchURL = async (req, res, _) => {
    const url = decodeURIComponent(req.query?.url);
    console.log(req.cookies);

    try {
        const regex = challenge.urlRegex ?? /^https?:\/\/.*/;
        if (!regex.test(url))
            throw new Error('Invalid URL');

        launchRequest(url);
        return res.status(200).json({
            status: true,
        });
    } catch (err) {
        return res.status(200).json({
            status: true,
            msg: err.toString()
        });
    }
};

module.exports = {
    fetchURL
};