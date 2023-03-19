const { fetchURL } = require("../controllers/bot");

const express = require("express");
const router = express.Router();

router.get('/', fetchURL);

module.exports = router;