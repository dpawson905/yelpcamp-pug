const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const {
  checkIfNotVerified
} = require("../middleware");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

// verify route
router.get("/verify/token", catchAsync(users.verifyFromEmail));

// resend token route
router.post("/resend-token", catchAsync(users.newVerificationToken));

// forgot password routes
router
  .route("/forgot-password")
  .get(catchAsync(users.verifyPasswordToken))
  .post(catchAsync(users.newPasswordResetToken))
  .put(catchAsync(users.changePassword));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    catchAsync(checkIfNotVerified),
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/user/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
