const { getScenarios, checkFlag, runScenario, cancelScenario } = require("../controllers/scenario");

const express = require("express");
const router = express.Router();

router.get('/', getScenarios);

router.post('/:scenarioID/flag', checkFlag);

router.post('/:scenarioID', runScenario);

router.delete('/:scenarioID', cancelScenario);

module.exports = router;