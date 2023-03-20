const express = require('express');
const app = express();
const port = 8000;

const botRoutes = require("./routes/botRoute");

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

app.use("/bot", botRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});