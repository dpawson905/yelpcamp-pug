const crypto = require("crypto");
const Email = require("../utils/emailHelper");
const helpers = require("../utils/helpers");

var kickbox = require("kickbox").client(process.env.KICKBOX_API_KEY).kickbox();

const Token = require("../models/token");
const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    await kickbox.verify(req.body.email, async function (err, response) {
      const { result, reason } = response.body;
      if (result === "deliverable" && reason === "accepted_email") {
        const { email, username, password } = req.body;
        const user = new User({
          email,
          username,
          isVerified: true,
          expires: undefined,
        });
        await User.register(user, password);
        req.flash(
          "success",
          "Thanks for registering, please login with your email and password."
        );
        return res.redirect("/user/login");
      }
      const { email, username, password } = req.body;
      const user = new User({
        email,
        username,
        isVerified: false,
        expires: Date.now(),
      });
      const registeredUser = await User.register(user, password);
      const userToken = new Token({
        _userId: registeredUser._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      await userToken.save();
      const url = helpers.setUrl(
        req,
        "verify",
        `token?token=${userToken.token}`
      );
      await new Email(user, url).sendWelcome("YelpCamp");
      req.flash(
        "success",
        "Thanks for registering, Please check your email to verify your account. Link expires in 10 minutes"
      );
      return res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/user/register");
  }
};
// Email verification goes here
module.exports.verifyFromEmail = async (req, res, next) => {
  try {
    const token = await Token.findOne({ token: req.query.token });
    if (!token) {
      req.flash("error", "Token is invalid");
      return res.redirect("/campgrounds");
    }
    const user = await User.findOne({ id: token._userId });
    user.isVerified = true;
    user.expires = undefined;
    await user.save();
    await token.remove();
    await req.login(user, (err) => {
      req.flash("success", `Welcome to YelpCamp ${user.username}`);
      const redirectUrl = req.session.redirectTo || "/campgrounds";
      delete req.session.redirectTo;
      return res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/campgrounds");
  }
};

// Request New Token
module.exports.newVerificationToken = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "This account does not exist");
      return res.redirect("/register");
    }
    if (user && user.isVerified) {
      req.flash(
        "error",
        "You have already verified your account. Please log in."
      );
      return res.redirect("/user/login");
    }
    const userToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await userToken.save();
    const url = helpers.setUrl(req, "verify", `token?token=${userToken.token}`);
    await new Email(user, url).sendWelcome("Yelpcamp - New Token");
    req.flash(
      "success",
      "Please check your email to verify your account. Link expires in 10 minutes"
    );
    return res.redirect("/campgrounds");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/campgrounds");
  }
};

// new password reset token
module.exports.newPasswordResetToken = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "This account does not exist");
      return res.redirect("/user/register");
    }
    const userToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await userToken.save();
    const url = helpers.setUrl(
      req,
      "forgot-password",
      `?token=${userToken.token}`
    );
    await new Email(user, url).sendPasswordReset();
    req.flash("success", "Please check your email to reset your pasword.");
    return res.redirect("/campgrounds");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/campgrounds");
  }
};

// verify password token
module.exports.verifyPasswordToken = async (req, res, next) => {
  try {
    const passwordToken = await Token.findOne({ token: req.query.token });
    if (!passwordToken) {
      req.flash(
        "error",
        "Token is invalid or expired, please request a new password reset token."
      );
      return res.redirect("/user/login");
    }
    return res.render("users/change-password", { passwordToken });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/campgrounds");
  }
};

// Change password
module.exports.changePassword = async (req, res, next) => {
  try {
    let { password, password2 } = req.body;
    if (password !== password2) {
      req.flash(
        "error",
        "Passwords do not match. Click the link in your email to try again"
      );
      return res.redirect("/user/login");
    }
    const token = await Token.findOne({ token: req.body.token });
    if (!token) {
      req.flash(
        "error",
        "Token is invalid, please try to reset your password again."
      );
      return res.redirect("/user/login");
    }
    const user = await User.findOne({ _id: token._userId });
    await user.setPassword(req.body.password, async (err) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/campgrounds");
      }
      delete req.body.password2;
      user.attempts = 0;
      user.expires = undefined;
      let url = helpers.setUrl(req, "login", "");
      await new Email(user, url).sendPasswordChange();
      await user.save();
      req.flash(
        "success",
        "Your password has been successfully updated. Please login using your new password"
      );
      res.redirect("/user/login");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/campgrounds");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "welcome back!");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout(() => {
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
