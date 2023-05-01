const path = require("path");
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = 8000;

app.use(express.static(path.join(__dirname, 'public')));

const scenarioRoutes = require("./routes/scenario");

const errorMiddleware = require("./middleware/error");

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    ); // * could be replaced by a domain. Allow different origins to access our data.
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE"); // Allow origins to use specific HTTP methods.
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie"); // Headers that clients might set on their requests.

    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/scenarios", scenarioRoutes);

app.use(errorMiddleware);

const MONGODB_URI = `mongodb://admin:UTJtbKxUzoxQ3arP@mongodb:27017/?authMechanism=DEFAULT`;

mongoose.set("strictQuery", false);
mongoose
    .connect(MONGODB_URI)
    .then((_) => {
        console.log(
            `Listening at: http://localhost:${port}`
        );
        app.listen(port);
    })
    .catch((err) => console.log(err));