const express = require("express");
const router = express.Router();

const { login, register } = require("../../controller/auth");
const { reset } = require("../../controller/user");
const auth = require("../../middleware/auth");

router.post("/login", login);

router.post("/register", register);

router.post("/reset", auth, reset);

module.exports = router;
