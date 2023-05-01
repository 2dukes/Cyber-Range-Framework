const { getScenarios } = require("../controllers/scenario");

const express = require("express");
const router = express.Router();

router.get('/', getScenarios);

module.exports = router;