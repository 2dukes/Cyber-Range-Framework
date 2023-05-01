const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scenarioSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    targets: {
        type: String,
        required: true,
    },
    bot: {
        type: String,
        required: true,
    }
});

const Scenario = mongoose.model("Scenario", scenarioSchema);

module.exports = { Scenario };