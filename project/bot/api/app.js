const express = require('express');
const app = express();
const port = 8000;

const botRoutes = require("./routes/botRoute");

app.use("/bot", botRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});