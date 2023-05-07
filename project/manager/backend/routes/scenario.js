const { getScenarios, checkFlag, runScenario, cancelScenario } = require("../controllers/scenario");

const express = require("express");
const router = express.Router();

router.get('/', getScenarios);

router.post('/:scenarioID/flag', checkFlag);

router.post('/', runScenario);

router.delete('/', cancelScenario);

module.exports = router;