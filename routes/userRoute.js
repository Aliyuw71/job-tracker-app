const express = require("express");
const userRouter = express.Router();
const { register, login, updateUser } = require("../controller/user");
const authenticator = require("../middleware/authenticator");
const rateLimiter = require("express-rate-limit");

const tryLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    msg: "Too many request from this IP, please try again after 15mins",
  },
});
userRouter.route("/register").post(tryLimiter, register);
userRouter.route("/login").post(tryLimiter, login);
userRouter.route("/update").patch(authenticator, updateUser);
module.exports = userRouter;
