require('dotenv').config();
const { Scenario } = require("../models/Scenario");
const { exec } = require("node:child_process");
const fs = require('fs');

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

        if (flagCheck)
            scenario.solved = true;
        else
            scenario.solved = false;

        await scenario.save();

        return res.status(200).json({
            status: flagCheck
        });
    } catch (err) {
        next(err);
    }
};

const cancelScenario = async (req, res, next) => {
    try {
        exec("echo 'kill -9 $(ps -aux | grep \"websocketd --port=8080 ./script_pipe.sh\" | head -n 1 | tr -s \" \" | cut -d \" \" -f 2) ; docker rm -f $(docker ps -a | grep -Ewv \"mongodb|backend|frontend|CONTAINER\" | cut -d \" \" -f1) 1>/dev/null 2>&1' > cancel_mypipe", (err, output) => {
            // once the command has completed, the callback function is called
            if (err) {
                // log and return if we encounter an error
                console.error("Could not execute command: ", err);
                return;
            }
        });

        return res.status(200).json({
            status: true
        });
    } catch (err) {
        next(err);
    }
};

const runScenario = async (req, res, next) => {
    const { scenario_name } = req.body;

    try {
        const dataJSON = JSON.parse(fs.readFileSync("scenarios.json"));
        const challenge_names = Object.keys(dataJSON);

        // Prevent Malicious Crafted Strings
        if (!challenge_names.includes(scenario_name))
            throw new Error("Invalid scenario name.");

        let playbook_name;
        if (scenario_name === "active-directory")
            playbook_name = "setup_win_ad.yml";
        else if (scenario_name === "ransomware")
            playbook_name = "setup_win_ransomware.yml";
        else
            playbook_name = "setup_containers.yml";

        const cmd = `echo 'cd .. && ./switch_challenge.sh ${scenario_name} && ansible-playbook ${playbook_name} && cd manager' > mypipe`
        exec(cmd, (err, output) => {
            // once the command has completed, the callback function is called
            if (err) {
                // log and return if we encounter an error
                console.error("Could not execute command: ", err);
                return;
            }
        });

        return res.status(200).json({
            status: true
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getScenarios, checkFlag, runScenario, cancelScenario };