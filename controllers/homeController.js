const express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const games = mongoose.model("games");

router.get("/", (req, res) => {
  res.render("home/appHome", {});
});

module.exports = router;
