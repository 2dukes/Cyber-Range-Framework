const { Scenario } = require("../models/Scenario");

const getScenarios = async (req, res, next) => {
    const { solved } = req.query;

    try {
        const scenarios = await Scenario.find({ solved: solved === 'true' });

        return res.status(200).json({
            status: true,
            scenarios
        });
    } catch (err) {
        next(err);
    }
};

const checkFlag = async (req, res, next) => {
    const id = req.params.scenarioID;
    const { flag } = req.body;

    try {
        const scenario = await Scenario.findOne({ _id: id });

        const flagCheck = scenario.flag === flag;

        if (flagCheck) {
            scenario.solved = true;
            await scenario.save();
        }

        return res.status(200).json({
            status: flagCheck
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getScenarios, checkFlag };