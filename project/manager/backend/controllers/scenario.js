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

module.exports = { getScenarios };