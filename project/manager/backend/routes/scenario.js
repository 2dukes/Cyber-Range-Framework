const { getScenarios, checkFlag, runScenario } = require("../controllers/scenario");

const express = require("express");
const router = express.Router();

router.get('/', getScenarios);

router.post('/:scenarioID/flag', checkFlag);

router.post('/:scenarioID', runScenario)

module.exports = router;