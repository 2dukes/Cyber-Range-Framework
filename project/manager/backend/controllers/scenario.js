const { Scenario } = require("../models/Scenario");

const getScenarios = async (req, res, next) => {
    try {
        const scenarios = await Scenario.find();

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
    const flag = req.query.flag;

    try {
        const scenario = await Scenario.findOne({ id });

        return res.status(200).json({
            status: scenario.flag === flag
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getScenarios, checkFlag };