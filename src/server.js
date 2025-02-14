require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const gameRoutes = require("./Routes/gameRoutes");

const app = express();
const PORT = process.env.SERVER_PORT;

app.use(express.json());

app.use('/game', gameRoutes);

if (process.env.NODE_ENV !== 'test') {
  sequelize.sync().then(() => {
    console.log("Database connected.");
    app.listen(PORT, () => console.log(`Server running on port:${PORT}`));
  }).catch(error => console.log("Database Connection error: ", error));
}

module.exports = app;