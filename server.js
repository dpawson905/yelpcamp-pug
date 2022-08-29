const debug = require("debug")("yelpcamp:server");
const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  // debug(process.env)
}
const app = require("./app");

const DB = process.env.DB_URL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => debug("DB connection successful!"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  debug(`App running on port ${port}...`);
});