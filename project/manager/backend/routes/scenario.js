const { getScenarios, checkFlag } = require("../controllers/scenario");

const express = require("express");
const router = express.Router();

router.get('/', getScenarios);

router.post('/:scenarioID', checkFlag);

module.exports = router;